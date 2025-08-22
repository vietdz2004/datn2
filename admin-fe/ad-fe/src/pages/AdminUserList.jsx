import React, { useEffect, useState } from "react";
import userService from "../services/userService";
import UserDetailModal from "../components/User/UserDetailModal";
import "./AdminUserList.css";

const roleOptions = ["", "KHACH_HANG", "NHAN_VIEN", "QUAN_LY"];
const statusOptions = ["", "HOAT_DONG", "DA_KHOA", "TAM_KHOA"];

// Trang quản lý người dùng cho admin
export default function AdminUserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");

  // Hàm load danh sách user từ API
  const loadUsers = () => {
    setLoading(true);
    setError("");
    userService.getAll({ search, vaiTro: role, status, page, limit: 10 })
      .then(res => {
        const data = res.data.data || res.data.users || [];
        setUsers(data);
        setTotalPages(res.data.pagination?.totalPages || 1);
        setTotalUsers(res.data.pagination?.total || data.length);
      })
      .catch(err => {
        setError(err.response?.data?.message || "Lỗi tải danh sách người dùng");
        console.error("Load users error:", err);
      })
      .finally(() => setLoading(false));
  };

  // Khi filter/search/page thay đổi thì load lại user
  useEffect(() => {
    loadUsers();
  }, [search, role, status, page]);

  // Mở popup chi tiết user
  const handleShowDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await userService.getById(id);
      setSelectedUser(res.data.data || res.data);
      setShowDetail(true);
    } catch (err) {
      setError("Lỗi tải thông tin người dùng");
      console.error("Get user detail error:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Cập nhật thông tin user
  const handleUpdate = async (data) => {
    if (!selectedUser) return;
    
    try {
      await userService.update(selectedUser.id_NguoiDung, data);
      
      // Reload chi tiết user
      const res = await userService.getById(selectedUser.id_NguoiDung);
      setSelectedUser(res.data.data || res.data);
      
      // Reload danh sách
      loadUsers();
      
      setSuccessMessage("Cập nhật thông tin thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Lỗi cập nhật thông tin người dùng");
      console.error("Update user error:", err);
    }
  };

  // Xóa user
  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) {
      return;
    }

    try {
      await userService.delete(userId);
      loadUsers();
      setSuccessMessage("Xóa người dùng thành công!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Lỗi xóa người dùng");
      console.error("Delete user error:", err);
    }
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setPage(1);
  };

  // Format role display - cập nhật để khớp với backend
  const formatRole = (role) => {
    const roleMap = {
      'KHACH_HANG': 'Khách hàng',
      'NHAN_VIEN': 'Nhân viên',
      'QUAN_LY': 'Quản lý'
    };
    return roleMap[role] || role;
  };

  // Format status display - cập nhật để khớp với backend
  const formatStatus = (status) => {
    const statusMap = {
      'HOAT_DONG': { text: 'Hoạt động', class: 'status-active' },
      'TAM_KHOA': { text: 'Tạm khóa', class: 'status-suspended' },
      'DA_KHOA': { text: 'Đã khóa', class: 'status-locked' }
    };
    return statusMap[status] || { text: status, class: 'status-unknown' };
  };

  return (
    <div className="admin-user-list-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Quản lý người dùng</h1>
          <p>Quản lý thông tin và quyền truy cập của người dùng hệ thống</p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{totalUsers}</span>
            <span className="stat-label">Tổng người dùng</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Tìm kiếm tên, email, SĐT..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <select 
            value={role} 
            onChange={e => { setRole(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">Tất cả vai trò</option>
            <option value="KHACH_HANG">Khách hàng</option>
            <option value="NHAN_VIEN">Nhân viên</option>
            <option value="QUAN_LY">Quản lý</option>
          </select>
        </div>
        <div className="filter-group">
          <select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="filter-select"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="HOAT_DONG">Hoạt động</option>
            <option value="TAM_KHOA">Tạm khóa</option>
            <option value="DA_KHOA">Đã khóa</option>
          </select>
        </div>
        <button 
          onClick={handleResetFilters}
          className="reset-btn"
        >
          Làm mới
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
          <button onClick={() => setSuccessMessage("")}>×</button>
        </div>
      )}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải danh sách người dùng...</p>
        </div>
      )}

      {/* Users Table */}
      {!loading && (
        <div className="table-container">
          {users.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>Không tìm thấy người dùng</h3>
              <p>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Thông tin</th>
                  <th>Liên hệ</th>
                  <th>Vai trò</th>
                  <th>Trạng thái</th>
                  <th>Ngày tạo</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const statusInfo = formatStatus(user.trangThai);
                  return (
                    <tr key={user.id_NguoiDung}>
                      <td className="user-id">#{user.id_NguoiDung}</td>
                      <td className="user-info">
                        <div className="user-name">{user.ten || 'Chưa có tên'}</div>
                        <div className="user-username">{user.tenDangNhap || 'Chưa có username'}</div>
                      </td>
                      <td className="user-contact">
                        <div className="user-email">{user.email}</div>
                        <div className="user-phone">{user.soDienThoai || 'Chưa có SĐT'}</div>
                      </td>
                      <td className="user-role">
                        <span className={`role-badge role-${user.vaiTro?.toLowerCase()}`}>
                          {formatRole(user.vaiTro)}
                        </span>
                      </td>
                      <td className="user-status">
                        <span className={`status-badge ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="user-date">
                        {user.ngayTao ? new Date(user.ngayTao).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td className="user-actions">
                        <button 
                          onClick={() => handleShowDetail(user.id_NguoiDung)}
                          className="action-btn view-btn"
                          title="Xem chi tiết"
                        >
                          👁️
                        </button>
                        <button 
                          onClick={() => handleDelete(user.id_NguoiDung, user.ten)}
                          className="action-btn delete-btn"
                          title="Xóa người dùng"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="pagination">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page <= 1}
            className="page-btn"
          >
            ← Trước
          </button>
          <span className="page-info">
            Trang {page} / {totalPages} ({totalUsers} người dùng)
          </span>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
            disabled={page >= totalPages}
            className="page-btn"
          >
            Sau →
          </button>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal 
        open={showDetail} 
        onClose={() => setShowDetail(false)} 
        user={selectedUser} 
        onSave={handleUpdate} 
      />

      {/* Detail Loading Overlay */}
      {detailLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Đang tải thông tin chi tiết...</p>
        </div>
      )}
    </div>
  );
} 