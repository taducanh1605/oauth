const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

// Ensure database directory exists
const dbDir = path.join(__dirname, '..', 'db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir);
}

// Create database connection
const db = new sqlite3.Database(path.join(dbDir, 'users.db3'));

// Initialize users table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    provider TEXT,
    providerId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    role INTEGER DEFAULT 2
  )`);
});

class User {
  // Find user by ID
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(row);
      });
    });
  }

  // Find user by email
  static findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) return reject(err);
        if (!row) return resolve(null);
        resolve(row);
      });
    });
  }

  // Find user by provider ID (Google, Facebook)
  static findByProviderId(provider, providerId) {
    return new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE provider = ? AND providerId = ?', 
        [provider, providerId], 
        (err, row) => {
          if (err) return reject(err);
          if (!row) return resolve(null);
          resolve(row);
        }
      );
    });
  }

  // Create new user
  static async create(userData) {
    let { name, email, password, provider, providerId, role = 2 } = userData;
    
    // If local registration, encrypt password
    if (password) {
      const salt = await bcrypt.genSalt(10);
      password = await bcrypt.hash(password, salt);
    }

    return new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO users (name, email, password, provider, providerId, role)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, email, password, provider, providerId, role],
        function(err) {
          if (err) return reject(err);
          
          // Return created user
          User.findById(this.lastID)
            .then(user => resolve(user))
            .catch(err => reject(err));
        }
      );
    });
  }

  // Update user role
  static updateRole(userId, role) {
    return new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET role = ? WHERE id = ?',
        [role, userId],
        function(err) {
          if (err) return reject(err);
          resolve({ changes: this.changes });
        }
      );
    });
  }

  // Find users by role
  static findByRole(role) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users WHERE role = ?', [role], (err, rows) => {
        if (err) return reject(err);
        resolve(rows || []);
      });
    });
  }

  // Get user role constants
  static get ROLES() {
    return {
      ROOT: 0,
      ADMIN: 1,
      USER: 2,
      GUEST: 3
    };
  }

  // Check if user has role
  static hasRole(user, requiredRole) {
    return user && user.role <= requiredRole;
  }
}

module.exports = User;
