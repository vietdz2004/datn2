import React, { useState, useEffect, useRef } from "react";
import "./VoucherForm.css";

export default function VoucherFormBase({ open, onClose, onSubmit, initialData = {}, mode = 'add' }) {
  const [form, setForm] = useState({
    maVoucher: "",
    giaTriGiam: "",
    loai: "fixed",
    dieuKienApDung: "",
    soLuong: "",
    trangThai: "dang_hoat_dong",
    ngayBatDau: "",
    ngayHetHan: "",
    moTa: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const prevOpen = useRef(false);

  useEffect(() => {
    // Chỉ reset form khi open chuyển từ false -> true hoặc initialData thay đổi thực sự
    if (open && (!prevOpen.current || mode === 'edit')) {
      setForm({
        maVoucher: initialData.maVoucher || "",
        giaTriGiam: initialData.giaTriGiam || "",
        loai: initialData.loai || "fixed",
        dieuKienApDung: initialData.dieuKienApDung || "",
        soLuong: initialData.soLuong || "",
        trangThai: initialData.trangThai || "dang_hoat_dong",
        ngayBatDau: initialData.ngayBatDau ? initialData.ngayBatDau.slice(0,10) : "",
        ngayHetHan: initialData.ngayHetHan ? initialData.ngayHetHan.slice(0,10) : "",
        moTa: initialData.moTa || ""
      });
      setError("");
    }
    prevOpen.current = open;
  }, [open, initialData, mode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError("");
  };

  const validateForm = () => {
    if (!form.maVoucher.trim()) {
      setError("Vui lòng nhập mã voucher");
      return false;
    }
    if (!form.giaTriGiam || form.giaTriGiam <= 0) {
      setError("Vui lòng nhập giá trị giảm hợp lệ");
      return false;
    }
    if (form.loai === "percentage" && form.giaTriGiam > 100) {
      setError("Giá trị giảm theo phần trăm không được vượt quá 100%");
      return false;
    }
    if (!form.soLuong || isNaN(form.soLuong) || form.soLuong < 1) {
      setError("Số lượng voucher phải là số >= 1");
      return false;
    }
    if (!form.ngayBatDau || !form.ngayHetHan || new Date(form.ngayBatDau) >= new Date(form.ngayHetHan)) {
      setError("Ngày bắt đầu phải nhỏ hơn ngày hết hạn");
      return false;
    }
    if (!['fixed','percentage'].includes(form.loai)) {
      setError("Loại voucher không hợp lệ");
      return false;
    }
    if (!['dang_hoat_dong','het_han'].includes(form.trangThai)) {
      setError("Trạng thái voucher không hợp lệ");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    setError("");
    try {
      const submitData = {
        maVoucher: form.maVoucher,
        loai: form.loai,
        giaTriGiam: Number(form.giaTriGiam),
        dieuKienApDung: form.dieuKienApDung,
        soLuong: Number(form.soLuong),
        trangThai: form.trangThai,
        ngayBatDau: form.ngayBatDau,
        ngayHetHan: form.ngayHetHan,
        moTa: form.moTa
      };
      await onSubmit(submitData);
      // onClose sẽ được gọi ở component cha nếu cần
    } catch (err) {
      setError(err.message || "Lỗi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';
  };

  const trangThaiOptions = [
    { value: 'dang_hoat_dong', label: 'Đang hoạt động' },
    { value: 'het_han', label: 'Hết hạn' }
  ];

  if (!open) return null;

  return (
    <div className="voucher-modal-overlay" onClick={onClose}>
      <div className="voucher-modal-content" onClick={e => e.stopPropagation()}>
        <div className="voucher-modal-header">
          <h3>{mode === 'edit' ? 'Chỉnh sửa voucher' : 'Thêm voucher mới'}</h3>
          <button className="voucher-modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit} className="voucher-form">
          <div className="voucher-form-grid">
            <div className="voucher-form-group">
              <label>Mã voucher *</label>
              <input name="maVoucher" value={form.maVoucher} onChange={handleChange} required disabled={mode==='edit'} />
            </div>
            <div className="voucher-form-group">
              <label>Loại voucher *</label>
              <select name="loai" value={form.loai} onChange={handleChange} required>
                <option value="fixed">Giảm cố định (VNĐ)</option>
                <option value="percentage">Giảm theo %</option>
              </select>
            </div>
            <div className="voucher-form-group">
              <label>Giá trị giảm *</label>
              <input name="giaTriGiam" type="number" value={form.giaTriGiam} onChange={handleChange} min="0" max={form.loai === 'percentage' ? '100' : undefined} required />
              {form.giaTriGiam && form.loai === "fixed" && (
                <small>Giảm {formatCurrency(form.giaTriGiam)}</small>
              )}
            </div>
            <div className="voucher-form-group">
              <label>Mô tả</label>
              <input name="moTa" value={form.moTa} onChange={handleChange} />
            </div>
            <div className="voucher-form-group">
              <label>Điều kiện áp dụng</label>
              <textarea name="dieuKienApDung" value={form.dieuKienApDung} onChange={handleChange} rows={2} />
            </div>
            <div className="voucher-form-group">
              <label>Số lượng voucher *</label>
              <input name="soLuong" type="number" value={form.soLuong} onChange={handleChange} min="1" required />
            </div>
            <div className="voucher-form-group">
              <label>Trạng thái *</label>
              <select name="trangThai" value={form.trangThai} onChange={handleChange} required>
                {trangThaiOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="voucher-form-group">
              <label>Ngày bắt đầu</label>
              <input name="ngayBatDau" type="date" value={form.ngayBatDau} onChange={handleChange} />
            </div>
            <div className="voucher-form-group">
              <label>Ngày hết hạn</label>
              <input name="ngayHetHan" type="date" value={form.ngayHetHan} onChange={handleChange} />
            </div>
          </div>
          {error && <div className="voucher-form-error">❌ {error}</div>}
          <div className="voucher-form-actions">
            <button type="button" onClick={onClose} disabled={loading}>❌ Hủy</button>
            <button type="submit" disabled={loading} className="btn-primary">{loading ? "⏳ Đang lưu..." : (mode === 'edit' ? '💾 Lưu thay đổi' : '💾 Thêm voucher')}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 