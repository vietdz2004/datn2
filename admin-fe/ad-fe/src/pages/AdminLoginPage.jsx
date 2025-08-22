import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../services/api";

export default function AdminLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post("/users/login", { email: username, matKhau: password });
      if (res.data.success && ["QUAN_LY", "NHAN_VIEN"].includes(res.data.data.user?.vaiTro || res.data.data.vaiTro)) {
        localStorage.setItem("admin_token", res.data.data.token || res.data.token);
        navigate("/admin");
      } else {
        setError("Bạn không có quyền truy cập admin!");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  return (
    <div className="admin-login-page">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2>Đăng nhập Admin</h2>
        <input type="text" placeholder="Tên đăng nhập hoặc Email" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} required />
        {error && <div className="error">{error}</div>}
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
} 