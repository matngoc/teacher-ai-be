# 🚀 Deployment Checklist - Teacher AI Backend

## ✅ Pre-Deployment (Trước khi deploy)

- [ ] Clone hoặc upload project lên Ubuntu server
- [ ] Kiểm tra Docker & Docker Compose đã cài đặt
- [ ] Kiểm tra disk space tối thiểu 10GB
- [ ] Kiểm tra ports 8080, 3306, 9000, 9001 có sẵn

## ✅ Configuration (Cấu hình)

- [ ] Copy `.env.example` → `.env`
- [ ] Cập nhật `MYSQL_ROOT_PASSWORD` (bảo đảm mạnh)
- [ ] Cập nhật `MYSQL_PASSWORD` (khác root password)
- [ ] Cập nhật `MINIO_ROOT_PASSWORD` (bảo đảm mạnh)
- [ ] Cập nhật `JWT_SECRET` (random string, 32+ chars)
- [ ] Kiểm tra `API_PORT` (default: 8080)
- [ ] Kiểm tra `NODE_ENV=production`

## ✅ Docker Setup (Docker)

- [ ] Docker engine running: `docker --version`
- [ ] Docker compose working: `docker-compose --version`
- [ ] User trong docker group (hoặc dùng sudo): `docker ps`

## ✅ Deployment (Deploy)

- [ ] Navigate đến project directory: `cd teacher-ai-be`
- [ ] Build images: `docker-compose build`
- [ ] Start services: `docker-compose up -d`
- [ ] Wait 30 seconds cho services khởi động
- [ ] Check status: `docker-compose ps`

## ✅ Verification (Xác minh)

- [ ] MySQL container running: `docker-compose ps mysql`
- [ ] MinIO container running: `docker-compose ps minio`
- [ ] API container running: `docker-compose ps api`
- [ ] All containers healthy: `docker-compose ps | grep "healthy"`

## ✅ Connectivity Tests (Kiểm tra kết nối)

```bash
# Chạy từ server
docker-compose exec api curl http://mysql:3306 -s
docker-compose exec api ping minio -c 1
docker-compose exec mysql mysqladmin ping -h localhost -u root -p$MYSQL_ROOT_PASSWORD
```

- [ ] API can connect to MySQL
- [ ] API can reach MinIO
- [ ] All services communicating properly

## ✅ API Endpoints (Kiểm tra API)

```bash
# Kiểm tra từ local machine
curl http://your-server-ip:8080/api
```

- [ ] API responding at `http://your-server-ip:8080/api`
- [ ] Swagger docs accessible at `http://your-server-ip:8080/api`
- [ ] Health check passing

## ✅ MinIO Console (MinIO)

- [ ] MinIO Console accessible at `http://your-server-ip:9001`
- [ ] Login successful with minioadmin credentials
- [ ] Create uploads bucket (nếu chưa tồn tại)

## ✅ Security (Bảo mật)

- [ ] .env file KHÔNG được commit
- [ ] .env.production KHÔNG chứa hard-coded secrets
- [ ] UFW firewall configured (nếu cần)
- [ ] Only necessary ports open (8080, 9000, 9001)
- [ ] SSH keys used (không password login)
- [ ] Disable root login via SSH (nếu possible)

## ✅ Backup (Sao lưu)

- [ ] Test database backup: `docker-compose exec mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD teacher-ai > test_backup.sql`
- [ ] Verify backup file created
- [ ] Test restore procedure
- [ ] Setup automated backup (cron job hoặc tương tự)

## ✅ Monitoring (Giám sát)

- [ ] Check logs regularly: `docker-compose logs -f api`
- [ ] Monitor resources: `docker stats`
- [ ] Setup log rotation (nếu cần)
- [ ] Monitor disk usage: `df -h`

## ✅ Documentation (Tài liệu)

- [ ] Read QUICK_DEPLOY.md
- [ ] Read DEPLOYMENT_GUIDE.md (nếu cần chi tiết)
- [ ] Bookmark DEPLOYMENT_GUIDE.md for reference
- [ ] Keep deploy.sh accessible
- [ ] Document any custom configurations

## ✅ Post-Deployment (Sau deploy)

- [ ] Test all API endpoints
- [ ] Verify file uploads work (MinIO)
- [ ] Test database operations
- [ ] Check error logs for issues
- [ ] Confirm all services auto-restart on reboot

## ⚠️ Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port already in use | Change port in .env or stop conflicting service |
| MySQL connection failed | Check DB_HOST, DB_PORT, credentials in .env |
| MinIO not accessible | Check MINIO_ROOT_PASSWORD, firewall rules |
| API not responding | Check logs: `docker-compose logs -f api` |
| Containers keep restarting | Check logs, verify .env configuration |
| High CPU/Memory usage | Check logs, optimize queries, monitor with `docker stats` |

## 🔄 Deployment Workflow

```
1. Prepare Server
   ↓
2. Clone Project
   ↓
3. Configure .env
   ↓
4. Build Images
   ↓
5. Start Services
   ↓
6. Verify Connectivity
   ↓
7. Test API Endpoints
   ↓
8. Configure Security
   ↓
9. Setup Monitoring
   ↓
10. Setup Backups
```

## 📞 Troubleshooting Steps

If something goes wrong:

1. **Check Status**: `docker-compose ps`
2. **View Logs**: `docker-compose logs -f`
3. **Check Specific Service**: `docker-compose logs -f [service-name]`
4. **Verify Network**: `docker-compose exec api ping mysql`
5. **Check Ports**: `sudo netstat -tlnp | grep -E ':8080|:3306|:9000'`
6. **Restart Services**: `docker-compose restart`
7. **Rebuild**: `docker-compose down && docker-compose up -d`

## 📝 Notes Section

Use this space to document your specific setup:

```
Server IP: ____________________
Domain: ____________________
Backup Location: ____________________
Admin Contact: ____________________
Last Updated: ____________________
```

---

## ✨ Checklist Complete!

Setelah menyelesaikan semua item di atas, aplikasi Anda seharusnya:
- ✅ Fully operational
- ✅ Properly configured
- ✅ Secured
- ✅ Monitored
- ✅ Backed up

**Congratulations! Your deployment is complete. 🎉**

---

Last updated: January 2026

