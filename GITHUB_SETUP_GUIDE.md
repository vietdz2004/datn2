# 🚀 Hướng dẫn đưa project lên GitHub

## Bước 1: Tạo repository trên GitHub
1. Đi tới https://github.com
2. Click nút "New" hoặc "+" → "New repository"
3. Nhập tên repository: **hoats**
4. Description: **🌸 HoaShop - Modern E-commerce Platform for Flower Shop**
5. Chọn **Public** (hoặc Private nếu muốn)
6. **KHÔNG** check "Add a README file" (vì đã có rồi)
7. Click "Create repository"

## Bước 2: Connect và push code
Sau khi tạo xong, GitHub sẽ cho bạn URL repository. Chạy lệnh:

```bash
# Thay YOUR_USERNAME bằng username GitHub của bạn
git remote add origin https://github.com/YOUR_USERNAME/hoats.git

# Push code lên GitHub
git push -u origin main
```

## Bước 3: Verify
Kiểm tra repository trên GitHub để đảm bảo code đã được upload thành công.

## 📋 Thông tin repository

**Tên:** hoats
**Mô tả:** 🌸 HoaShop - Modern E-commerce Platform for Flower Shop
**Công nghệ:** Node.js, React, MySQL, Express, Vite
**Tính năng nổi bật:** Advanced search, order management, real-time statistics

## 🔧 Setup cho contributors

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/hoats.git
cd hoats

# Setup backend
cd be
npm install
cp config.env.example config.env
# Cập nhật database credentials trong config.env
npm start

# Setup frontend (terminal mới)
cd fe
npm install
npm run dev

# Setup admin (terminal mới)
cd admin-fe
npm install
npm run dev
```

## 🌟 Repository structure đã được optimize:
- ✅ .gitignore đầy đủ
- ✅ README.md chi tiết
- ✅ Commit message chuẩn
- ✅ 403 files được track
- ✅ Main branch setup

**Repository đã sẵn sàng để public! 🎉**
