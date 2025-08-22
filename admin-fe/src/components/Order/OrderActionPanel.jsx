import React from "react";
import styles from "./OrderDetailModal.module.css";
import { CheckCircle, Cancel, LocalShipping, HourglassEmpty, ErrorOutline } from '@mui/icons-material';

// ===== HỆ THỐNG TRẠNG THÁI ĐƠN GIẢN =====
const STATUS_OPTIONS = [
  { value: "cho_xu_ly", label: "Chờ xử lý", icon: <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />, emoji: "⏳" },
  { value: "da_xac_nhan", label: "Đã xác nhận", icon: <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />, emoji: "✔️" },
  { value: "dang_giao", label: "Đang giao hàng", icon: <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />, emoji: "🚚" },
  { value: "da_giao", label: "Đã giao hàng", icon: <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />, emoji: "✅" },
  { value: "huy_boi_admin", label: "Đã hủy", icon: <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />, emoji: "❌" }
];

const ORDER_STATUS_FLOW = {
  cho_xu_ly: ["da_xac_nhan", "huy_boi_admin"],
  da_xac_nhan: ["dang_giao", "huy_boi_admin"],
  dang_giao: ["da_giao"],
  da_giao: [],
  huy_boi_admin: []
};

const END_STATUSES = ["da_giao", "huy_boi_admin"];

export default function OrderActionPanel({
  newStatus,
  setNewStatus,
  actionLoading,
  onStatusUpdate,
  onApprove,
  onReject,
  error,
  trangThaiDonHang,
  allowedStatuses = [],
  reason = "",
  setReason = () => {}
}) {
  console.log('🔧 OrderActionPanel - Trạng thái hiện tại:', trangThaiDonHang);
  console.log('🔧 OrderActionPanel - Trạng thái được phép:', allowedStatuses);
  
  const disabled = END_STATUSES.includes(trangThaiDonHang);
  
  // Lọc các option hợp lệ dựa trên allowedStatuses nếu có, ngược lại dùng logic flow
  let validOptions;
  if (allowedStatuses && allowedStatuses.length > 0) {
    validOptions = STATUS_OPTIONS.filter(opt =>
      opt.value === trangThaiDonHang || allowedStatuses.includes(opt.value)
    );
  } else {
    // Fallback về logic flow cũ - cho phép tất cả transitions hợp lệ
    const allowedNextStatuses = ORDER_STATUS_FLOW[trangThaiDonHang] || [];
    validOptions = STATUS_OPTIONS.filter(opt =>
      opt.value === trangThaiDonHang || allowedNextStatuses.includes(opt.value)
    );
    
    // Nếu không có flow nào được định nghĩa, cho phép admin linh hoạt chọn
    if (allowedNextStatuses.length === 0 && !END_STATUSES.includes(trangThaiDonHang)) {
      console.log('⚠️ Không có flow định nghĩa, cho phép tất cả options');
      validOptions = STATUS_OPTIONS;
    }
  }
  
  if (disabled) {
    validOptions = STATUS_OPTIONS.filter(opt => opt.value === trangThaiDonHang);
  }
  
  const currentStatusObj = STATUS_OPTIONS.find(opt => opt.value === trangThaiDonHang);
  const isInvalidStatus = !currentStatusObj && trangThaiDonHang; // Chỉ invalid nếu có giá trị nhưng không tìm thấy
  const onlyOneOption = validOptions.length === 1 && validOptions[0].value === trangThaiDonHang;
  const isStatusChanged = newStatus !== trangThaiDonHang;
  const needsReason = (newStatus === 'cancelled' || newStatus === 'huy_boi_admin') && isStatusChanged;
  
  console.log('🔧 validOptions:', validOptions.map(o => o.value));
  console.log('🔧 disabled:', disabled, 'isInvalidStatus:', isInvalidStatus, 'onlyOneOption:', onlyOneOption);
  return (
    <div className={styles["order-modal-actions"]}>
      <div className={styles["order-modal-actions-title"]}>⚙️ Quản lý đơn hàng:</div>
      
      <div className={styles["order-modal-actions-row"]}>
        {onlyOneOption ? (
          <span style={{
            display:'inline-flex',
            alignItems:'center',
            gap:6,
            background:'#f3f4f6',
            padding:'8px 16px',
            borderRadius:6,
            fontWeight:500,
            color:'#555',
            minWidth:160
          }}>
            {currentStatusObj?.icon}
            {currentStatusObj?.label}
          </span>
        ) : (
          <select 
            value={newStatus} 
            onChange={e => setNewStatus(e.target.value)} 
            className={styles["order-modal-select"]} 
            disabled={disabled || validOptions.length === 0 || isInvalidStatus} 
            style={{minWidth:160, padding:'8px 12px', fontSize:15}}
          >
            {isInvalidStatus ? (
              <option value="" disabled style={{color:'#ef4444'}}>
                ❌ Trạng thái không hợp lệ: {trangThaiDonHang}
              </option>
            ) : validOptions.length === 0 ? (
              <option value="" disabled style={{color:'#888'}}>
                🔒 Đơn hàng đã kết thúc
              </option>
            ) : (
              validOptions.map(opt => (
                <option key={opt.value} value={opt.value} style={{padding:'6px 0'}}>
                  {opt.emoji} {opt.label}
                </option>
              ))
            )}
          </select>
        )}
        
        <button 
          onClick={onStatusUpdate} 
          disabled={
            actionLoading || 
            disabled || 
            validOptions.length === 0 || 
            isInvalidStatus || 
            onlyOneOption || 
            !isStatusChanged ||
            (needsReason && !reason.trim())
          } 
          className={styles["order-modal-btn"] + " " + styles["order-modal-btn-update"]} 
          style={{marginLeft:8}}
        >
          {actionLoading ? '⏳ Đang cập nhật...' : '✅ Cập nhật trạng thái'}
        </button>
      </div>

      {/* Input lý do cho trạng thái hủy */}
      {needsReason && (
        <div className={styles["order-modal-actions-row"]} style={{marginTop: 8}}>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Nhập lý do hủy đơn hàng..."
            className={styles["order-modal-textarea"]}
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical'
            }}
          />
        </div>
      )}

      {/* Nút duyệt/từ chối hủy */}
      {trangThaiDonHang === 'khach_yeu_cau_huy' && (
        <div className={styles["order-modal-actions-row"]}>
          <button 
            onClick={onApprove} 
            disabled={actionLoading} 
            className={styles["order-modal-btn"] + " " + styles["order-modal-btn-approve"]}
          >
            ✅ Duyệt hủy
          </button>
          <button 
            onClick={onReject} 
            disabled={actionLoading} 
            className={styles["order-modal-btn"] + " " + styles["order-modal-btn-reject"]}
          >
            ❌ Từ chối hủy
          </button>
        </div>
      )}

      {error && (
        <div className={styles["order-modal-error"]} style={{
          color: '#dc2626',
          background: '#fef2f2',
          padding: '8px 12px',
          borderRadius: '6px',
          marginTop: '8px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
} 