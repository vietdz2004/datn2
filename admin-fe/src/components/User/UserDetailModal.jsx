import React, { useState, useEffect } from "react";
import userService from "../../services/userService";

const STATUS_MAP = {
  active: "HOAT_DONG",
  locked: "DA_KHOA",
  suspended: "TAM_KHOA"
};
const STATUS_MAP_REVERSE = {
  HOAT_DONG: "active",
  DA_KHOA: "locked",
  TAM_KHOA: "suspended"
};

// Map vai trò từ backend sang frontend
const ROLE_MAP = {
  KHACH_HANG: "customer",
  NHAN_VIEN: "staff", 
  QUAN_LY: "admin"
};

const ROLE_MAP_REVERSE = {
  customer: "KHACH_HANG",
  staff: "NHAN_VIEN",
  admin: "QUAN_LY"
};

export default function UserDetailModal({ open, onClose, user, onSave }) {
  const [form, setForm] = useState({
    ten: "",
    email: "",
    soDienThoai: "",
    vaiTro: "customer",
    trangThai: "active"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwMessage, setPwMessage] = useState("");

  useEffect(() => {
    if (open && user) {
      setForm({
        ten: user.ten || "",
        email: user.email || "",
        soDienThoai: user.soDienThoai || "",
        vaiTro: ROLE_MAP[user.vaiTro] || "customer", // Map từ backend sang frontend
        trangThai: STATUS_MAP_REVERSE[user.trangThai] || "active"
      });
      setError("");
    }
  }, [open, user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Map vai trò từ frontend sang backend
      const backendRole = ROLE_MAP_REVERSE[form.vaiTro];
      const backendStatus = STATUS_MAP[form.trangThai];
      
      // Nếu trạng thái thay đổi thì gọi API đổi trạng thái trước
      if (user && backendStatus !== user.trangThai) {
        await userService.updateStatus(user.id_NguoiDung, backendStatus);
      }
      
      // Gọi onSave để cập nhật các trường khác (tên, sđt, vai trò)
      await onSave({ 
        ...user, 
        ...form, 
        vaiTro: backendRole, // Gửi vai trò đúng format backend
        trangThai: backendStatus 
      });
      onClose();
    } catch (err) {
      setError(err.message || "Lỗi lưu user");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPwMessage("");
    if (!password || !confirmPassword) {
      setPwMessage("Vui lòng nhập đủ mật khẩu mới và xác nhận.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setPwMessage("Mật khẩu phải có ít nhất 6 ký tự.");
      setLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setPwMessage("Mật khẩu xác nhận không khớp.");
      setLoading(false);
      return;
    }
    try {
      await userService.changePassword(user.id_NguoiDung, { newPassword: password, confirmPassword });
      setPwMessage("Đổi mật khẩu thành công!");
      setPassword(""); setConfirmPassword("");
    } catch (err) {
      setPwMessage(err.response?.data?.message || err.message || "Lỗi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !user) return null;

  return (
    <div className="modal-bg">
      <div className="modal" style={{minWidth:400, maxWidth:500}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <h3 style={{margin:0}}>Chi tiết người dùng</h3>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:24,cursor:'pointer',color:'#6b7280'}}>×</button>
        </div>
        <div style={{marginBottom:16,display:'flex',gap:8}}>
          <button type="button" onClick={()=>setShowChangePassword(false)} style={{padding:'6px 16px',borderRadius:6,border:!showChangePassword?'2px solid #2563eb':'1px solid #ddd',background:!showChangePassword?'#e0e7ef':'#f3f4f6',color:'#2563eb',fontWeight:!showChangePassword?'bold':'normal'}}>Thông tin</button>
          <button type="button" onClick={()=>setShowChangePassword(true)} style={{padding:'6px 16px',borderRadius:6,border:showChangePassword?'2px solid #2563eb':'1px solid #ddd',background:showChangePassword?'#e0e7ef':'#f3f4f6',color:'#2563eb',fontWeight:showChangePassword?'bold':'normal'}}>Đổi mật khẩu</button>
        </div>
        {!showChangePassword ? (
          <form onSubmit={handleSubmit}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <label>
                Tên
                <input name="ten" value={form.ten} onChange={handleChange} required style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}} />
              </label>
              <label>
                Email
                <input name="email" value={form.email} onChange={handleChange} required style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}} disabled />
              </label>
              <label>
                Số điện thoại
                <input name="soDienThoai" value={form.soDienThoai} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}} />
              </label>
              <label>
                Vai trò
                <select name="vaiTro" value={form.vaiTro} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}}>
                  <option value="customer">Khách hàng</option>
                  <option value="staff">Nhân viên</option>
                  <option value="admin">Quản lý</option>
                </select>
              </label>
              <label>
                Trạng thái
                <select name="trangThai" value={form.trangThai} onChange={handleChange} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}}>
                  <option value="active">Hoạt động</option>
                  <option value="locked">Khóa</option>
                  <option value="suspended">Tạm dừng</option>
                </select>
              </label>
            </div>
            {error && <div style={{color:'#dc2626',marginTop:8}}>{error}</div>}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
              <button type="button" onClick={onClose} disabled={loading} style={{padding:'8px 16px',borderRadius:6,border:'1px solid #ddd',background:'#f3f4f6',color:'#333'}}>Hủy</button>
              <button type="submit" disabled={loading} style={{padding:'8px 16px',borderRadius:6,border:'1px solid #2563eb',background:'#2563eb',color:'#fff'}}>Lưu</button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword}>
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <label>
                Mật khẩu mới
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}} />
              </label>
              <label>
                Xác nhận mật khẩu
                <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginTop:4}} />
              </label>
            </div>
            {pwMessage && <div style={{color:pwMessage.includes('thành công')?'#16a34a':'#dc2626',marginTop:8}}>{pwMessage}</div>}
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:20}}>
              <button type="button" onClick={()=>setShowChangePassword(false)} disabled={loading} style={{padding:'8px 16px',borderRadius:6,border:'1px solid #ddd',background:'#f3f4f6',color:'#333'}}>Quay lại</button>
              <button type="submit" disabled={loading} style={{padding:'8px 16px',borderRadius:6,border:'1px solid #2563eb',background:'#2563eb',color:'#fff'}}>Đổi mật khẩu</button>
            </div>
          </form>
        )}
      </div>
      <style>{`
        .modal-bg { position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center; }
        .modal { background:#fff;padding:24px 32px;border-radius:8px;min-width:340px;box-shadow:0 4px 20px rgba(0,0,0,0.15);max-height:90vh;overflow-y:auto; }
      `}</style>
    </div>
  );
}

UserDetailModal.defaultProps = {
  onSave: () => {},
}; 