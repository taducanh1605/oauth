const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class App {
  constructor() {
    this.dbPath = path.join(__dirname, '..', 'db', 'users.db3');
    this.init();
  }

  // Khởi tạo bảng apps nếu chưa tồn tại
  init() {
    const db = new sqlite3.Database(this.dbPath);
    
    // Tạo bảng apps để lưu thông tin các app
    db.serialize(() => {
      db.run(`
        CREATE TABLE IF NOT EXISTS apps (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          app_name TEXT NOT NULL UNIQUE,
          app_display_name TEXT NOT NULL,
          app_description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tạo bảng app_users để lưu quan hệ giữa app và user
      db.run(`
        CREATE TABLE IF NOT EXISTS app_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          app_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          first_login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          login_count INTEGER DEFAULT 1,
          FOREIGN KEY (app_id) REFERENCES apps (id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
          UNIQUE(app_id, user_id)
        )
      `);

      // Tạo index để tối ưu hóa truy vấn
      db.run(`CREATE INDEX IF NOT EXISTS idx_app_users_app_id ON app_users(app_id)`);
      db.run(`CREATE INDEX IF NOT EXISTS idx_app_users_user_id ON app_users(user_id)`);
    });
    
    db.close();
  }

  // Tìm hoặc tạo app khi app khởi động (app registration)
  async registerOrFindApp(appData) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      const { 
        app_name, 
        app_display_name, 
        app_description = ''
      } = appData;

      if (!app_name || !app_display_name) {
        db.close();
        return reject(new Error('app_name and app_display_name are required'));
      }

      // Kiểm tra xem app đã tồn tại chưa
      db.get(
        'SELECT * FROM apps WHERE app_name = ?',
        [app_name],
        (err, existingApp) => {
          if (err) {
            db.close();
            return reject(err);
          }

          if (existingApp) {
            // App đã tồn tại, cập nhật thông tin nếu cần
            db.run(
              `UPDATE apps 
               SET app_display_name = COALESCE(?, app_display_name),
                   app_description = COALESCE(?, app_description),
                   updated_at = CURRENT_TIMESTAMP
               WHERE app_name = ?`,
              [app_display_name, app_description, app_name],
              function(err) {
                db.close();
                if (err) {
                  return reject(err);
                }
                
                resolve({
                  success: true,
                  isNew: false,
                  app: {
                    id: existingApp.id,
                    app_name: existingApp.app_name,
                    app_display_name: app_display_name || existingApp.app_display_name,
                    app_description: app_description || existingApp.app_description
                  },
                  message: 'App already registered'
                });
              }
            );
          } else {
            // App chưa tồn tại, tạo mới
            db.run(
              `INSERT INTO apps (app_name, app_display_name, app_description) 
               VALUES (?, ?, ?)`,
              [app_name, app_display_name, app_description],
              function(err) {
                if (err) {
                  db.close();
                  return reject(err);
                }

                const newAppId = this.lastID;

                // Lấy thông tin app mới tạo
                db.get(
                  'SELECT * FROM apps WHERE id = ?',
                  [newAppId],
                  (err, newApp) => {
                    db.close();
                    if (err) {
                      return reject(err);
                    }

                    resolve({
                      success: true,
                      isNew: true,
                      app: {
                        id: newApp.id,
                        app_name: newApp.app_name,
                        app_display_name: newApp.app_display_name,
                        app_description: newApp.app_description
                      },
                      message: 'App registered successfully'
                    });
                  }
                );
              }
            );
          }
        }
      );
    });
  }

  // Tạo hoặc lấy app theo tên
  async findOrCreateApp(appName, displayName = null, description = null) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      // Tìm app trước
      db.get(
        'SELECT * FROM apps WHERE app_name = ?',
        [appName],
        (err, row) => {
          if (err) {
            db.close();
            return reject(err);
          }
          
          if (row) {
            // App đã tồn tại
            db.close();
            return resolve(row);
          }
          
          // Tạo app mới
          const finalDisplayName = displayName || appName;
          const finalDescription = description || `App ${appName}`;
          
          db.run(
            `INSERT INTO apps (app_name, app_display_name, app_description) 
             VALUES (?, ?, ?)`,
            [appName, finalDisplayName, finalDescription],
            function(err) {
              if (err) {
                db.close();
                return reject(err);
              }
              
              // Lấy app vừa tạo
              db.get(
                'SELECT * FROM apps WHERE id = ?',
                [this.lastID],
                (err, newRow) => {
                  db.close();
                  if (err) return reject(err);
                  resolve(newRow);
                }
              );
            }
          );
        }
      );
    });
  }

  // Ghi nhận user login vào app
  async recordUserLogin(appId, userId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      // Kiểm tra xem user đã từng login vào app này chưa
      db.get(
        'SELECT * FROM app_users WHERE app_id = ? AND user_id = ?',
        [appId, userId],
        (err, row) => {
          if (err) {
            db.close();
            return reject(err);
          }
          
          if (row) {
            // User đã từng login, update last_login_at và login_count
            db.run(
              `UPDATE app_users 
               SET last_login_at = CURRENT_TIMESTAMP, login_count = login_count + 1 
               WHERE app_id = ? AND user_id = ?`,
              [appId, userId],
              function(err) {
                db.close();
                if (err) return reject(err);
                resolve({ isNewUser: false, loginCount: row.login_count + 1 });
              }
            );
          } else {
            // User chưa từng login vào app này, tạo record mới
            db.run(
              `INSERT INTO app_users (app_id, user_id, first_login_at, last_login_at, login_count) 
               VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)`,
              [appId, userId],
              function(err) {
                db.close();
                if (err) return reject(err);
                resolve({ isNewUser: true, loginCount: 1 });
              }
            );
          }
        }
      );
    });
  }

  // Lấy danh sách tất cả apps
  async getAllApps() {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.all(
        `SELECT a.*, COUNT(au.user_id) as user_count
         FROM apps a
         LEFT JOIN app_users au ON a.id = au.app_id
         GROUP BY a.id
         ORDER BY a.created_at DESC`,
        [],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Lấy danh sách user của một app
  async getUsersByApp(appId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.all(
        `SELECT u.id, u.name, u.email, u.provider, 
                au.first_login_at, au.last_login_at, au.login_count
         FROM app_users au
         JOIN users u ON au.user_id = u.id
         WHERE au.app_id = ?
         ORDER BY au.last_login_at DESC`,
        [appId],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Lấy danh sách app của một user
  async getAppsByUser(userId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.all(
        `SELECT a.id, a.app_name, a.app_display_name, a.app_description,
                au.first_login_at, au.last_login_at, au.login_count
         FROM app_users au
         JOIN apps a ON au.app_id = a.id
         WHERE au.user_id = ?
         ORDER BY au.last_login_at DESC`,
        [userId],
        (err, rows) => {
          db.close();
          if (err) return reject(err);
          resolve(rows);
        }
      );
    });
  }

  // Xóa app (và tất cả user liên quan)
  async deleteApp(appId) {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(this.dbPath);
      
      db.run('DELETE FROM apps WHERE id = ?', [appId], function(err) {
        db.close();
        if (err) return reject(err);
        resolve({ deletedRows: this.changes });
      });
    });
  }
}

module.exports = new App();
