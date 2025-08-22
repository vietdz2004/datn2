import React from "react";
import "./VoucherForm.css";

export default function VoucherHideDialog({ open, onClose, onConfirm, voucher }) {
  if (!open || !voucher) return null;
  return (
    <div className="voucher-modal-overlay" onClick={onClose}>
      <div className="voucher-modal-content" onClick={e => e.stopPropagation()}>
        <div className="voucher-modal-header">
          <h3>Ẩn voucher</h3>
          <button className="voucher-modal-close" onClick={onClose}>×</button>
        </div>
        <div className="voucher-hide-body">
          <p>Bạn có chắc chắn muốn <b>ẩn</b> voucher <span style={{color:'#6366f1'}}>{voucher.maVoucher}</span> không?</p>
          <p>Voucher sẽ không hiển thị cho khách hàng nhưng vẫn còn trong hệ thống.</p>
        </div>
        <div className="voucher-form-actions">
          <button type="button" onClick={onClose}>❌ Hủy</button>
          <button type="button" className="btn-primary" onClick={() => onConfirm(voucher)}>Ẩn voucher</button>
        </div>
      </div>
    </div>
  );
} 