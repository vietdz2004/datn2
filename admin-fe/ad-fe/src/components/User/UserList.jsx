import React, { useEffect, useState } from "react";
import userService from "../../services/userService";
import UserDetailModal from "./UserDetailModal";
import "./UserList.css";

export default function UserList() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadUsers = () => {
    setLoading(true);
    setError("");
    userService.getAll({ search, page, limit: 10 })
      .then(res => {
        const data = res.data;
        if (data.success && data.data) {
          setUsers(data.data);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setUsers([]);
          setError("Dữ liệu API không đúng định dạng");
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || "Lỗi tải user");
        setUsers([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, [search, page]);

  const handleEdit = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleSave = async () => {
    loadUsers();
  };

  return (
    <div className="user-table-container">
      <div style={{marginBottom:16, display:'flex', gap:8}}>
        <input
          type="text"
          placeholder="🔍 Tìm kiếm tên/email/SĐT..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{padding:8, borderRadius:6, border:'1px solid #ddd', minWidth:220}}
        />
      </div>
      {error && <div style={{color:'#dc2626', marginBottom:8}}>{error}</div>}
      <div className="user-table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>SĐT</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{textAlign:'center', padding:24}}>Đang tải...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center', padding:24}}>Chưa có user nào</td></tr>
            ) : users.map(user => (
              <tr key={user.id_NguoiDung} style={{borderBottom:'1px solid #f1f5f9'}}>
                <td>{user.ten}</td>
                <td>{user.email}</td>
                <td>{user.soDienThoai}</td>
                <td>{user.vaiTro}</td>
                <td>
                  <span className={
                    user.trangThai === 'HOAT_DONG' ? 'status-badge active'
                    : user.trangThai === 'DA_KHOA' ? 'status-badge locked'
                    : user.trangThai === 'TAM_KHOA' ? 'status-badge suspended'
                    : 'status-badge'
                  }>
                    {user.trangThai === 'HOAT_DONG' ? 'Hoạt động'
                      : user.trangThai === 'DA_KHOA' ? 'Đã khóa'
                      : user.trangThai === 'TAM_KHOA' ? 'Tạm khóa'
                      : user.trangThai}
                  </span>
                </td>
                <td>{user.ngayTao ? new Date(user.ngayTao).toLocaleDateString('vi-VN') : '-'}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="action-btn">Xem/Sửa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{marginTop:16, display:'flex', justifyContent:'center', gap:8}}>
        <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}>← Trước</button>
        <span>Trang {page} / {totalPages}</span>
        <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page>=totalPages}>Sau →</button>
      </div>
      <UserDetailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        user={selectedUser}
        onSave={handleSave}
      />
    </div>
  );
} 