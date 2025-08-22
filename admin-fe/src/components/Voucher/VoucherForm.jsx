import React, { useState, useEffect } from "react";

export default function VoucherForm({ open, onClose, onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    maVoucher: "",
    giaTriGiam: "",
    loaiGiam: "FIXED", // FIXED hoặc PERCENT
    dieuKienApDung: "",
    giaTriToiThieu: "",
    giaTriToiDa: "",
    soLuongToiDa: "",
    soLanSuDungToiDa: "",
    ngayBatDau: "",
    ngayHetHan: "",
    moTa: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      setForm({
        maVoucher: initialData.maVoucher || "",
        giaTriGiam: initialData.giaTriGiam || "",
        loaiGiam: initialData.loaiGiam || "FIXED",
        dieuKienApDung: initialData.dieuKienApDung || "",
        giaTriToiThieu: initialData.giaTriToiThieu || "",
        giaTriToiDa: initialData.giaTriToiDa || "",
        soLuongToiDa: initialData.soLuongToiDa || "",
        soLanSuDungToiDa: initialData.soLanSuDungToiDa || "",
        ngayBatDau: initialData.ngayBatDau ? initialData.ngayBatDau.slice(0,10) : "",
        ngayHetHan: initialData.ngayHetHan ? initialData.ngayHetHan.slice(0,10) : "",
        moTa: initialData.moTa || ""
      });
      setError("");
    }
  }, [open, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    setError(""); // Clear error when user types
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
    if (form.loaiGiam === "PERCENT" && form.giaTriGiam > 100) {
      setError("Giá trị giảm theo phần trăm không được vượt quá 100%");
      return false;
    }
    if (form.ngayBatDau && form.ngayHetHan && new Date(form.ngayBatDau) >= new Date(form.ngayHetHan)) {
      setError("Ngày bắt đầu phải nhỏ hơn ngày hết hạn");
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
      // Prepare data for backend (only send fields that exist in the model)
      const submitData = {
        maVoucher: form.maVoucher.trim(),
        giaTriGiam: Number(form.giaTriGiam),
        dieuKienApDung: form.dieuKienApDung.trim() || null,
        ngayBatDau: form.ngayBatDau || null,
        ngayHetHan: form.ngayHetHan || null
      };
      
      console.log('📤 Sending voucher data:', submitData);
      
      await onSubmit(submitData);
      // onClose will be called by the parent component after successful submit
      
    } catch (err) {
      console.error('❌ Form submission error:', err);
      setError(err.message || "Lỗi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value || 0) + 'đ';
  };

  if (!open) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}>
        <div className="voucher-modal" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header">
            <h3>
              🎫 {initialData.id_voucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
            </h3>
            <button className="modal-close" onClick={onClose}>×</button>
          </div>

          {/* Content */}
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              {/* Basic Information */}
              <div className="form-section">
                <h4>📋 Thông tin cơ bản</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maVoucher">Mã voucher *</label>
                    <input
                      id="maVoucher"
                      name="maVoucher"
                      value={form.maVoucher}
                      onChange={handleChange}
                      placeholder="VD: WELCOME50"
                      required
                    />
                    <small>Mã voucher phải duy nhất</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="loaiGiam">Loại giảm giá *</label>
                    <select
                      id="loaiGiam"
                      name="loaiGiam"
                      value={form.loaiGiam}
                      onChange={handleChange}
                      required
                    >
                      <option value="FIXED">💰 Giảm cố định</option>
                      <option value="PERCENT">📊 Giảm theo %</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="giaTriGiam">
                      Giá trị giảm * ({form.loaiGiam === "PERCENT" ? "%" : "VND"})
                    </label>
                    <input
                      id="giaTriGiam"
                      name="giaTriGiam"
                      type="number"
                      value={form.giaTriGiam}
                      onChange={handleChange}
                      min="0"
                      max={form.loaiGiam === "PERCENT" ? "100" : undefined}
                      required
                    />
                    {form.giaTriGiam && form.loaiGiam === "FIXED" && (
                      <small>Giảm {formatCurrency(form.giaTriGiam)}</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="moTa">Mô tả</label>
                    <input
                      id="moTa"
                      name="moTa"
                      value={form.moTa}
                      onChange={handleChange}
                      placeholder="Mô tả ngắn về voucher"
                    />
                  </div>
                </div>
              </div>

              {/* Conditions */}
              <div className="form-section">
                <h4>⚙️ Điều kiện áp dụng</h4>
                <div className="form-group">
                  <label htmlFor="dieuKienApDung">Điều kiện áp dụng</label>
                  <textarea
                    id="dieuKienApDung"
                    name="dieuKienApDung"
                    value={form.dieuKienApDung}
                    onChange={handleChange}
                    rows="2"
                    placeholder="VD: Áp dụng cho đơn hàng từ 500.000đ"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="giaTriToiThieu">Giá trị đơn hàng tối thiểu (VND)</label>
                    <input
                      id="giaTriToiThieu"
                      name="giaTriToiThieu"
                      type="number"
                      value={form.giaTriToiThieu}
                      onChange={handleChange}
                      min="0"
                    />
                    {form.giaTriToiThieu && (
                      <small>Tối thiểu {formatCurrency(form.giaTriToiThieu)}</small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="giaTriToiDa">Giá trị giảm tối đa (VND)</label>
                    <input
                      id="giaTriToiDa"
                      name="giaTriToiDa"
                      type="number"
                      value={form.giaTriToiDa}
                      onChange={handleChange}
                      min="0"
                    />
                    {form.giaTriToiDa && (
                      <small>Tối đa {formatCurrency(form.giaTriToiDa)}</small>
                    )}
                  </div>
                </div>
              </div>

              {/* Usage Limits */}
              <div className="form-section">
                <h4>🔢 Giới hạn sử dụng</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="soLuongToiDa">Số lượng voucher</label>
                    <input
                      id="soLuongToiDa"
                      name="soLuongToiDa"
                      type="number"
                      value={form.soLuongToiDa}
                      onChange={handleChange}
                      min="1"
                    />
                    <small>Tổng số lượng voucher có thể phát hành</small>
                  </div>
                  <div className="form-group">
                    <label htmlFor="soLanSuDungToiDa">Số lần sử dụng/người</label>
                    <input
                      id="soLanSuDungToiDa"
                      name="soLanSuDungToiDa"
                      type="number"
                      value={form.soLanSuDungToiDa}
                      onChange={handleChange}
                      min="1"
                    />
                    <small>Mỗi người có thể dùng bao nhiêu lần</small>
                  </div>
                </div>
              </div>

              {/* Date Range */}
              <div className="form-section">
                <h4>📅 Thời gian hiệu lực</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="ngayBatDau">Ngày bắt đầu</label>
                    <input
                      id="ngayBatDau"
                      name="ngayBatDau"
                      type="date"
                      value={form.ngayBatDau}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ngayHetHan">Ngày hết hạn</label>
                    <input
                      id="ngayHetHan"
                      name="ngayHetHan"
                      type="date"
                      value={form.ngayHetHan}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="form-error">
                  ❌ {error}
                </div>
              )}

              {/* Actions */}
              <div className="modal-actions">
                <button type="button" onClick={onClose} disabled={loading}>
                  ❌ Hủy
                </button>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? "⏳ Đang lưu..." : "💾 Lưu voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .voucher-modal {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h3 {
          margin: 0;
          color: #1a365d;
          font-size: 20px;
        }

        .modal-close {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #718096;
          padding: 0;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 6px;
          transition: all 0.2s ease;
        }

        .modal-close:hover {
          background: #f7fafc;
          color: #2d3748;
        }

        .modal-content {
          padding: 24px;
        }

        .form-section {
          margin-bottom: 32px;
        }

        .form-section h4 {
          margin: 0 0 16px 0;
          color: #667eea;
          font-size: 16px;
          font-weight: 600;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 8px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #2d3748;
          font-size: 14px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 2px solid #e2e8f0;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s ease;
          box-sizing: border-box;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .form-group small {
          display: block;
          margin-top: 4px;
          color: #718096;
          font-size: 12px;
        }

        .form-error {
          background: #fed7d7;
          color: #c53030;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #feb2b2;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
        }

        .modal-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .modal-actions button:first-child {
          background: #edf2f7;
          color: #4a5568;
        }

        .modal-actions button:first-child:hover {
          background: #e2e8f0;
        }

        .modal-actions .btn-primary {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .modal-actions .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .modal-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        @media (max-width: 768px) {
          .voucher-modal {
            margin: 10px;
            max-width: none;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .modal-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </>
  );
} 