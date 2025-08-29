// tạo và xác thực với JWT token

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Secret key cho JWT (nên lưu trong .env)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key';

// Middleware để verify JWT token
const verifyToken = async (req, res, next) => {
  try {
    // Lấy token từ Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Không có token, để các middleware khác xử lý
    }

    const token = authHeader.split(' ')[1];
    
    // Verify và decode token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Lấy thông tin user từ database
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    // Gắn user info vào req để sử dụng trong route handlers
    req.tokenUser = user;
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Token verification failed'
      });
    }
  }
};

// Function để tạo JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id,
      email: user.email,
      name: user.name 
    },
    JWT_SECRET,
    { expiresIn: '30d' } // Token hết hạn sau 30 ngày
  );
};

module.exports = {
  verifyToken,
  generateToken
};
