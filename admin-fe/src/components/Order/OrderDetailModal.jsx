import React, { useState, useEffect } from "react";
import styles from "./OrderDetailModal.module.css";
import OrderInfoBlock from "./OrderInfoBlock";
import OrderProductTable from "./OrderProductTable";
import OrderActionPanel from "./OrderActionPanel";

// ===== STATUS MANAGEMENT - HỆ THỐNG TRẠNG THÁI MỚI =====
const STATUS_FLOW = {
  // ===== HỆ THỐNG MỚI =====
  pending: ["confirmed", "cancelled"],
  confirmed: ["shipping", "cancelled"],
  shipping: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
  
  // ===== HỆ THỐNG CŨ (LEGACY) - ĐÚNG THEO LOGIC BACKEND =====
  cho_xu_ly: ["da_xac_nhan", "confirmed", "huy_boi_admin", "cancelled"],
  da_xac_nhan: ["dang_chuan_bi", "dang_giao", "shipping", "huy_boi_admin", "cancelled"],
  dang_chuan_bi: ["dang_giao", "shipping", "huy_boi_admin", "cancelled"],
  dang_giao: ["da_giao", "delivered", "khach_bom_hang", "cancelled"],
  da_giao: [],
  huy_boi_khach: [],
  huy_boi_admin: [],
  khach_bom_hang: []
};

const STATUS_LABELS = {
  // ===== TRẠNG THÁI MỚI - CHUẨN HÓA =====
  'pending': 'Chờ xử lý',
  'confirmed': 'Đã xác nhận',
  'shipping': 'Đang giao hàng',
  'delivered': 'Đã giao hàng',
  'cancelled': 'Đã hủy',
  
  // Payment status
  'unpaid': 'Chưa thanh toán',
  'pending_payment': 'Đang xử lý thanh toán',
  'paid': 'Đã thanh toán',
  'failed': 'Thanh toán thất bại',
  'refunded': 'Đã hoàn tiền',
  
  // ===== LEGACY SUPPORT =====
  'cho_xu_ly': 'Chờ xử lý',
  'da_xac_nhan': 'Đã xác nhận',
  'dang_chuan_bi': 'Đang chuẩn bị',
  'dang_giao': 'Đang giao hàng',
  'da_giao': 'Đã giao hàng',
  'huy_boi_khach': 'Khách hủy',
  'huy_boi_admin': 'Admin hủy',
  'khach_bom_hang': 'Khách bom hàng'
};

export default function OrderDetailModal({ 
  open, 
  onClose, 
  order, 
  onStatusChange, 
  onApproveCancellation, 
  onRejectCancellation 
}) {
  const [newStatus, setNewStatus] = useState(order?.trangThaiDonHang || "");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    setNewStatus(order?.trangThaiDonHang || "");
    setReason("");
    setError("");
  }, [order]);

  if (!open || !order) return null;

  // Lấy danh sách trạng thái có thể chuyển đến
  const getAllowedStatuses = (currentStatus) => {
    return STATUS_FLOW[currentStatus] || [];
  };

  const allowedStatuses = getAllowedStatuses(order.trangThaiDonHang);

  const handleStatusUpdate = async () => {
    console.log('🔄 handleStatusUpdate called with:', { newStatus, reason: reason.trim() });
    if (!onStatusChange) return setError("❌ Chưa truyền logic cập nhật trạng thái!");
    
    // Kiểm tra lý do cho trạng thái hủy
    if (newStatus === 'cancelled' && !reason.trim()) {
      return setError("❌ Vui lòng nhập lý do hủy đơn hàng!");
    }

    setActionLoading(true);
    setError("");
    
    try {
      console.log('🔄 Calling onStatusChange with:', order.id_DonHang, newStatus, reason.trim());
      await onStatusChange(order.id_DonHang, newStatus, reason.trim());
      console.log('✅ onStatusChange completed successfully');
      setError("");
      onClose();
    } catch (e) {
      console.error('❌ onStatusChange error:', e);
      setError(e?.message || "❌ Lỗi cập nhật trạng thái");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!onApproveCancellation) return setError("❌ Chưa truyền logic duyệt hủy!");
    setActionLoading(true);
    setError("");
    try {
      await onApproveCancellation(order.id_DonHang);
      setError("");
      onClose();
    } catch (e) {
      setError(e?.message || "❌ Lỗi duyệt hủy");
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!onRejectCancellation) return setError("❌ Chưa truyền logic từ chối hủy!");
    setActionLoading(true);
    setError("");
    try {
      await onRejectCancellation(order.id_DonHang);
      setError("");
      onClose();
    } catch (e) {
      setError(e?.message || "Lỗi từ chối hủy");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={styles["order-modal-backdrop"]}>
      <div className={styles["order-modal-content"]}>
        <button className={styles["order-modal-close"]} onClick={onClose}>×</button>
        <h2 className={styles["order-modal-title"]}>Chi tiết đơn hàng #{order.id_DonHang}</h2>
        <OrderInfoBlock order={order} />
        <div className={styles["order-modal-products"]}>
          <div className={styles["order-modal-products-title"]}>Sản phẩm:</div>
          <OrderProductTable products={order.OrderDetails || order.sanPham || order.products || []} />
        </div>
        <OrderActionPanel
          newStatus={newStatus}
          setNewStatus={setNewStatus}
          actionLoading={actionLoading}
          onStatusUpdate={handleStatusUpdate}
          onApprove={handleApprove}
          onReject={handleReject}
          error={error}
          trangThaiDonHang={order.trangThaiDonHang}
          allowedStatuses={allowedStatuses}
          reason={reason}
          setReason={setReason}
        />
      </div>
    </div>
  );
} 