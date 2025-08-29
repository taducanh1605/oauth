# OAuth Authentication Portal

Một ứng dụng web tĩnh (client-side) để quản lý xác thực OAuth với nhiều phương thức đăng nhập.

## Tính năng

### 🔐 Xác thực đa phương thức
- **Đăng nhập local**: Sử dụng email/password
- **Google OAuth**: Đăng nhập qua tài khoản Google
- **Facebook OAuth**: Đăng nhập qua tài khoản Facebook

### 👤 Quản lý người dùng
- Đăng ký tài khoản mới với email/password
- Hiển thị thông tin người dùng đã đăng nhập
- Đăng xuất an toàn

### 📱 Quản lý ứng dụng
- Xem danh sách ứng dụng đã đăng ký với server OAuth
- Thống kê số lần đăng nhập cho từng ứng dụng
- Làm mới danh sách ứng dụng

### 🎨 Giao diện hiện đại
- Thiết kế one-page với tab navigation
- Giao diện sáng, border cong các góc
- Responsive design cho mọi thiết bị
- Toast notifications cho feedback người dùng
- Loading states cho better UX

### 🔍 Monitoring
- Kiểm tra trạng thái server real-time
- Chỉ hiển thị chức năng khi server online
- Thông báo khi mất kết nối

## Cấu trúc files

```
app/
├── index.html      # Trang chính với layout và structure
├── styles.css      # Stylesheet với thiết kế hiện đại
├── script.js       # JavaScript xử lý logic và API calls
├── test.html       # Trang test API endpoints
└── README.md       # Documentation này
```

## Cấu hình

### Server URL
Mặc định ứng dụng kết nối đến server ở `https://pika-proxy.taducanhbkhn.workers.dev`. Để thay đổi, sửa trong `script.js`:

```javascript
const API_BASE = "https://your-server-url";
const CONFIG = {
    SERVER_URL: API_BASE,
    // ...
};
```

### API Endpoints sử dụng

- `GET /health` - Kiểm tra trạng thái server
- `POST /api/login` - Đăng nhập local
- `POST /api/register` - Đăng ký tài khoản mới
- `GET /api/user/apps` - Lấy danh sách ứng dụng của user
- `GET /auth/google` - OAuth redirect cho Google
- `GET /auth/facebook` - OAuth redirect cho Facebook

## Cách chạy

### 1. Cách đơn giản - Mở trực tiếp file HTML
```bash
# Mở file index.html trong trình duyệt
# Hoàn toàn tĩnh, không cần server
```

### 2. Sử dụng Live Server (VS Code)
```bash
# Cài Live Server extension trong VS Code
# Right-click index.html → "Open with Live Server"
```

### 3. Deploy lên GitHub Pages
```bash
# Push code lên GitHub repository
# Enable GitHub Pages trong Settings
# Truy cập: https://username.github.io/repository-name
```

## Sử dụng

### 1. Khởi động
- Mở ứng dụng trong trình duyệt
- Hệ thống sẽ tự động kiểm tra trạng thái server
- Nếu server offline, tất cả chức năng sẽ bị ẩn

### 2. Đăng nhập
- **Tab "Đăng nhập"**: 
  - Nhập email/password cho local account
  - Hoặc click "Đăng nhập với Google/Facebook"
- Sau khi đăng nhập thành công, thông tin user hiển thị ở góc phải màn hình

### 3. Đăng ký
- **Tab "Đăng ký"**: 
  - Điền đầy đủ thông tin
  - Password tối thiểu 6 ký tự
  - Confirm password phải khớp
- Sau đăng ký thành công, tự động chuyển sang tab đăng nhập

### 4. Xem ứng dụng
- **Tab "Ứng dụng"**:
  - Chỉ hiển thị khi đã đăng nhập
  - Danh sách ứng dụng đã từng đăng nhập
  - Click "Làm mới" để cập nhật

## Tính năng bảo mật

### JWT Token Management
- Token được lưu trong localStorage
- Auto-logout khi token hết hạn
- Gửi token trong Authorization header

### Validation
- Client-side validation cho forms
- Server-side validation qua API
- Error handling toàn diện

### CORS Handling
- Server cần cấu hình CORS properly
- Credentials được include trong requests

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support  
- Safari: ✅ Full support
- IE 11: ❌ Không hỗ trợ (do sử dụng ES6+)

## Troubleshooting

### Server không kết nối được
- Kiểm tra server có chạy không
- Xác nhận URL trong CONFIG đúng
- Check CORS configuration trên server

### Social login không hoạt động
- Cần cấu hình OAuth apps trên Google/Facebook
- Server cần implement callback handlers
- Check redirect URLs

### Token expired
- Ứng dụng sẽ tự động logout
- User cần đăng nhập lại
- Token được tự động cleanup

## Development Notes

### State Management
- `currentUser`: Thông tin user hiện tại
- `serverOnline`: Trạng thái kết nối server
- localStorage: Persistent storage cho auth data

### Event Handling
- Form submissions với preventDefault
- Tab switching với event delegation
- Network status monitoring

### Error Handling
- Global error handler
- Network error handling
- API error handling với user-friendly messages

## Future Enhancements

- [ ] Remember me functionality
- [ ] Password reset flow
- [ ] Profile editing
- [ ] App permissions management
- [ ] Dark mode toggle
- [ ] Multi-language support
- [ ] Offline mode với service worker
