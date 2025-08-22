import React from "react";
import styles from "./OrderDetailModal.module.css";
import { CheckCircle, Cancel, LocalShipping, HourglassEmpty, ErrorOutline } from '@mui/icons-material';

const STATUS_LABELS = {
  // Enum mới
  'cho_xu_ly': 'Chờ xử lý',
  'da_xac_nhan': 'Đã xác nhận',
  'dang_chuan_bi': 'Đang chuẩn bị',
  'dang_giao': 'Đang giao',
  'da_giao': 'Đã giao',
  'huy_boi_khach': 'Đã huỷ (Khách)',
  'huy_boi_admin': 'Đã huỷ (Admin)',
  'khach_bom_hang': 'Bị bom hàng',
  // Enum cũ
  'confirmed': 'Đã xác nhận',
  'pending_payment': 'Chờ thanh toán',
  'processing': 'Đang chuẩn bị',
  'shipping': 'Đang giao',
  'delivered': 'Đã giao',
  'cancelled_by_customer': 'Đã huỷ (Khách)',
  'cancelled_by_admin': 'Đã huỷ (Admin)',
  'failed_delivery': 'Bị bom hàng',
  'KHACH_YEU_CAU_HUY': 'Yêu cầu huỷ (Khách)'
};

const STATUS_ICONS = {
  'cho_xu_ly': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'da_xac_nhan': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />,
  'dang_chuan_bi': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#8b5cf6'}} />,
  'dang_giao': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />,
  'da_giao': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'huy_boi_khach': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  'huy_boi_admin': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'khach_bom_hang': <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  // Enum cũ
  'confirmed': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />,
  'pending_payment': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'processing': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#8b5cf6'}} />,
  'shipping': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />,
  'delivered': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'cancelled_by_customer': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  'cancelled_by_admin': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'failed_delivery': <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'KHACH_YEU_CAU_HUY': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />
};

export default function OrderInfoBlock({ order }) {
  if (!order) return null;
  return (
    <div className={styles["order-modal-info"]}>
      <div className={styles["order-modal-info-row"]}><b>Khách hàng:</b> {order.customerName || order.tenKhachHang || '-'}</div>
      <div className={styles["order-modal-info-row"]}><b>SĐT:</b> {order.customerPhone || order.soDienThoai || '-'}</div>
      <div className={styles["order-modal-info-row"]}><b>Email:</b> {order.customerEmail || order.email || '-'}</div>
      <div className={styles["order-modal-info-row"]}><b>Địa chỉ:</b> {order.diaChiGiao || '-'}</div>
      <div className={styles["order-modal-info-row"]}>
        <b>Trạng thái:</b>{' '}
        <span style={{display:'inline-flex',alignItems:'center',gap:6,fontWeight:500}}>
          {STATUS_ICONS[order.trangThaiDonHang]}{STATUS_LABELS[order.trangThaiDonHang] || order.trangThaiDonHang || '-'}
        </span>
      </div>
      <div className={styles["order-modal-info-row"]}><b>Ngày đặt:</b> {order.ngayDatHang ? new Date(order.ngayDatHang).toLocaleString('vi-VN') : '-'}</div>
      <div className={styles["order-modal-info-row"]}><b>Tổng tiền:</b> {order.tongThanhToan?.toLocaleString('vi-VN')} đ</div>
    </div>
  );
} 