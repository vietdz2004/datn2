import React from "react";
import styles from "./OrderDetailModal.module.css";
import { CheckCircle, Cancel, LocalShipping, HourglassEmpty, ErrorOutline } from '@mui/icons-material';

const STATUS_OPTIONS = [
  // Enum mới
  { value: "cho_xu_ly", label: "Chờ xử lý", icon: <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />, emoji: "⏳" },
  { value: "da_xac_nhan", label: "Đã xác nhận", icon: <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />, emoji: "✔️" },
  { value: "dang_chuan_bi", label: "Đang chuẩn bị", icon: <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#8b5cf6'}} />, emoji: "📦" },
  { value: "dang_giao", label: "Đang giao", icon: <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />, emoji: "🚚" },
  { value: "da_giao", label: "Đã giao", icon: <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />, emoji: "✅" },
  { value: "huy_boi_khach", label: "Đã huỷ (Khách)", icon: <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />, emoji: "❌" },
  { value: "huy_boi_admin", label: "Đã huỷ (Admin)", icon: <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />, emoji: "🛑" },
  { value: "khach_bom_hang", label: "Bị bom hàng", icon: <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />, emoji: "⚠️" },
  // Enum cũ
  { value: "confirmed", label: "Đã xác nhận", icon: <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />, emoji: "✔️" },
  { value: "pending_payment", label: "Chờ thanh toán", icon: <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />, emoji: "⏳" },
  { value: "processing", label: "Đang chuẩn bị", icon: <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#8b5cf6'}} />, emoji: "📦" },
  { value: "shipping", label: "Đang giao", icon: <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />, emoji: "🚚" },
  { value: "delivered", label: "Đã giao", icon: <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />, emoji: "✅" },
  { value: "cancelled_by_customer", label: "Đã huỷ (Khách, cũ)", icon: <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />, emoji: "❌" },
  { value: "cancelled_by_admin", label: "Đã huỷ (Admin, cũ)", icon: <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />, emoji: "🛑" },
  { value: "failed_delivery", label: "Bị bom hàng", icon: <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />, emoji: "⚠️" },
];
const ORDER_STATUS_FLOW = {
  // Enum mới
  cho_xu_ly: ["da_xac_nhan", "huy_boi_admin"],
  da_xac_nhan: ["dang_chuan_bi", "huy_boi_admin"],
  dang_chuan_bi: ["dang_giao", "huy_boi_admin"],
  dang_giao: ["da_giao", "khach_bom_hang"],
  da_giao: [],
  huy_boi_khach: [],
  huy_boi_admin: [],
  khach_bom_hang: [],
  // Enum cũ
  confirmed: ["processing", "shipping", "delivered", "cancelled_by_admin"],
  pending_payment: ["confirmed", "cancelled_by_admin"],
  processing: ["shipping", "cancelled_by_admin"],
  shipping: ["delivered", "failed_delivery"],
  delivered: [],
  cancelled_by_customer: [],
  cancelled_by_admin: [],
  failed_delivery: []
};
const END_STATUSES = ["da_giao", "huy_boi_khach", "huy_boi_admin", "khach_bom_hang", "delivered", "cancelled_by_customer", "cancelled_by_admin", "failed_delivery"];
export default function OrderActionPanel({
  newStatus,
  setNewStatus,
  actionLoading,
  onStatusUpdate,
  onApprove,
  onReject,
  error,
  trangThaiDonHang
}) {
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line
    console.log('OrderActionPanel trạng thái thực tế:', trangThaiDonHang);
  }
  const disabled = END_STATUSES.includes(trangThaiDonHang);
  let validOptions = STATUS_OPTIONS.filter(opt =>
    opt.value === trangThaiDonHang ||
    (ORDER_STATUS_FLOW[trangThaiDonHang] || []).includes(opt.value)
  );
  if (disabled) {
    validOptions = STATUS_OPTIONS.filter(opt => opt.value === trangThaiDonHang);
  }
  const currentStatusObj = STATUS_OPTIONS.find(opt => opt.value === trangThaiDonHang);
  const isInvalidStatus = !currentStatusObj;
  const onlyOneOption = validOptions.length === 1 && validOptions[0].value === trangThaiDonHang;
  return (
    <div className={styles["order-modal-actions"]}>
      <div className={styles["order-modal-actions-title"]}>Quản lý đơn hàng:</div>
      <div className={styles["order-modal-actions-row"]}>
        {onlyOneOption ? (
          <span style={{display:'inline-flex',alignItems:'center',gap:6,background:'#f3f4f6',padding:'8px 16px',borderRadius:6,fontWeight:500,color:'#555',minWidth:160}}>
            {currentStatusObj?.icon}
            {currentStatusObj?.label}
          </span>
        ) : (
          <select value={newStatus} onChange={e=>setNewStatus(e.target.value)} className={styles["order-modal-select"]} disabled={disabled || validOptions.length === 0 || isInvalidStatus} style={{minWidth:160,padding:'8px 12px',fontSize:15}}>
            {isInvalidStatus ? (
              <option value="" disabled style={{color:'#ef4444'}}>Trạng thái không hợp lệ: {trangThaiDonHang}</option>
            ) : validOptions.length === 0 ? (
              <option value="" disabled style={{color:'#888'}}>Đơn hàng đã kết thúc, không thể cập nhật</option>
            ) : (
              validOptions.map(opt => (
                <option key={opt.value} value={opt.value} style={{padding:'6px 0'}}>
                  {opt.emoji} {opt.label}
                </option>
              ))
            )}
          </select>
        )}
        <button onClick={onStatusUpdate} disabled={actionLoading || disabled || validOptions.length === 0 || isInvalidStatus || onlyOneOption} className={styles["order-modal-btn"] + " " + styles["order-modal-btn-update"]} style={{marginLeft:8}}>
          Cập nhật trạng thái
        </button>
      </div>
      {trangThaiDonHang === 'khach_yeu_cau_huy' && (
        <div className={styles["order-modal-actions-row"]}>
          <button onClick={onApprove} disabled={actionLoading} className={styles["order-modal-btn"] + " " + styles["order-modal-btn-approve"]}>
            Duyệt hủy
          </button>
          <button onClick={onReject} disabled={actionLoading} className={styles["order-modal-btn"] + " " + styles["order-modal-btn-reject"]}>
            Từ chối hủy
          </button>
        </div>
      )}
      {error && <div className={styles["order-modal-error"]}>{error}</div>}
    </div>
  );
} 