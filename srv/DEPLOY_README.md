# Universal Deployment Script

## Mô tả
Script PowerShell tự động để build và deploy ứng dụng Docker lên server remote.
**Script có thể tái sử dụng cho nhiều project khác nhau.**

## Files

### 1. `deploy.ps1` - Universal deployment script
Script chính có thể cấu hình cho nhiều project:
- Build Docker image từ Dockerfile tùy chọn
- Save image thành file tar với timestamp
- Upload lên server qua SCP
- Deploy container trên server với cấu hình tùy chỉnh
- **Đọc thông tin SSH từ file .env** 
- **Hỗ trợ mã hóa password với SECRET_CODE**
- Health check và cleanup
- Hỗ trợ nhiều phương thức SSH (plink, sshpass, manual)

### 2. `encrypt-password.ps1` - Password encryption utility
Script helper để mã hóa password SSH:
- Mã hóa password với SECRET_CODE
- Tạo SSH_PASS_SEC cho file .env
- Bảo mật hơn so với plaintext password

**Cách sử dụng:**
```powershell
# Chạy với cấu hình mặc định (OAuth server)
.\deploy.ps1

# Chạy cho project khác
.\deploy.ps1 -AppName "my-api-server" -AppPort "3000" -DockerFile "Dockerfile" -ImageName "my-api"

# Chỉ cung cấp username, password sẽ được yêu cầu nhập
.\deploy.ps1 -Username "admin"
```

**Parameters cho tái sử dụng:**
- `-AppName`: Tên ứng dụng thực (container name, db folder = db/$AppName) (default: "oauth")
- `-AppPort`: Port của ứng dụng (default: đọc từ .env PORT hoặc "2444") 
- `-DockerFile`: File Dockerfile sử dụng (default: "Dockerfile_arm64")
- `-ImageName`: Tên Docker image (default: "oauth-server")
- `-ImageTag`: Tag của image (default: "arm64")
- `-EnvFile`: Suffix của environment file (default: "oauth")

**Parameters server:**
- `-ServerIP`: IP của server đích (default: 192.168.1.169)
- `-Username`: Username SSH (nếu không cung cấp sẽ yêu cầu nhập)
- `-Password`: Password SSH (nếu không cung cấp sẽ yêu cầu nhập an toàn)
- `-TargetFolder`: Thư mục đích trên server (default: /node-server/)

## Tái sử dụng cho project khác

Script có thể dễ dàng sử dụng cho các project khác:

### Ví dụ cho API Server:
```powershell
.\deploy.ps1 -AppName "api-server" -AppPort "3000" -DockerFile "Dockerfile" -ImageName "my-api-image" -ImageTag "latest"
```

### Ví dụ cho Web App:
```powershell
.\deploy.ps1 -AppName "webapp" -AppPort "8080" -DockerFile "Dockerfile.prod" -ImageName "my-webapp-image"
```

### Cấu trúc files cần thiết:
```
project/
├── deploy.ps1          # Copy script này vào
├── Dockerfile          # File Docker cho project
├── DEPLOY_README.md    # Copy docs này vào
└── src/               # Source code
```

### Cấu trúc trên server:
- Container name: `$AppName`
- Database volume: `./db/$AppName:/app/db` (tự động theo tên app)
- Environment file: `./.env_$EnvFile:/app/.env:ro`
- Port mapping: `$AppPort:$AppPort`

## Yêu cầu hệ thống

### Trên máy local (Windows):
- PowerShell 5.1+
- Docker Desktop
- SSH client (Windows 10+ có sẵn OpenSSH)

### Trên server đích (Linux):
- Docker engine
- SSH server
- User có quyền chạy Docker

## Cấu hình SSH tự động từ .env

Script có thể đọc thông tin SSH từ file `.env` để tránh phải nhập thủ công:

### Cấu hình .env file:
```bash
# SSH server configuration
SSH_HOST=192.168.1.169
SSH_USER=taducanh1605

# Option 1: Encrypted password (khuyến nghị)
SECRET_CODE=MySecret123!
SSH_PASS_SEC=GREy

# Option 2: Plaintext password (không khuyến nghị)
# SSH_PASS=your_password
```

### Mã hóa password:
```powershell
# Sử dụng script helper để mã hóa password
.\encrypt-password.ps1 -Password "your_password" -SecretCode "your_secret_key"

# Hoặc chạy interactive
.\encrypt-password.ps1
```

### Ưu tiên đọc thông tin:
1. **Parameters** truyền vào script
2. **File .env** (SSH_HOST, SSH_USER, SSH_PASS_SEC + SECRET_CODE)
3. **Nhập thủ công** từ bàn phím

## Troubleshooting

### Docker not running error
```
error during connect: Get "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/v1.51/version": open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```
**Solution:** Start Docker Desktop and wait for it to fully load before running the script.

### SSH connection error
```powershell
# Test SSH connection
ssh test@192.169.1.169

# Test with verbose
ssh -v test@192.169.1.169
```

### Docker permissions error on server
```bash
# Add user to docker group
sudo usermod -aG docker test
sudo systemctl restart docker
```

### Port already in use error
```bash
# Check port usage
netstat -tulpn | grep 2444

# Kill process using port
sudo fuser -k 2444/tcp
```

### Docker image build error
```powershell
# Check Docker status
docker version
docker system info

# Clean Docker cache
docker system prune -f
```

## Cấu trúc deployment

```
Local Machine (Windows)
├── Build Docker image từ Dockerfile_arm64
├── Save image → oauth-server.tar
└── Upload qua SCP → Server

Remote Server (Linux)
├── Receive oauth-server.tar tại /node-server/
├── Load Docker image
├── Stop container cũ (nếu có)
├── Run container mới
└── Cleanup tar file
```

## Container configuration

Container được chạy với:
- **Name**: oauth-container
- **Port mapping**: 2444:2444
- **Restart policy**: unless-stopped
- **Network**: bridge (default)

## Monitoring

Sau khi deploy, kiểm tra:
```bash
# Xem container đang chạy
docker ps | grep oauth-container

# Xem logs
docker logs oauth-container

# Health check
curl http://localhost:2444/health
```

## Security Notes

**Lưu ý bảo mật:**
- Password được nhập từ bàn phím một cách an toàn (SecureString)
- Username và password không được lưu trong script
- Nên sử dụng SSH keys thay vì password cho production
- Cân nhắc sử dụng Docker secrets cho production
- Firewall rules cho port 2444

## Interactive Usage

Khi chạy script mà không cung cấp username/password:
```powershell
.\deploy.ps1

# Output:
# Nhập username SSH: your-username
# Nhập password SSH cho user 'your-username': ********
# [10:30:15] Kết nối đến: your-username@192.169.1.169
```

## Automation

Để tự động deploy khi có code changes:
```powershell
# Tạo scheduled task hoặc sử dụng với Git hooks
# Ví dụ: chạy deploy sau khi push code
```
