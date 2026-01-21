# Hướng dẫn Deploy Teacher AI Backend lên Ubuntu Cloud Server

## Yêu cầu tiên quyết

- Ubuntu 20.04 LTS hoặc mới hơn
- Docker Engine 20.10+
- Docker Compose 2.0+
- Minimum 2GB RAM, 10GB disk space

## Các bước chuẩn bị Server

### 1. Cập nhật hệ thống
```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Cài đặt Docker
```bash
# Xóa các phiên bản Docker cũ nếu có
sudo apt remove docker docker-engine docker.io containerd runc

# Cài đặt các dependencies
sudo apt install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Thêm Docker GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Thêm Docker repository
echo \
  "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Cài đặt Docker Engine
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Khởi động Docker
sudo systemctl start docker
sudo systemctl enable docker

# Thêm user vào group docker (optional, để không cần sudo)
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Cài đặt Docker Compose
```bash
# Tải Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# Cấp quyền thực thi
sudo chmod +x /usr/local/bin/docker-compose

# Kiểm tra cài đặt
docker-compose --version
```

## Deployment

### 1. Clone hoặc Upload Project
```bash
# Nếu project ở trên GitHub
git clone <your-repo-url>
cd teacher-ai-be

# Hoặc upload bằng SCP
# scp -r /local/path/to/teacher-ai-be user@server:/home/user/
```

### 2. Cấu hình Environment Variables
```bash
# Copy file production env
cp .env.production .env

# Chỉnh sửa file .env với thông tin thực tế
nano .env
```

**Các biến quan trọng cần cập nhật:**
```env
# Database
MYSQL_ROOT_PASSWORD=your_very_secure_password
MYSQL_PASSWORD=your_secure_db_password

# MinIO
MINIO_ROOT_PASSWORD=your_secure_minio_password

# JWT
JWT_SECRET=your_super_secure_jwt_secret_key_here

# API Port (đổi nếu cần)
API_PORT=8080
```

### 3. Build và Start Containers
```bash
# Build images (lần đầu tiên)
docker-compose build

# Start services
docker-compose up -d

# Xem logs
docker-compose logs -f api
```

### 4. Kiểm tra Status
```bash
# Kiểm tra containers đang chạy
docker-compose ps

# Kiểm tra logs của tất cả services
docker-compose logs

# Kiểm tra logs của service cụ thể
docker-compose logs api
docker-compose logs mysql
docker-compose logs minio
```

## Truy cập Ứng dụng

- **API**: `http://your-server-ip:8080/api`
- **Swagger Documentation**: `http://your-server-ip:8080/api`
- **MinIO Console**: `http://your-server-ip:9001`
  - Username: `minioadmin`
  - Password: (từ MINIO_ROOT_PASSWORD trong .env)

## Cấu hình Firewall (nếu cần)

```bash
# Cho phép SSH
sudo ufw allow 22/tcp

# Cho phép API port
sudo ufw allow 8080/tcp

# Cho phép MinIO API
sudo ufw allow 9000/tcp

# Cho phép MinIO Console
sudo ufw allow 9001/tcp

# Cho phép MySQL (chỉ từ localhost)
# sudo ufw allow from 127.0.0.1 to any port 3306

# Bật UFW
sudo ufw enable
```

## Các lệnh quản lý hữu ích

```bash
# Dừng tất cả services
docker-compose down

# Dừng services nhưng giữ lại data
docker-compose stop

# Khởi động lại services
docker-compose restart

# Xem resource usage
docker stats

# Xem logs theo thời gian thực
docker-compose logs -f --tail=100

# Xóa tất cả containers, volumes (CẢNH BÁO: mất dữ liệu!)
docker-compose down -v

# Rebuild images và start
docker-compose up --build -d
```

## Backup Database

```bash
# Backup MySQL database
docker-compose exec mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD teacher-ai > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore dari backup
docker-compose exec -T mysql mysql -u root -p$MYSQL_ROOT_PASSWORD teacher-ai < backup_20240101_120000.sql
```

## Troubleshooting

### Containers không khởi động
```bash
# Kiểm tra logs chi tiết
docker-compose logs -f api

# Kiểm tra health status
docker-compose ps
```

### Database connection failed
- Kiểm tra MySQL service đang chạy: `docker-compose ps mysql`
- Kiểm tra environment variables trong .env
- Đảm bảo database đã tạo thành công

### MinIO issues
- Kiểm tra `/data` directory permissions
- Kiểm tra MINIO_ROOT_PASSWORD trong .env
- Truy cập console tại `http://your-server-ip:9001`

### Port conflicts
```bash
# Kiểm tra port đang sử dụng
sudo netstat -tlnp | grep -E ':8080|:3306|:9000|:9001'

# Đổi port trong docker-compose.yml nếu cần
```

## Performance Tips

1. **Allocate sufficient resources**: Đảm bảo server có đủ RAM và disk space
2. **Enable automatic backups**: Cấu hình backup script hàng ngày
3. **Monitor logs regularly**: Kiểm tra logs định kỳ
4. **Keep Docker updated**: Cập nhật Docker Engine thường xuyên
5. **Use strong passwords**: Sử dụng mật khẩu mạnh cho tất cả services

## Support

Nếu gặp vấn đề, kiểm tra:
1. Docker logs: `docker-compose logs`
2. Service health: `docker-compose ps`
3. Network connectivity: `docker-compose exec api curl http://mysql:3306`
4. Disk space: `df -h`
5. Memory usage: `free -h`

