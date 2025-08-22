import React, { useState, useEffect } from "react";
import styles from "./OrderDetailModal.module.css";
import OrderInfoBlock from "./OrderInfoBlock";
import OrderProductTable from "./OrderProductTable";
import OrderActionPanel from "./OrderActionPanel";

export default function OrderDetailModal({ open, onClose, order, onStatusChange, onApproveCancellation, onRejectCancellation }) {
  const [newStatus, setNewStatus] = useState(order?.trangThaiDonHang || "");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setNewStatus(order?.trangThaiDonHang || "");
  }, [order]);

  if (!open || !order) return null;

  const handleStatusUpdate = async () => {
    if (!onStatusChange) return setError("Chưa truyền logic cập nhật trạng thái!");
    setActionLoading(true);
    setError("");
    try {
      await onStatusChange(newStatus);
      setError("");
      onClose();
    } catch (e) {
      setError(e?.message || "Lỗi cập nhật trạng thái");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!onApproveCancellation) return setError("Chưa truyền logic duyệt hủy!");
    setActionLoading(true);
    setError("");
    try {
      await onApproveCancellation(order.id_DonHang);
      setError("");
      onClose();
    } catch (e) {
      setError(e?.message || "Lỗi duyệt hủy");
    } finally {
      setActionLoading(false);
    }
  };
  const handleReject = async () => {
    if (!onRejectCancellation) return setError("Chưa truyền logic từ chối hủy!");
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
        />
      </div>
    </div>
  );
} 