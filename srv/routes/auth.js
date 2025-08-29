const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const App = require('../models/App');
const { generateToken } = require('../middleware/auth');
const router = express.Router();

// Route for registering new local users
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, password2 } = req.body;
    
    // Validation
    const errors = [];
    
    if (!name || !email || !password || !password2) {
      errors.push({ msg: 'Please fill in all fields' });
    }
    
    if (password !== password2) {
      errors.push({ msg: 'Passwords do not match' });
    }
    
    if (password.length < 6) {
      errors.push({ msg: 'Password must be at least 6 characters' });
    }
    
    if (errors.length > 0) {
      return res.render('register', { errors, name, email });
    }
    
    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      errors.push({ msg: 'Email is already registered' });
      return res.render('register', { errors, name, email });
    }
    
    // Create the new user
    await User.create({
      name,
      email,
      password,
      provider: 'local'
    });
    
    // Redirect to login
    res.redirect('/login?success=true');
  } catch (err) {
    console.error(err);
    res.render('register', { 
      errors: [{ msg: 'Error registering. Please try again.' }],
      name: req.body.name,
      email: req.body.email
    });
  }
});

// Route for local login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login?error=true'
  })(req, res, next);
});

// Route to start Google authentication
router.get('/google', passport.authenticate('google', { 
  scope: ['profile', 'email'] 
}));

// Google authentication callback
router.get('/google/callback', 
  passport.authenticate('google', { 
    failureRedirect: '/login' 
  }),
  async (req, res) => {
    // Kiểm tra state để xem có phải cross-domain request không
    const state = req.query.state;
    let stateData = null;
    
    try {
      if (state) {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      }
    } catch (e) {
      console.log('Cannot parse state:', e.message);
    }
    
    // Nếu là cross-domain request, trả về JWT token
    if (stateData && stateData.source === 'cross_domain') {
      const token = generateToken(req.user);
      let appInfo = null;
      
      // Xử lý app tracking nếu có app_name trong state
      if (stateData.app_name) {
        try {
          // Tạo hoặc lấy app
          const app = await App.findOrCreateApp(
            stateData.app_name, 
            stateData.app_display_name, 
            stateData.app_description
          );
          
          // Ghi nhận user login vào app
          const loginResult = await App.recordUserLogin(app.id, req.user.id);
          
          appInfo = {
            app_id: app.id,
            app_name: app.app_name,
            app_display_name: app.app_display_name,
            is_new_user: loginResult.isNewUser,
            login_count: loginResult.loginCount
          };
        } catch (appError) {
          console.error('App tracking error in Google OAuth:', appError);
          // Không fail login nếu app tracking lỗi
        }
      }
      
      // Return HTML page tự động lưu token và đóng popup
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Success</title>
        </head>
        <body>
          <script>
            // Tự động gửi token về parent window và đóng popup
            (function() {
              const token = '${token}';
              const userData = {
                name: '${req.user.name}',
                email: '${req.user.email}',
                provider: 'google'
              };
              
              const appInfo = ${appInfo ? JSON.stringify(appInfo) : 'null'};
              
              // Gửi token về parent window
              if (window.opener) {
                window.opener.postMessage({
                  type: 'oauth_success',
                  token: token,
                  user: userData,
                  app: appInfo
                }, '*');
                
                // Đóng popup ngay lập tức
                window.close();
              }
            })();
          </script>
        </body>
        </html>
      `);
    }
    
    // Normal session-based redirect
    res.redirect('/dashboard');
  }
);

// Route to start Facebook authentication
router.get('/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

// Facebook authentication callback
router.get('/facebook/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/login'
  }),
  async (req, res) => {
    // Kiểm tra state để xem có phải cross-domain request không
    const state = req.query.state;
    let stateData = null;
    
    try {
      if (state) {
        stateData = JSON.parse(Buffer.from(state, 'base64').toString());
      }
    } catch (e) {
      console.log('Cannot parse state:', e.message);
    }
    
    // Nếu là cross-domain request, trả về JWT token
    if (stateData && stateData.source === 'cross_domain') {
      const token = generateToken(req.user);
      let appInfo = null;
      
      // Xử lý app tracking nếu có app_name trong state
      if (stateData.app_name) {
        try {
          // Tạo hoặc lấy app
          const app = await App.findOrCreateApp(
            stateData.app_name, 
            stateData.app_display_name, 
            stateData.app_description
          );
          
          // Ghi nhận user login vào app
          const loginResult = await App.recordUserLogin(app.id, req.user.id);
          
          appInfo = {
            app_id: app.id,
            app_name: app.app_name,
            app_display_name: app.app_display_name,
            is_new_user: loginResult.isNewUser,
            login_count: loginResult.loginCount
          };
        } catch (appError) {
          console.error('App tracking error in Facebook OAuth:', appError);
          // Không fail login nếu app tracking lỗi
        }
      }
      
      // Return HTML page tự động gửi token và đóng popup
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>OAuth Success</title>
        </head>
        <body>
          <script>
            // Tự động gửi token về parent window và đóng popup
            (function() {
              const token = '${token}';
              const userData = {
                name: '${req.user.name}',
                email: '${req.user.email}',
                provider: 'facebook'
              };
              
              const appInfo = ${appInfo ? JSON.stringify(appInfo) : 'null'};
              
              // Gửi token về parent window
              if (window.opener) {
                window.opener.postMessage({
                  type: 'oauth_success',
                  token: token,
                  user: userData,
                  app: appInfo
                }, '*');
                
                // Đóng popup ngay lập tức
                window.close();
              }
            })();
          </script>
        </body>
        </html>
      `);
    }
    
    // Normal session-based redirect
    res.redirect('/dashboard');
  }
);

// Route for logout
router.get('/logout', (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

module.exports = router;
