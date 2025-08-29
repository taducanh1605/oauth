/**
 * ==========================================
 * OAUTH UTILS - VÍ DỤ SỬ DỤNG TỪNG HÀNG
 * ==========================================
 * 
 * File này chứa ví dụ chi tiết về cách sử dụng từng hàm trong OAuthUtils
 * để tạo một app hoàn chỉnh sử dụng thư viện này.
 */

const OAuthUtils = require('./oauth_utils.js');

// ==========================================
// 1. KHỞI TẠO VÀ CẤU HÌNH
// ==========================================

/**
 * Ví dụ 1: Khởi tạo cơ bản
 */
function example_basicInitialization() {
  const oauthClient = new OAuthUtils('http://localhost:2444');
  console.log('✅ OAuth client initialized with basic config');
  return oauthClient;
}

/**
 * Ví dụ 2: Khởi tạo với cấu hình đầy đủ
 */
function example_fullInitialization() {
  const oauthClient = new OAuthUtils('http://localhost:2444', {
    // App info mặc định
    defaultAppName: 'my-awesome-app',
    defaultAppDisplayName: 'My Awesome Application',
    defaultAppDescription: 'A great app that does amazing things',
    
    // Cấu hình request
    timeout: 10000, // 10 seconds
    headers: {
      'User-Agent': 'MyApp/1.0.0',
      'Accept': 'application/json'
    }
  });
  
  console.log('✅ OAuth client initialized with full config');
  console.log('📋 API Base URL:', oauthClient.getApiBaseUrl());
  console.log('🔧 Default headers:', oauthClient.defaultHeaders);
  
  return oauthClient;
}

// ==========================================
// 2. ĐĂNG KÝ VÀ QUẢN LÝ APP
// ==========================================

/**
 * Ví dụ 3: Đăng ký app khi khởi động server
 */
async function example_registerApp() {
  const oauthClient = example_basicInitialization();
  
  try {
    console.log('🚀 Đang đăng ký app...');
    
    const result = await oauthClient.registerApp({
      app_name: 'my-web-server',
      app_display_name: 'My Web Server',
      app_description: 'Backend server for my awesome website'
    });
    
    if (result.success) {
      console.log('✅ App đã được đăng ký thành công!');
      console.log('📱 App ID:', result.app.id);
      console.log('📝 App Name:', result.app.app_name);
      console.log('🆕 Is New App:', result.isNew);
      console.log('📊 Message:', result.message);
    } else {
      console.error('❌ Lỗi đăng ký app:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Exception khi đăng ký app:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 4: Đăng ký app với default config
 */
async function example_registerAppWithDefaults() {
  const oauthClient = new OAuthUtils('http://localhost:2444', {
    defaultAppName: 'default-server',
    defaultAppDisplayName: 'Default Server App',
    defaultAppDescription: 'Auto-registered server application'
  });
  
  // Đăng ký với default info
  const result = await oauthClient.registerApp();
  
  console.log('📦 Registered app with defaults:', result);
  return result;
}

// ==========================================
// 3. XÁC THỰC NGƯỜI DÙNG
// ==========================================

/**
 * Ví dụ 5: Đăng ký tài khoản mới
 */
async function example_registerUser() {
  const oauthClient = example_basicInitialization();
  
  try {
    console.log('👤 Đang đăng ký user mới...');
    
    const result = await oauthClient.register({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
      password2: 'securePassword123'
    });
    
    if (result.success) {
      console.log('✅ Đăng ký thành công!');
      console.log('👤 User:', result.user);
      console.log('🔑 Token:', result.token ? 'Generated' : 'Not provided');
      
      // Token được tự động lưu vào client
      console.log('🔐 Client authenticated:', oauthClient.isAuthenticated());
    } else {
      console.error('❌ Lỗi đăng ký:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 6: Đăng nhập bằng email/password
 */
async function example_loginWithEmail() {
  const oauthClient = example_basicInitialization();
  
  try {
    console.log('🔑 Đang đăng nhập...');
    
    const result = await oauthClient.loginWithEmail({
      email: 'john.doe@example.com',
      password: 'securePassword123'
    });
    
    if (result.success) {
      console.log('✅ Đăng nhập thành công!');
      console.log('👤 User ID:', result.user.id);
      console.log('👤 User Name:', result.user.name);
      console.log('📧 User Email:', result.user.email);
      console.log('🏷️ Provider:', result.user.provider);
      console.log('📱 App:', result.app);
      console.log('🔑 Token saved to client');
      
      return { client: oauthClient, token: result.token, user: result.user };
    } else {
      console.error('❌ Lỗi đăng nhập:', result.message);
      return null;
    }
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 7: Đăng nhập với app info tùy chỉnh
 */
async function example_loginWithCustomApp() {
  const oauthClient = example_basicInitialization();
  
  const result = await oauthClient.loginWithEmail(
    {
      email: 'john.doe@example.com',
      password: 'securePassword123'
    },
    {
      app_name: 'special-login-instance',
      app_display_name: 'Special Login Instance',
      app_description: 'Login with custom app context'
    }
  );
  
  if (result.success) {
    console.log('✅ Đăng nhập với custom app thành công!');
    console.log('📱 Custom app:', result.app);
  }
  
  return result;
}

/**
 * Ví dụ 8: Server-to-Server Authentication
 */
async function example_serverToServerAuth() {
  const oauthClient = example_basicInitialization();
  
  try {
    console.log('🔗 Server-to-Server Authentication...');
    
    // Giả sử user đã được xác thực ở server khác
    const externalUserInfo = {
      email: 'external.user@company.com',
      name: 'External User',
      provider: 'my-company-server'
    };
    
    const result = await oauthClient.serverToServerAuth(externalUserInfo, {
      app_name: 'company-integration',
      app_display_name: 'Company System Integration'
    });
    
    if (result.success) {
      console.log('✅ Server-to-Server auth thành công!');
      console.log('👤 User:', result.user);
      console.log('📱 App:', result.app);
      console.log('🔑 Token generated and saved');
      
      return { client: oauthClient, result };
    } else {
      console.error('❌ Lỗi S2S auth:', result.message);
    }
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

// ==========================================
// 4. QUẢN LÝ TOKEN VÀ SESSION
// ==========================================

/**
 * Ví dụ 9: Xác thực với token có sẵn
 */
async function example_authenticateWithToken() {
  const oauthClient = example_basicInitialization();
  
  // Giả sử có token từ cookie hoặc session
  const existingToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  
  try {
    console.log('🔐 Xác thực với token có sẵn...');
    
    const result = await oauthClient.authenticateWithToken(existingToken);
    
    if (result.success) {
      console.log('✅ Token hợp lệ!');
      console.log('👤 User:', result.user);
      console.log('🔑 Token được set vào client');
    } else {
      console.error('❌ Token không hợp lệ:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 10: Validate token (không thay đổi client state)
 */
async function example_validateToken() {
  const oauthClient = example_basicInitialization();
  
  const tokenToValidate = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  
  try {
    console.log('✅ Validating token...');
    
    const validation = await oauthClient.validateToken(tokenToValidate);
    
    if (validation.success) {
      console.log('✅ Token hợp lệ cho user:', validation.user.name);
      console.log('📧 Email:', validation.user.email);
      console.log('🆔 User ID:', validation.user.id);
    } else {
      console.log('❌ Token không hợp lệ:', validation.message);
    }
    
    // Client state không thay đổi
    console.log('🔒 Client auth state:', oauthClient.isAuthenticated());
    
    return validation;
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 11: Quản lý token thủ công
 */
function example_manualTokenManagement() {
  const oauthClient = example_basicInitialization();
  
  console.log('🔧 Quản lý token thủ công...');
  
  // Kiểm tra trạng thái ban đầu
  console.log('🔓 Initially authenticated:', oauthClient.isAuthenticated());
  console.log('🔑 Current token:', oauthClient.getToken());
  
  // Set token thủ công
  const myToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  oauthClient.setToken(myToken);
  
  console.log('🔐 After setting token:');
  console.log('🔒 Authenticated:', oauthClient.isAuthenticated());
  console.log('🔑 Current token:', oauthClient.getToken());
  
  // Logout (clear token)
  const logoutResult = oauthClient.logout();
  console.log('👋 Logout result:', logoutResult);
  console.log('🔓 After logout authenticated:', oauthClient.isAuthenticated());
  
  return oauthClient;
}

// ==========================================
// 5. THÔNG TIN NGƯỜI DÙNG VÀ APP
// ==========================================

/**
 * Ví dụ 12: Lấy thông tin user hiện tại
 */
async function example_getCurrentUser() {
  // Đầu tiên đăng nhập
  const loginData = await example_loginWithEmail();
  if (!loginData) return;
  
  const { client } = loginData;
  
  try {
    console.log('👤 Lấy thông tin user hiện tại...');
    
    const userInfo = await client.getUser();
    
    if (userInfo.success) {
      console.log('✅ Thông tin user:');
      console.log('🆔 ID:', userInfo.user.id);
      console.log('👤 Name:', userInfo.user.name);
      console.log('📧 Email:', userInfo.user.email);
      console.log('🏷️ Provider:', userInfo.user.provider);
      console.log('📅 Created:', userInfo.user.created_at);
    } else {
      console.error('❌ Không thể lấy thông tin user:', userInfo.message);
    }
    
    return userInfo;
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 13: Lấy danh sách apps của user
 */
async function example_getUserApps() {
  // Đăng nhập trước
  const loginData = await example_loginWithEmail();
  if (!loginData) return;
  
  const { client } = loginData;
  
  try {
    console.log('📱 Lấy danh sách apps của user...');
    
    const userApps = await client.getUserApps();
    
    if (userApps.success) {
      console.log('✅ User có', userApps.apps.length, 'apps:');
      
      userApps.apps.forEach((app, index) => {
        console.log(`📱 App ${index + 1}:`);
        console.log(`   - Name: ${app.app_name}`);
        console.log(`   - Display: ${app.app_display_name}`);
        console.log(`   - Login count: ${app.login_count}`);
        console.log(`   - Last login: ${app.last_login}`);
        console.log(`   - First login: ${app.first_login}`);
      });
    } else {
      console.error('❌ Không thể lấy apps:', userApps.message);
    }
    
    return userApps;
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

/**
 * Ví dụ 14: Tạo app mới (cần quyền admin)
 */
async function example_createApp() {
  // Đăng nhập với admin account
  const loginData = await example_loginWithEmail();
  if (!loginData) return;
  
  const { client } = loginData;
  
  try {
    console.log('🆕 Tạo app mới...');
    
    const newApp = await client.createApp({
      app_name: 'new-mobile-app',
      app_display_name: 'New Mobile App',
      app_description: 'A brand new mobile application'
    });
    
    if (newApp.success) {
      console.log('✅ App mới được tạo thành công!');
      console.log('📱 App:', newApp.app);
    } else {
      console.error('❌ Không thể tạo app:', newApp.message);
    }
    
    return newApp;
  } catch (error) {
    console.error('💥 Exception:', error.message);
    throw error;
  }
}

// ==========================================
// 6. TÍCH HỢP VỚI EXPRESS.JS
// ==========================================

/**
 * Ví dụ 15: Express.js Middleware cho Authentication
 */
function example_expressMiddleware() {
  const express = require('express');
  const session = require('express-session');
  const app = express();
  
  const oauthClient = new OAuthUtils('http://localhost:2444', {
    defaultAppName: 'my-web-app',
    defaultAppDisplayName: 'My Web Application'
  });
  
  // Middleware setup
  app.use(express.json());
  app.use(session({
    secret: 'your-session-secret',
    resave: false,
    saveUninitialized: false
  }));
  
  // Authentication middleware
  const authMiddleware = async (req, res, next) => {
    try {
      // Lấy token từ header hoặc session
      let token = req.headers.authorization?.replace('Bearer ', '');
      if (!token && req.session.authToken) {
        token = req.session.authToken;
      }
      
      if (!token) {
        return res.status(401).json({ 
          success: false, 
          message: 'Authentication required' 
        });
      }
      
      // Validate token
      const validation = await oauthClient.validateToken(token);
      if (validation.success) {
        req.user = validation.user;
        req.authToken = token;
        next();
      } else {
        res.status(401).json({ 
          success: false, 
          message: 'Invalid or expired token' 
        });
      }
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: error.message 
      });
    }
  };
  
  // Routes
  
  // Login endpoint
  app.post('/api/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }
      
      const result = await oauthClient.loginWithEmail({ email, password });
      
      if (result.success) {
        // Lưu token vào session
        req.session.authToken = result.token;
        
        res.json({
          success: true,
          message: 'Login successful',
          user: result.user
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
  
  // Register endpoint
  app.post('/api/register', async (req, res) => {
    try {
      const { name, email, password, password2 } = req.body;
      
      const result = await oauthClient.register({
        name, email, password, password2
      });
      
      if (result.success) {
        req.session.authToken = result.token;
        res.json({
          success: true,
          message: 'Registration successful',
          user: result.user
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
  
  // Protected route example
  app.get('/api/profile', authMiddleware, async (req, res) => {
    res.json({
      success: true,
      user: req.user
    });
  });
  
  // Get user's apps
  app.get('/api/my-apps', authMiddleware, async (req, res) => {
    try {
      // Set token để client có thể gọi API
      oauthClient.setToken(req.authToken);
      
      const userApps = await oauthClient.getUserApps();
      res.json(userApps);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  });
  
  // Logout endpoint
  app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  });
  
  console.log('✅ Express.js app với OAuth middleware đã được setup!');
  console.log('📋 Available endpoints:');
  console.log('   POST /api/login - Đăng nhập');
  console.log('   POST /api/register - Đăng ký');
  console.log('   GET /api/profile - Xem profile (protected)');
  console.log('   GET /api/my-apps - Danh sách apps (protected)');
  console.log('   POST /api/logout - Đăng xuất');
  
  return app;
}

/**
 * Ví dụ 16: Batch Operations
 */
async function example_batchOperations() {
  const oauthClient = example_basicInitialization();
  
  console.log('📦 Batch Operations...');
  
  // Giả sử có nhiều user cần authenticate
  const usersToAuth = [
    { email: 'user1@example.com', name: 'User 1', provider: 'batch-system' },
    { email: 'user2@example.com', name: 'User 2', provider: 'batch-system' },
    { email: 'user3@example.com', name: 'User 3', provider: 'batch-system' }
  ];
  
  try {
    // Parallel authentication
    console.log('🔄 Authenticating múltiple users...');
    
    const authPromises = usersToAuth.map(user => 
      oauthClient.serverToServerAuth(user, {
        app_name: 'batch-processor',
        app_display_name: 'Batch Processing System'
      })
    );
    
    const results = await Promise.all(authPromises);
    
    console.log('✅ Batch authentication completed!');
    results.forEach((result, index) => {
      if (result.success) {
        console.log(`👤 User ${index + 1}: ✅ Success - ${result.user.name}`);
      } else {
        console.log(`👤 User ${index + 1}: ❌ Failed - ${result.message}`);
      }
    });
    
    return results;
  } catch (error) {
    console.error('💥 Batch operation failed:', error.message);
    throw error;
  }
}

// ==========================================
// 7. CẤU HÌNH NÂNG CAO
// ==========================================

/**
 * Ví dụ 17: Cấu hình nâng cao và custom headers
 */
function example_advancedConfiguration() {
  console.log('⚙️ Advanced Configuration...');
  
  const oauthClient = example_basicInitialization();
  
  // Set timeout tùy chỉnh
  oauthClient.setTimeout(15000); // 15 seconds
  console.log('⏱️ Timeout set to 15 seconds');
  
  // Set default headers
  oauthClient.setDefaultHeaders({
    'X-API-Version': '1.0',
    'X-Client-Name': 'MyCustomClient',
    'User-Agent': 'MyApp/2.0.0 (Custom Build)'
  });
  console.log('📋 Custom headers set');
  
  // Set default app info
  oauthClient.setDefaultAppInfo({
    app_name: 'dynamic-configured-app',
    app_display_name: 'Dynamic Configured Application',
    app_description: 'App configured at runtime'
  });
  console.log('📱 Default app info updated');
  
  // Kiểm tra cấu hình
  console.log('🔍 Current configuration:');
  console.log('   API URL:', oauthClient.getApiBaseUrl());
  console.log('   Timeout:', oauthClient.timeout);
  console.log('   Default headers:', oauthClient.defaultHeaders);
  console.log('   Default app name:', oauthClient.defaultAppName);
  
  return oauthClient;
}

// ==========================================
// 8. DEMO HOÀN CHỈNH
// ==========================================

/**
 * Ví dụ 18: Demo hoàn chỉnh - Tạo một app sử dụng OAuth
 */
async function example_completeDemo() {
  console.log('\n🚀 ===== DEMO HOÀN CHỈNH =====\n');
  
  try {
    // 1. Khởi tạo client
    console.log('1️⃣ Khởi tạo OAuth client...');
    const oauthClient = new OAuthUtils('http://localhost:2444', {
      defaultAppName: 'demo-complete-app',
      defaultAppDisplayName: 'Demo Complete Application',
      defaultAppDescription: 'Complete demo of OAuth integration',
      timeout: 10000
    });
    
    // 2. Đăng ký app
    console.log('\n2️⃣ Đăng ký application...');
    const appRegistration = await oauthClient.registerApp();
    if (appRegistration.success) {
      console.log('✅ App registered:', appRegistration.app.app_display_name);
    }
    
    // 3. Đăng ký user mới
    console.log('\n3️⃣ Đăng ký user mới...');
    const registerResult = await oauthClient.register({
      name: 'Demo User',
      email: 'demo.user@example.com',
      password: 'demopass123',
      password2: 'demopass123'
    });
    
    if (registerResult.success) {
      console.log('✅ User registered:', registerResult.user.name);
      
      // 4. Lấy thông tin user
      console.log('\n4️⃣ Lấy thông tin user hiện tại...');
      const userInfo = await oauthClient.getUser();
      console.log('👤 User info:', userInfo.user);
      
      // 5. Lấy apps của user
      console.log('\n5️⃣ Lấy danh sách apps...');
      const userApps = await oauthClient.getUserApps();
      console.log('📱 User has', userApps.apps.length, 'apps');
      
      // 6. Test server-to-server auth
      console.log('\n6️⃣ Test server-to-server authentication...');
      const s2sResult = await oauthClient.serverToServerAuth({
        email: 'external.system@company.com',
        name: 'External System User',
        provider: 'external-api'
      });
      
      if (s2sResult.success) {
        console.log('✅ Server-to-server auth successful');
      }
      
      // 7. Token validation test
      console.log('\n7️⃣ Test token validation...');
      const currentToken = oauthClient.getToken();
      const validation = await oauthClient.validateToken(currentToken);
      console.log('🔐 Token valid:', validation.success);
      
      // 8. Logout test
      console.log('\n8️⃣ Test logout...');
      const logoutResult = oauthClient.logout();
      console.log('👋 Logout:', logoutResult.message);
      console.log('🔓 Authenticated after logout:', oauthClient.isAuthenticated());
      
      console.log('\n✅ ===== DEMO HOÀN THÀNH THÀNH CÔNG! =====');
      
    } else {
      console.error('❌ User registration failed:', registerResult.message);
    }
    
  } catch (error) {
    console.error('💥 Demo failed:', error.message);
    throw error;
  }
}

// ==========================================
// 9. CHẠY EXAMPLES
// ==========================================

/**
 * Hàm main để chạy tất cả examples
 */
async function runAllExamples() {
  console.log('🎬 ===== OAUTH UTILS EXAMPLES =====\n');
  
  try {
    // Chạy demo hoàn chỉnh
    await example_completeDemo();
    
    console.log('\n📚 Tất cả examples đã hoàn thành!');
    console.log('💡 Bạn có thể chạy từng example riêng lẻ bằng cách gọi các hàm:');
    console.log('   - example_basicInitialization()');
    console.log('   - example_registerApp()');
    console.log('   - example_loginWithEmail()');
    console.log('   - example_serverToServerAuth()');
    console.log('   - và nhiều hàm khác...');
    
  } catch (error) {
    console.error('❌ Error running examples:', error.message);
  }
}

// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  // Initialization examples
  example_basicInitialization,
  example_fullInitialization,
  
  // App management examples
  example_registerApp,
  example_registerAppWithDefaults,
  
  // Authentication examples
  example_registerUser,
  example_loginWithEmail,
  example_loginWithCustomApp,
  example_serverToServerAuth,
  
  // Token management examples
  example_authenticateWithToken,
  example_validateToken,
  example_manualTokenManagement,
  
  // User and app info examples
  example_getCurrentUser,
  example_getUserApps,
  example_createApp,
  
  // Integration examples
  example_expressMiddleware,
  example_batchOperations,
  
  // Advanced examples
  example_advancedConfiguration,
  example_completeDemo,
  
  // Main runner
  runAllExamples
};

// Chạy demo nếu file này được execute trực tiếp
if (require.main === module) {
  runAllExamples().catch(console.error);
}

/**
 * ==========================================
 * HƯỚNG DẪN SỬ DỤNG NHANH
 * ==========================================
 * 
 * 1. Cài đặt dependencies:
 *    npm install
 * 
 * 2. Khởi động OAuth server:
 *    npm start
 * 
 * 3. Chạy examples:
 *    node examples/oauth_utils_examples.js
 * 
 * 4. Hoặc import và sử dụng từng example:
 *    const examples = require('./examples/oauth_utils_examples.js');
 *    await examples.example_loginWithEmail();
 * 
 * 5. Tích hợp vào Express app:
 *    const app = examples.example_expressMiddleware();
 *    app.listen(3000, () => console.log('Server running on port 3000'));
 * 
 * ==========================================
 * PATTERNS THÔNG DỤNG
 * ==========================================
 * 
 * 1. Server khởi động và đăng ký:
 *    const oauth = new OAuthUtils(API_URL, { defaultAppName: 'my-server' });
 *    await oauth.registerApp();
 * 
 * 2. Login workflow:
 *    const result = await oauth.loginWithEmail({ email, password });
 *    if (result.success) {
 *      // oauth.currentToken đã được set tự động
 *      const user = await oauth.getUser();
 *    }
 * 
 * 3. Middleware pattern:
 *    const validation = await oauth.validateToken(req.headers.authorization);
 *    if (validation.success) {
 *      req.user = validation.user;
 *      next();
 *    }
 * 
 * 4. Server-to-server pattern:
 *    const result = await oauth.serverToServerAuth({
 *      email: userFromMySystem.email,
 *      name: userFromMySystem.name,
 *      provider: 'my-system'
 *    });
 */
