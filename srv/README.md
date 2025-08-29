# OAuth Authentication Server

Hệ thống xác thực OAuth với thư viện client tích hợp, hỗ trợ server-to-server authentication và quản lý ứng dụng.

## 🎯 Mục Tiêu Project

### Mục tiêu chính:
- **Tập trung hóa xác thực**: Cung cấp một điểm xác thực trung tâm cho nhiều ứng dụng/microservices
- **Server-to-server authentication**: Cho phép các server khác xác thực user mà không cần redirect OAuth phức tạp
- **Quản lý ứng dụng**: Theo dõi và quản lý các app đã đăng ký, thống kê người dùng
- **Đơn giản hóa tích hợp**: Cung cấp thư viện client dễ sử dụng cho developers

### Giải pháp cho:
- **Multi-app ecosystem**: Một user có thể đăng nhập vào nhiều ứng dụng với cùng một tài khoản
- **Microservices authentication**: Các microservice có thể xác thực user thông qua API calls
- **Legacy system integration**: Tích hợp với các hệ thống cũ thông qua server-to-server auth
- **Analytics và tracking**: Theo dõi việc sử dụng của user trên các ứng dụng khác nhau

## 🔄 Workflow

### 1. **App Registration Flow**
```
Server A khởi động → Đăng ký với OAuth Server → Nhận app credentials
                  ↓
               Lưu app info vào database → Ready để authenticate users
```

### 2. **Standard Login Flow**
```
User → Frontend App → OAuth Server → Validate credentials → Return JWT token
                   ↓                                      ↓
              Store token                          Log app usage
                   ↓
              User có thể access protected APIs
```

### 3. **Server-to-Server Flow**
```
User authenticated trên Server A → Server A gọi OAuth Server với user info
                                ↓
                     OAuth Server tạo/cập nhật user → Return JWT token
                                ↓
                     Server A sử dụng token để access protected resources
```

### 4. **Token Validation Flow**
```
Client request với JWT token → OAuth Server validate token → Return user info
                           ↓                             ↓
                    Nếu invalid                    Nếu valid
                           ↓                             ↓
                   Return 401 error              Allow access + user data
```

### 5. **Cross-App Authentication**
```
User login vào App A → Nhận JWT token → Sử dụng token để access App B
                     ↓                                          ↓
              Token valid cho cả 2 apps           App B validate token với OAuth Server
```

## Features

- **Đa phương thức xác thực**: Email/password, Google OAuth, Facebook OAuth
- **JWT token management**: Token với thời gian sống 24h, auto-refresh
- **App tracking & analytics**: Theo dõi usage, login count cho từng app
- **Server-to-server authentication**: API cho các server backend tích hợp
- **Cross-domain support**: CORS configured cho multi-domain apps
- **SQLite database**: Lightweight, không cần setup phức tạp
- **Client library**: Thư viện JavaScript dễ sử dụng cho integration

## Quick Start

### 1. Installation

```bash
git clone <repository-url>
cd oauth
npm install
```

### 2. Environment Setup

Tạo file `.env`:

```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here
```

### 3. Start Server

```bash
npm start
# hoặc
npm run dev  # với nodemon
```

Server sẽ chạy tại: `http://localhost:2444`

## API Endpoints

### Authentication
- `POST /api/register` - Đăng ký user mới
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com", 
    "password": "password123",
    "password2": "password123"
  }
  ```

- `POST /api/login` - Đăng nhập email/password
  ```json
  {
    "email": "john@example.com",
    "password": "password123",
    "app_name": "my-app" // optional
  }
  ```

- `POST /api/server-auth` - Server-to-server authentication
  ```json
  {
    "email": "user@company.com",
    "name": "User Name", 
    "provider": "company-system",
    "app_name": "integration-app" // optional
  }
  ```

- `POST /api/validate-token` - Validate JWT token
- `GET /api/auth` - Lấy thông tin user từ token
- `GET /auth/google` - Google OAuth login
- `GET /auth/facebook` - Facebook OAuth login

### App Management
- `POST /api/app-register` - Đăng ký app mới
  ```json
  {
    "app_name": "my-unique-app",
    "app_display_name": "My Application",
    "app_description": "App description"
  }
  ```

- `GET /api/user/apps` - Apps của user hiện tại
- `GET /api/apps` - Tất cả apps (admin)
- `POST /api/apps` - Tạo app mới
- `DELETE /api/apps/:id` - Xóa app

## 📋 Ví Dụ Sử Dụng Hoàn Chỉnh

### 🎯 Ví Dụ Đầy Đủ Các Hàm

Xem file [`examples/oauth_utils_examples.js`](examples/oauth_utils_examples.js) để có 18 ví dụ chi tiết:

1. **Khởi tạo & cấu hình**: Basic và advanced initialization
2. **Đăng ký app**: App registration khi khởi động
3. **User authentication**: Register, login, server-to-server auth  
4. **Token management**: Validate, authenticate, manual management
5. **User & app info**: Get user info, user apps, create apps
6. **Express.js integration**: Complete middleware examples
7. **Batch operations**: Multiple user authentication
8. **Advanced config**: Custom headers, timeouts, app info

### 🏃‍♂️ Chạy Examples

```bash
# Khởi động OAuth server
npm start

# Chạy tất cả examples
node examples/oauth_utils_examples.js

# Hoặc import và chạy từng example
const examples = require('./examples/oauth_utils_examples.js');
await examples.example_completeDemo();
```

### 💼 Use Cases Thực Tế

**1. Web Application với Session Management**
```javascript
// Đăng nhập và lưu token vào session
const result = await oauthClient.loginWithEmail({ email, password });
if (result.success) {
  req.session.authToken = result.token;
  res.redirect('/dashboard');
}
```

**2. Microservices Authentication**
```javascript
// Service A xác thực user cho Service B
const authResult = await oauthClient.serverToServerAuth({
  email: userFromServiceA.email,
  name: userFromServiceA.name,
  provider: 'service-a'
});

// Service B sử dụng token để authorize
const validation = await oauthClient.validateToken(token);
if (validation.success) {
  // Allow access to protected resources
}
```

**3. API Gateway Pattern**
```javascript
// Gateway validate token cho tất cả requests
app.use('/api/*', async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validation = await oauthClient.validateToken(token);
  
  if (validation.success) {
    req.user = validation.user;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});
```

**4. Background Job Processing**
```javascript
// Batch authenticate users cho background jobs
const jobUsers = await Promise.all(
  userEmails.map(email => 
    oauthClient.serverToServerAuth({
      email,
      name: getUserName(email),
      provider: 'background-job'
    })
  )
);

// Process jobs với authenticated contexts
jobUsers.forEach(result => {
  if (result.success) {
    processUserJob(result.user, result.token);
  }
});
```

## 📚 Hướng Dẫn Sử Dụng Chi Tiết

### 🚀 Khởi Tạo Client

```javascript
const OAuthUtils = require('./examples/oauth_utils.js');

// Khởi tạo cơ bản
const oauthClient = new OAuthUtils('http://localhost:2444');

// Khởi tạo với cấu hình đầy đủ
const oauthClient = new OAuthUtils('http://localhost:2444', {
  defaultAppName: 'my-awesome-app',
  defaultAppDisplayName: 'My Awesome Application',
  defaultAppDescription: 'A great app that does amazing things',
  timeout: 10000,
  headers: {
    'User-Agent': 'MyApp/1.0.0'
  }
});
```

### 📱 Đăng Ký Application

```javascript
// Đăng ký app khi server khởi động
const appRegistration = await oauthClient.registerApp({
  app_name: 'my-web-server',
  app_display_name: 'My Web Server',
  app_description: 'Backend server for my website'
});

if (appRegistration.success) {
  console.log('App registered:', appRegistration.app);
}
```

### 👤 Đăng Ký & Đăng Nhập User

```javascript
// Đăng ký user mới
const registerResult = await oauthClient.register({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'password123',
  password2: 'password123'
});

// Đăng nhập bằng email/password
const loginResult = await oauthClient.loginWithEmail({
  email: 'john@example.com',
  password: 'password123'
});

if (loginResult.success) {
  console.log('User:', loginResult.user);
  console.log('Token auto-saved to client');
}
```

### 🔗 Server-to-Server Authentication

```javascript
// Khi user đã được xác thực ở server khác
const result = await oauthClient.serverToServerAuth({
  email: 'user@company.com',
  name: 'Company User',
  provider: 'company-system'
}, {
  app_name: 'company-integration',
  app_display_name: 'Company System Integration'
});

if (result.success) {
  const token = result.token; // Sử dụng cho API calls
}
```

### 🔐 Quản Lý Token

```javascript
// Validate token (không thay đổi client state)
const validation = await oauthClient.validateToken(someToken);
if (validation.success) {
  console.log('Token belongs to:', validation.user.name);
}

// Authenticate với token có sẵn
const authResult = await oauthClient.authenticateWithToken(existingToken);
if (authResult.success) {
  console.log('Token valid and set to client');
}

// Quản lý token thủ công
oauthClient.setToken('your-jwt-token');
console.log('Authenticated:', oauthClient.isAuthenticated());
oauthClient.logout(); // Clear token
```

### 📊 Thông Tin User & Apps

```javascript
// Lấy thông tin user hiện tại
const userInfo = await oauthClient.getUser();
console.log('Current user:', userInfo.user);

// Lấy danh sách apps của user
const userApps = await oauthClient.getUserApps();
userApps.apps.forEach(app => {
  console.log(`${app.app_display_name}: ${app.login_count} logins`);
});

// Tạo app mới (cần quyền admin)
const newApp = await oauthClient.createApp({
  app_name: 'new-mobile-app',
  app_display_name: 'New Mobile App',
  app_description: 'Mobile application'
});
```

### 🌐 Express.js Integration

```javascript
const express = require('express');
const session = require('express-session');
const app = express();

const oauthClient = new OAuthUtils('http://localhost:2444', {
  defaultAppName: 'my-web-app'
});

// Authentication middleware
const authMiddleware = async (req, res, next) => {
  try {
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.session.authToken) {
      token = req.session.authToken;
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const validation = await oauthClient.validateToken(token);
    if (validation.success) {
      req.user = validation.user;
      next();
    } else {
      res.status(401).json({ message: 'Invalid token' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Routes
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await oauthClient.loginWithEmail({ email, password });
  
  if (result.success) {
    req.session.authToken = result.token;
    res.json({ success: true, user: result.user });
  } else {
    res.status(401).json({ success: false, message: result.message });
  }
});

app.get('/api/profile', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

app.listen(3000, () => console.log('Server running on port 3000'));
```

### 📦 Batch Operations

```javascript
// Authenticate nhiều users cùng lúc
const usersToAuth = [
  { email: 'user1@example.com', name: 'User 1', provider: 'batch-system' },
  { email: 'user2@example.com', name: 'User 2', provider: 'batch-system' },
  { email: 'user3@example.com', name: 'User 3', provider: 'batch-system' }
];

const authPromises = usersToAuth.map(user => 
  oauthClient.serverToServerAuth(user, {
    app_name: 'batch-processor'
  })
);

const results = await Promise.all(authPromises);
console.log('Batch auth completed:', results.length, 'users processed');
```

## Architecture

### 🗄️ Database Schema
- **users** - Thông tin người dùng
  - `id, email, name, provider, password_hash, created_at, updated_at`
- **apps** - Ứng dụng đã đăng ký
  - `id, app_name, app_display_name, app_description, created_at`  
- **app_users** - Quan hệ user-app với thống kê
  - `user_id, app_id, first_login, last_login, login_count`

### 🔐 Security Features
- **BCrypt password hashing** - Mật khẩu được hash an toàn
- **JWT tokens** - Thời gian sống 24h, có thể refresh
- **Session management** - SQLite session store cho web apps
- **CORS support** - Cấu hình cho cross-domain requests
- **App tracking** - Audit trail cho security monitoring
- **Rate limiting ready** - Chuẩn bị cho rate limiting

### 🏗️ System Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Apps   │────│   OAuth Server  │────│   Database      │
│                 │    │                 │    │                 │
│ - Web Apps      │    │ - Authentication│    │ - Users         │
│ - Mobile Apps   │    │ - JWT Tokens    │    │ - Apps          │
│ - Servers       │    │ - App Management│    │ - Sessions      │
│ - Microservices │    │ - API Endpoints │    │ - App Usage     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🔄 Data Flow

**Login Flow:**
```
User Input → Client App → OAuth Server → Database Validate → JWT Token → Client App → Protected Resources
```

**Server-to-Server Flow:**
```  
Server A → OAuth Server → Database Create/Update User → JWT Token → Server A → Server B (with token)
```

**Token Validation Flow:**
```
Client Request (+ token) → OAuth Server → JWT Verify → User Data → Allow/Deny Access
```

## 🚦 Examples & Documentation

### 📁 File Structure
```
├── server.js                          # Main server entry point
├── config/
│   └── passport.js                    # Passport OAuth configuration
├── models/
│   ├── User.js                        # User database model
│   └── App.js                         # App database model
├── routes/
│   ├── auth.js                        # Authentication routes
│   └── api.js                         # API endpoints
├── middleware/
│   └── auth.js                        # Authentication middleware
├── examples/
│   ├── oauth_utils.js                 # ⭐ Client library
│   └── oauth_utils_examples.js        # 📚 18 detailed examples
├── public/                            # Static files
├── views/                             # EJS templates
├── db/                                # SQLite databases
│   ├── users.db3                      # User data
│   └── sessions.db                    # Session storage
└── docs/                              # Additional documentation
```

### 🔥 Quick Examples

**Khởi động nhanh cho developers:**

```javascript
// 1. Khởi tạo và đăng ký app
const OAuthUtils = require('./examples/oauth_utils.js');
const oauth = new OAuthUtils('http://localhost:2444', {
  defaultAppName: 'my-server'
});
await oauth.registerApp();

// 2. Login workflow
const login = await oauth.loginWithEmail({ 
  email: 'user@example.com', 
  password: 'password' 
});
if (login.success) {
  const user = await oauth.getUser(); // Token auto-saved
}

// 3. Server-to-server cho microservices  
const s2s = await oauth.serverToServerAuth({
  email: 'user@company.com',
  name: 'Company User', 
  provider: 'company-api'
});

// 4. Middleware cho Express.js
const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const validation = await oauth.validateToken(token);
  if (validation.success) {
    req.user = validation.user;
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};
```

### 📚 Learning Resources

1. **Xem [`examples/oauth_utils_examples.js`](examples/oauth_utils_examples.js)** - 18 ví dụ từ cơ bản đến nâng cao
2. **Chạy demo**: `node examples/oauth_utils_examples.js` 
3. **API Documentation**: Xem comments trong `oauth_utils.js`
4. **Integration patterns**: Express.js, microservices, batch processing

## Development

### 🛠️ Scripts
```bash
npm start          # Start production server
npm run dev        # Development với nodemon  
npm test          # Run tests (placeholder)
```

### 🔧 Environment Setup
```bash
# 1. Clone repository
git clone <repository-url>
cd oauth

# 2. Install dependencies
npm install

# 3. Create .env file
cp .env.example .env
# Edit with your OAuth credentials

# 4. Start server
npm start  # or npm run dev

# 5. Test with examples
node examples/oauth_utils_examples.js
```

### 🌍 Environment Variables
```env
# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret

# Security
JWT_SECRET=your_jwt_secret_here
SESSION_SECRET=your_session_secret_here

# Server Config (optional)
PORT=2444
NODE_ENV=production
```

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

**⭐ Key Features:**
- 🔑 **Multi-authentication**: Email, Google, Facebook OAuth
- 🔗 **Server-to-Server**: API for backend integration
- 🏢 **Multi-app support**: One user, multiple applications
- 📊 **Analytics ready**: Track usage across apps
- 🛡️ **Secure by default**: JWT tokens, BCrypt hashing
- 📚 **Developer friendly**: Complete examples and docs
- 🚀 **Production ready**: SQLite for simplicity, easily scalable

**🎯 Perfect for:**
- Microservices architecture
- Multi-application ecosystems  
- Legacy system integration
- Rapid prototyping with OAuth
- Learning OAuth implementation patterns
