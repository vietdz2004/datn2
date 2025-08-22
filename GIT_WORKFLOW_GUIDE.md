# 🔄 Quy trình làm việc với Git - Từ Clone đến Push

## 📥 BƯỚC 1: LẤY CODE TỪ GITHUB VỀ

### Clone repository lần đầu:
```bash
# Clone project về máy local
git clone https://github.com/vietdz2004/datn2.git
cd datn2

# Kiểm tra trạng thái
git status
git branch
```

### Nếu đã có project, cập nhật code mới nhất:
```bash
# Vào thư mục project
cd datn2

# Lấy code mới nhất từ GitHub
git pull origin main

# Hoặc chi tiết hơn:
git fetch origin        # Lấy thông tin mới
git merge origin/main   # Merge code mới
```

## 💻 BƯỚC 2: SETUP PROJECT TRÊN MÁY LOCAL

### Backend setup:
```bash
cd be
npm install
cp config.env.example config.env
# Chỉnh sửa config.env với thông tin database của bạn
npm start
```

### Frontend setup:
```bash
cd fe
npm install
npm run dev
```

### Admin Frontend setup:
```bash
cd admin-fe
npm install
npm run dev
```

## ⚙️ BƯỚC 3: LÀM VIỆC VÀ PHÁT TRIỂN

### Tạo branch mới cho feature:
```bash
# Tạo và chuyển sang branch mới
git checkout -b feature/ten-tinh-nang-moi

# Hoặc
git branch feature/ten-tinh-nang-moi
git checkout feature/ten-tinh-nang-moi
```

### Một số ví dụ branch names:
```bash
git checkout -b feature/advanced-search
git checkout -b bugfix/order-status-display
git checkout -b improvement/ui-responsive
git checkout -b hotfix/critical-payment-bug
```

## 📝 BƯỚC 4: COMMIT CHANGES

### Kiểm tra thay đổi:
```bash
# Xem files đã thay đổi
git status

# Xem chi tiết thay đổi
git diff

# Xem thay đổi của file cụ thể
git diff be/controllers/orderController.js
```

### Add và commit:
```bash
# Add files cụ thể
git add be/controllers/orderController.js
git add admin-fe/src/components/Search/AdvancedSearch.jsx

# Hoặc add tất cả
git add .

# Commit với message mô tả
git commit -m "✨ Add advanced search functionality

- Implement smart search by order ID, phone, email
- Add date range and amount filtering
- Add real-time statistics display
- Optimize database queries for performance"
```

### Commit message conventions:
```bash
# Tính năng mới
git commit -m "✨ feat: Add advanced order search"

# Sửa bug
git commit -m "🐛 fix: Fix order status display issue"

# Cải thiện performance
git commit -m "⚡ perf: Optimize database queries"

# Cập nhật documentation
git commit -m "📝 docs: Update API documentation"

# Refactor code
git commit -m "♻️ refactor: Simplify order status logic"

# UI/UX improvements
git commit -m "💄 style: Improve responsive design"
```

## 🔄 BƯỚC 5: SYNC VỚI REMOTE

### Trước khi push, luôn pull latest:
```bash
# Chuyển về main branch
git checkout main

# Pull latest changes
git pull origin main

# Quay lại feature branch
git checkout feature/ten-tinh-nang-moi

# Merge main vào feature branch (để tránh conflict)
git merge main
```

### Xử lý conflicts (nếu có):
```bash
# Nếu có conflict, Git sẽ báo
# Mở files conflict trong editor và sửa
# Sau khi sửa xong:
git add .
git commit -m "🔀 resolve merge conflicts"
```

## 📤 BƯỚC 6: PUSH CODE LÊN GITHUB

### Push feature branch:
```bash
# Push feature branch lần đầu
git push -u origin feature/ten-tinh-nang-moi

# Các lần push tiếp theo
git push
```

### Hoặc push trực tiếp lên main (cho project cá nhân):
```bash
git checkout main
git merge feature/ten-tinh-nang-moi
git push origin main
```

## 🔀 BƯỚC 7: CREATE PULL REQUEST (Nếu làm team)

1. Vào GitHub repository
2. Click "Compare & pull request"
3. Viết mô tả chi tiết về thay đổi
4. Assign reviewers
5. Submit pull request

## 🧹 BƯỚC 8: DỌN DẸP

### Sau khi merge xong:
```bash
# Xóa branch local
git branch -d feature/ten-tinh-nang-moi

# Xóa branch remote
git push origin --delete feature/ten-tinh-nang-moi

# Cập nhật main
git checkout main
git pull origin main
```

## 🚨 QUY TRÌNH EMERGENCY HOTFIX

### Khi cần fix bug gấp trên production:
```bash
# Tạo hotfix branch từ main
git checkout main
git pull origin main
git checkout -b hotfix/critical-bug-fix

# Fix bug và test
# ... code ...

# Commit và push ngay
git add .
git commit -m "🚨 hotfix: Fix critical payment bug"
git push -u origin hotfix/critical-bug-fix

# Merge ngay vào main
git checkout main
git merge hotfix/critical-bug-fix
git push origin main

# Dọn dẹp
git branch -d hotfix/critical-bug-fix
git push origin --delete hotfix/critical-bug-fix
```

## 📊 USEFUL GIT COMMANDS

### Xem lịch sử:
```bash
git log --oneline                    # Lịch sử ngắn gọn
git log --graph --oneline --all      # Lịch sử dạng graph
git show <commit-hash>               # Chi tiết commit
```

### Undo changes:
```bash
git checkout -- <file>              # Undo changes chưa add
git reset HEAD <file>                # Unstage file
git reset --soft HEAD~1              # Undo last commit, keep changes
git reset --hard HEAD~1              # Undo last commit, discard changes
```

### Stash (tạm cất thay đổi):
```bash
git stash                           # Cất thay đổi hiện tại
git stash pop                       # Lấy lại thay đổi đã cất
git stash list                      # Xem danh sách stash
git stash apply stash@{0}           # Apply stash cụ thể
```

### Remote management:
```bash
git remote -v                       # Xem remote URLs
git remote set-url origin <new-url> # Đổi remote URL
git fetch --all                     # Fetch tất cả branches
```

## 🎯 BEST PRACTICES

### 1. Commit thường xuyên:
- Commit nhỏ, commit thường
- Mỗi commit chỉ làm 1 việc
- Message commit rõ ràng

### 2. Branch naming:
```
feature/user-authentication
bugfix/cart-calculation-error
improvement/database-performance
hotfix/security-vulnerability
```

### 3. Trước mỗi lần làm việc:
```bash
git checkout main
git pull origin main
git checkout -b feature/new-feature
```

### 4. Trước mỗi lần push:
```bash
git status              # Kiểm tra changes
git diff                # Review changes
git pull origin main    # Sync latest
```

### 5. File .gitignore quan trọng:
```gitignore
node_modules/
.env
config.env
*.log
dist/
build/
.vscode/
```

## 🔗 TEAM WORKFLOW

### Developer A:
```bash
git checkout -b feature/advanced-search
# ... code ...
git commit -m "✨ Add search functionality"
git push -u origin feature/advanced-search
# Create Pull Request
```

### Developer B:
```bash
git checkout main
git pull origin main  # Get A's merged code
git checkout -b feature/order-management
# ... code ...
```

---

**💡 Tip:** Luôn backup code quan trọng và test kỹ trước khi push lên main branch!
