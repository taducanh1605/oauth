const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const App = require('../models/App');
const { verifyToken, generateToken } = require('../middleware/auth');
const router = express.Router();




/*************
*
* API routes for authentication (login/register) and user info
*
*************/

// API Login trực tiếp - không cần session (cho cross-domain)
router.post('/login', async (req, res) => {
  try {
    const { email, password, app_name, app_display_name, app_description } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email và password là bắt buộc'
      });
    }

    // Tìm user trong database
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc password không chính xác'
      });
    }

    // Kiểm tra password (chỉ với local accounts)
    if (user.provider === 'local') {
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc password không chính xác'
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: `Account này được tạo bằng ${user.provider}. Vui lòng login qua ${user.provider}.`
      });
    }

    // Xử lý app tracking nếu có app_name
    let appInfo = null;
    if (app_name) {
      try {
        // Tạo hoặc lấy app
        const app = await App.findOrCreateApp(app_name, app_display_name, app_description);
        
        // Ghi nhận user login vào app
        const loginResult = await App.recordUserLogin(app.id, user.id);
        
        appInfo = {
          app_id: app.id,
          app_name: app.app_name,
          app_display_name: app.app_display_name,
          is_new_user: loginResult.isNewUser,
          login_count: loginResult.loginCount
        };
      } catch (appError) {
        console.error('App tracking error:', appError);
        // Không fail login nếu app tracking lỗi, chỉ log
      }
    }

    // Tạo JWT token
    const token = generateToken(user);
    
    const response = {
      success: true,
      message: 'Login thành công',
      token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        provider: user.provider
      }
    };

    // Thêm app info nếu có
    if (appInfo) {
      response.app = appInfo;
    }

    res.json(response);
    
  } catch (error) {
    console.error('API Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi login'
    });
  }
});

// API Register trực tiếp - trả về JWT luôn
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // Validation
    const errors = [];
    
    if (!name || !email || !password || !password2) {
      errors.push('Vui lòng điền đầy đủ thông tin');
    }
    
    if (password !== password2) {
      errors.push('Password không khớp');
    }
    
    if (password && password.length < 6) {
      errors.push('Password phải có ít nhất 6 ký tự');
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors.join(', ')
      });
    }
    
    // Kiểm tra email đã tồn tại
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }
    
    // Tạo user mới
    const newUser = await User.create({
      name,
      email,
      password,
      provider: 'local'
    });
    
    // Tạo JWT token luôn
    const token = generateToken(newUser);
    
    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      token: token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        provider: newUser.provider
      }
    });
    
  } catch (error) {
    console.error('API Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi đăng ký'
    });
  }
});

// OAuth Flow for Google - Tạo authorization URL
router.get('/oauth/google/url', (req, res) => {
  const { redirect_uri, app_name, app_display_name, app_description } = req.query;
  
  // Tạo state để lưu redirect_uri và app info
  const state = Buffer.from(JSON.stringify({ 
    redirect_uri: redirect_uri || 'default',
    app_name: app_name || null,
    app_display_name: app_display_name || null,
    app_description: app_description || null,
    timestamp: Date.now(),
    source: 'cross_domain'
  })).toString('base64');
  
  // Sử dụng callback URL đã được đăng ký trong Google Console
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${process.env.GOOGLE_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.API_BASE + process.env.GOOGLE_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=profile email&` +
    `state=${state}`;
    
  res.json({
    success: true,
    authUrl: authUrl,
    message: 'Redirect user đến URL này để login'
  });
});

// OAuth Flow for Facebook - Tạo authorization URL
router.get('/oauth/facebook/url', (req, res) => {
  const { redirect_uri, app_name, app_display_name, app_description } = req.query;
  
  // Tạo state để lưu redirect_uri và app info
  const state = Buffer.from(JSON.stringify({ 
    redirect_uri: redirect_uri || 'default',
    app_name: app_name || null,
    app_display_name: app_display_name || null,
    app_description: app_description || null,
    timestamp: Date.now(),
    source: 'cross_domain'
  })).toString('base64');
  
  // Sử dụng callback URL đã được đăng ký trong Facebook Console
  const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?` +
    `client_id=${process.env.FACEBOOK_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.API_BASE + process.env.FACEBOOK_CALLBACK_URL)}&` +
    `response_type=code&` +
    `scope=email&` +
    `state=${state}`;
    
  res.json({
    success: true,
    authUrl: authUrl,
    message: 'Redirect user đến URL này để login Facebook'
  });
});

// API endpoint để lấy JWT token (dành cho session-based authentication)
router.get('/token', (req, res) => {
  // Kiểm tra xem user đã login qua session chưa
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      message: 'Please login first to get token',
      // redirectUrl: '/login'
    });
  }

  // Tạo JWT token cho user đã đăng nhập
  try {
    const token = generateToken(req.user);
    
    res.json({
      success: true,
      message: 'Token generated successfully',
      token: token,
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        provider: req.user.provider
      }
    });
  } catch (error) {
    console.error('Token generation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate token'
    });
  }
});

// api login - hỗ trợ cả session và JWT
router.get('/auth', verifyToken, (req, res) => {
  // Ưu tiên sử dụng JWT token user nếu có
  let userData;
  
  if (req.tokenUser) {
    // User được xác thực qua JWT token
    userData = {
      id: req.tokenUser.id,
      name: req.tokenUser.name,
      email: req.tokenUser.email,
      provider: req.tokenUser.provider,
      authMethod: 'jwt'
    };
  } else if (req.isAuthenticated()) {
    // User được xác thực qua session
    userData = {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      provider: req.user.provider,
      authMethod: 'session'
    };
  } else {
    // Không có authentication
    return res.json({
      success: false,
      message: 'Login required',
      // redirectUrl: '/login'
    });
  }

  res.json({
    success: true,
    message: 'Authentication successful',
    data: userData
  });
});

/*************
*
* APP MANAGEMENT API ROUTES
*
*************/

// Lấy danh sách tất cả apps (chỉ admin hoặc để test)
router.get('/apps', verifyToken, async (req, res) => {
  try {
    const user = req.tokenUser || req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const apps = await App.getAllApps();
    
    res.json({
      success: true,
      data: apps,
      message: `Found ${apps.length} apps`
    });

  } catch (error) {
    console.error('Get apps error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách apps'
    });
  }
});

// Lấy danh sách user của một app
router.get('/apps/:appId/users', verifyToken, async (req, res) => {
  try {
    const user = req.tokenUser || req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { appId } = req.params;
    const users = await App.getUsersByApp(parseInt(appId));
    
    res.json({
      success: true,
      data: users,
      message: `Found ${users.length} users for app ID ${appId}`
    });

  } catch (error) {
    console.error('Get app users error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách users của app'
    });
  }
});

// Lấy danh sách app mà user đã login
router.get('/user/apps', verifyToken, async (req, res) => {
  try {
    const user = req.tokenUser || req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const apps = await App.getAppsByUser(user.id);
    
    res.json({
      success: true,
      data: apps,
      message: `User has logged into ${apps.length} apps`
    });

  } catch (error) {
    console.error('Get user apps error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách apps của user'
    });
  }
});

// Tạo app mới (manual)
router.post('/apps', verifyToken, async (req, res) => {
  try {
    const user = req.tokenUser || req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const { app_name, app_display_name, app_description } = req.body;
    
    if (!app_name) {
      return res.status(400).json({
        success: false,
        message: 'app_name is required'
      });
    }

    const app = await App.findOrCreateApp(app_name, app_display_name, app_description);
    
    res.status(201).json({
      success: true,
      data: app,
      message: 'App created successfully'
    });

  } catch (error) {
    console.error('Create app error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo app'
    });
  }
});

// Xóa app (chỉ admin)
router.delete('/apps/:appId', verifyToken, async (req, res) => {
  try {
    const user = req.tokenUser || req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // TODO: Thêm check admin permission ở đây nếu cần

    const { appId } = req.params;
    const result = await App.deleteApp(parseInt(appId));
    
    if (result.deletedRows > 0) {
      res.json({
        success: true,
        message: 'App deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'App not found'
      });
    }

  } catch (error) {
    console.error('Delete app error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa app'
    });
  }
});

// POST /api/app-register - App registration endpoint
router.post('/app-register', async (req, res) => {
  try {
    const { app_name, app_display_name, app_description } = req.body;

    if (!app_name || !app_display_name) {
      return res.status(400).json({
        success: false,
        message: 'app_name and app_display_name are required'
      });
    }

    const result = await App.registerOrFindApp({
      app_name,
      app_display_name,
      app_description
    });

    res.json({
      success: true,
      isNew: result.isNew,
      app: result.app,
      message: result.message
    });

  } catch (error) {
    console.error('App registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during app registration',
      error: error.message
    });
  }
});

// POST /api/server-auth - Server-to-server authentication
router.post('/server-auth', async (req, res) => {
  try {
    const { email, name, provider = 'server', app_name, app_display_name, app_description } = req.body;

    if (!email || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and name are required' 
      });
    }

    // Tìm hoặc tạo user
    const db = await new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database('./db/users.db3', (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });

    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email], (err, row) => {
        if (err) reject(err);
        else if (row) {
          resolve(row);
        } else {
          // Tạo user mới
          const userId = Date.now().toString();
          db.run(
            'INSERT INTO users (id, email, name, provider) VALUES (?, ?, ?, ?)',
            [userId, email, name, provider],
            function(err) {
              if (err) reject(err);
              else {
                resolve({ id: userId, email, name, provider });
              }
            }
          );
        }
      });
    });

    db.close();

    // Track app usage
    if (app_name) {
      await App.trackUserLogin(user.id, app_name, app_display_name, app_description);
    }

    // Tạo JWT token
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      provider: user.provider,
      app_name: app_name || 'server-auth'
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        provider: user.provider
      }
    });

  } catch (error) {
    console.error('Server auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// POST /api/validate-token - Validate JWT token
router.post('/validate-token', (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    res.json({
      success: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider,
        app_name: decoded.app_name
      }
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    console.error('Token validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/register-app - App registration endpoint
router.post('/register-app', async (req, res) => {
  try {
    const { 
      app_name, 
      app_display_name, 
      app_description, 
      app_version, 
      app_host,
      app_port,
      app_secret 
    } = req.body;

    if (!app_name || !app_display_name) {
      return res.status(400).json({
        success: false,
        message: 'app_name and app_display_name are required'
      });
    }

    // Verify app secret (optional security layer)
    const expectedSecret = process.env.APP_REGISTRATION_SECRET;
    if (expectedSecret && app_secret !== expectedSecret) {
      return res.status(403).json({
        success: false,
        message: 'Invalid app registration secret'
      });
    }

    const appData = {
      name: app_name,
      display_name: app_display_name,
      description: app_description || `Application: ${app_display_name}`,
      version: app_version || '1.0.0',
      host: app_host || 'localhost',
      port: app_port || null,
      registered_at: new Date().toISOString(),
      last_ping: new Date().toISOString(),
      status: 'active'
    };

    // Create or update app in database
    const appResult = await App.findOrCreateApp(
      appData.name, 
      appData.display_name, 
      appData.description
    );

    // Update additional app info
    const db = await new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database('./db/users.db3', (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });

    await new Promise((resolve, reject) => {
      db.run(`
        UPDATE apps 
        SET version = ?, host = ?, port = ?, registered_at = ?, last_ping = ?, status = ?
        WHERE id = ?
      `, [
        appData.version, 
        appData.host, 
        appData.port, 
        appData.registered_at, 
        appData.last_ping, 
        appData.status,
        appResult.id
      ], function(err) {
        if (err) reject(err);
        else resolve();
      });
    });

    db.close();

    res.json({
      success: true,
      message: 'App registered successfully',
      app: {
        id: appResult.id,
        name: appData.name,
        display_name: appData.display_name,
        description: appData.description,
        version: appData.version,
        host: appData.host,
        port: appData.port,
        status: appData.status,
        registered_at: appData.registered_at
      }
    });

  } catch (error) {
    console.error('App registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during app registration'
    });
  }
});

// POST /api/ping-app - App health check/heartbeat
router.post('/ping-app', async (req, res) => {
  try {
    const { app_name, status = 'active' } = req.body;

    if (!app_name) {
      return res.status(400).json({
        success: false,
        message: 'app_name is required'
      });
    }

    const db = await new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database('./db/users.db3', (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });

    // Update last_ping timestamp
    const result = await new Promise((resolve, reject) => {
      db.run(`
        UPDATE apps 
        SET last_ping = ?, status = ?
        WHERE name = ?
      `, [new Date().toISOString(), status, app_name], function(err) {
        if (err) reject(err);
        else resolve({ changes: this.changes });
      });
    });

    db.close();

    if (result.changes > 0) {
      res.json({
        success: true,
        message: 'App ping updated successfully',
        last_ping: new Date().toISOString()
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'App not found. Please register first.'
      });
    }

  } catch (error) {
    console.error('App ping error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during app ping'
    });
  }
});

// GET /api/apps-status - Get all registered apps with status
router.get('/apps-status', async (req, res) => {
  try {
    const db = await new Promise((resolve, reject) => {
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database('./db/users.db3', (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });

    const apps = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          id, name, display_name, description, version, host, port,
          registered_at, last_ping, status,
          (SELECT COUNT(*) FROM app_users WHERE app_id = apps.id) as user_count
        FROM apps 
        ORDER BY registered_at DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    db.close();

    res.json({
      success: true,
      apps: apps.map(app => ({
        ...app,
        is_online: app.last_ping && 
                   (new Date() - new Date(app.last_ping)) < 5 * 60 * 1000 // 5 minutes
      }))
    });

  } catch (error) {
    console.error('Get apps status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

module.exports = router;
