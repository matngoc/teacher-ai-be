# 🚀 Teacher AI Backend - Cloud Deployment Setup

Hướng dẫn deploy Teacher AI Backend lên Ubuntu Cloud Server của bạn.

## 📁 Các File Được Cập Nhật/Tạo Mới

### Configuration (Cấu hình)
- **docker-compose.yml** - Orchestration file cho tất cả services
- **.env.example** - Template cấu hình development
- **.env.production** - Template cấu hình production

### Docker (Container)
- **Dockerfile** - Build instructions cho NestJS app
- **.dockerignore** - Exclude files từ build

### Deployment (Triển khai)
- **deploy.sh** - Bash script để quản lý services
- **DEPLOYMENT_GUIDE.md** - Hướng dẫn chi tiết (Tiếng Việt)
- **DEPLOYMENT_CHANGES.md** - Tóm tắt các thay đổi
- **nginx.conf.example** - Cấu hình reverse proxy (optional)

### Application (Ứng dụng)
- **src/app.module.ts** - Updated để sử dụng environment variables

## ⚡ Quick Start (Deploy trong 5 phút)

### 1. Chuẩn bị Server
```bash
# SSH vào server Ubuntu của bạn
ssh user@your-server-ip

# Cài đặt Docker & Docker Compose (nếu chưa có)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. Upload Project
```bash
# Cách 1: Nếu dùng Git
git clone <your-repo-url> teacher-ai-be
cd teacher-ai-be

# Cách 2: Nếu upload file
scp -r teacher-ai-be user@your-server:/home/user/
cd teacher-ai-be
```

### 3. Cấu hình Environment
```bash
# Copy file cấu hình
cp .env.example .env

# Chỉnh sửa cấu hình (QUAN TRỌNG!)
nano .env

# Cập nhật các mật khẩu:
# - MYSQL_ROOT_PASSWORD
# - MYSQL_PASSWORD
# - MINIO_ROOT_PASSWORD
# - JWT_SECRET
```

### 4. Deploy
```bash
# Method 1: Sử dụng docker-compose trực tiếp
docker-compose up -d

# Method 2: Sử dụng deploy script (nếu có)
chmod +x deploy.sh
./deploy.sh start
```

### 5. Kiểm tra Status
```bash
docker-compose ps
docker-compose logs -f api
```

## 🌐 Truy cập Ứng dụng

Sau deployment, truy cập:
- **API**: `http://your-server-ip:8080/api`
- **Swagger Docs**: `http://your-server-ip:8080/api`
- **MinIO Console**: `http://your-server-ip:9001`

## 📚 Dokumentation

Để hiểu rõ hơn, đọc các file:

1. **DEPLOYMENT_GUIDE.md** - Hướng dẫn chi tiết đầy đủ
2. **DEPLOYMENT_CHANGES.md** - Tóm tắt các thay đổi
3. **docker-compose.yml** - Cấu hình services

## 🛠️ Các Lệnh Hữu Ích

```bash
# Khởi động
docker-compose up -d

# Dừng
docker-compose down

# Xem logs của API
docker-compose logs -f api

# Xem logs của MySQL
docker-compose logs -f mysql

# Xem status
docker-compose ps

# Rebuild images
docker-compose build

# Xem resource usage
docker stats

# Backup database
docker-compose exec mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD teacher-ai > backup.sql
```

## 🔐 Security Checklist

- [ ] Đổi tất cả mật khẩu mặc định trong .env
- [ ] Cấu hình firewall UFW
- [ ] Sử dụng SSH keys thay vì passwords
- [ ] Enable SSL/TLS (dùng Nginx + Let's Encrypt)
- [ ] Thường xuyên backup database
- [ ] Monitor logs định kỳ

## ⚠️ Cảnh Báo Quan Trọng

1. **Không commit .env vào Git!** File này chứa thông tin nhạy cảm
2. **Sử dụng mật khẩu mạnh** cho tất cả services
3. **Thường xuyên backup** database và minIO data
4. **Cấu hình firewall** để chỉ cho phép traffic cần thiết
5. **Giữ Docker updated** để tránh security vulnerabilities

## 🆘 Troubleshooting

Nếu gặp vấn đề:

1. Kiểm tra logs: `docker-compose logs -f`
2. Kiểm tra network: `docker-compose exec api ping mysql`
3. Kiểm tra ports: `sudo netstat -tlnp`
4. Xem DEPLOYMENT_GUIDE.md phần Troubleshooting

## 📞 Cần Giúp?

- Kiểm tra DEPLOYMENT_GUIDE.md
- Xem logs trong docker-compose: `docker-compose logs`
- Kiểm tra status services: `docker-compose ps`
- Kiểm tra resource usage: `docker stats`

## 📈 Next Steps (Tùy Chọn)

1. **Setup Domain + SSL**
   - Point domain tới server IP
   - Dùng Let's Encrypt cho SSL
   - Cấu hình Nginx (nginx.conf.example)

2. **Monitoring**
   - Setup log aggregation
   - Configure alerts
   - Monitor resource usage

3. **Backup Strategy**
   - Automate daily backups
   - Store backups off-server
   - Test restore procedures

---

**Happy Deploying! 🎉**

Nếu có câu hỏi, refer to **DEPLOYMENT_GUIDE.md** for detailed instructions.

