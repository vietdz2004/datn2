import React from "react";
import styles from "./OrderDetailModal.module.css";
import { CheckCircle, Cancel, LocalShipping, HourglassEmpty, ErrorOutline } from '@mui/icons-material';

const STATUS_LABELS = {
  // ===== TRẠNG THÁI ĐƠN HÀNG MỚI - CHUẨN HÓA =====
  // Order Status
  'pending': 'Chờ xác nhận',
  'confirmed': 'Đã xác nhận',
  'shipping': 'Đang giao',
  'delivered': 'Đã giao',
  'cancelled': 'Đã hủy',
  
  // Payment Status - Cập nhật đầy đủ
  'unpaid': 'Chưa thanh toán',
  'pending_payment': 'Chờ thanh toán',
  'paid': 'Đã thanh toán',
  'failed': 'Thanh toán thất bại',
  'refunded': 'Đã hoàn tiền',
  
  // Payment Status - Legacy & Backend format
  'UNPAID': 'Chưa thanh toán',
  'PENDING': 'Chờ thanh toán',
  'PAID': 'Đã thanh toán',
  'FAILED': 'Thanh toán thất bại',
  'REFUNDED': 'Đã hoàn tiền',
  'REFUND_SUCCESS': 'Hoàn tiền thành công',
  'DA_THANH_TOAN': 'Đã thanh toán',
  'CHUA_THANH_TOAN': 'Chưa thanh toán',
  'HOAN_TIEN': 'Đã hoàn tiền',
  
  // ===== TRẠNG THÁI CŨ - TẠM THỜI HỖ TRỢ =====
  'cho_xu_ly': 'Chờ xử lý',
  'da_xac_nhan': 'Đã xác nhận',
  'dang_chuan_bi': 'Đang chuẩn bị',
  'dang_giao': 'Đang giao',
  'da_giao': 'Đã giao',
  'huy_boi_khach': 'Đã huỷ (Khách)',
  'huy_boi_admin': 'Đã huỷ (Admin)',
  'khach_bom_hang': 'Bị bom hàng',
  'processing': 'Đang chuẩn bị',
  'cancelled_by_customer': 'Đã huỷ (Khách)',
  'cancelled_by_admin': 'Đã huỷ (Admin)',
  'failed_delivery': 'Bị bom hàng',
  'KHACH_YEU_CAU_HUY': 'Yêu cầu huỷ (Khách)',
  
  // Fallback cho trạng thái trống hoặc null
  '': 'Chờ xử lý',
  'null': 'Chờ xử lý',
  'undefined': 'Chờ xử lý'
};

const STATUS_ICONS = {
  // ===== TRẠNG THÁI MỚI - CHUẨN HÓA =====
  'pending': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'confirmed': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />,
  'shipping': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />,
  'delivered': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'cancelled': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  
  // Payment Status Icons - Đầy đủ
  'unpaid': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'pending_payment': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#f59e0b'}} />,
  'paid': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'failed': <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'refunded': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  
  // Payment Status - Legacy & Backend format
  'UNPAID': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'PENDING': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#f59e0b'}} />,
  'PAID': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'FAILED': <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'REFUNDED': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  'REFUND_SUCCESS': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  'DA_THANH_TOAN': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'CHUA_THANH_TOAN': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'HOAN_TIEN': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  
  // ===== TRẠNG THÁI CŨ - TẠM THỜI HỖ TRỢ =====
  'cho_xu_ly': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'da_xac_nhan': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#3b82f6'}} />,
  'dang_chuan_bi': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#8b5cf6'}} />,
  'dang_giao': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#0ea5e9'}} />,
  'da_giao': <CheckCircle style={{fontSize:18,verticalAlign:'middle',color:'#10b981'}} />,
  'huy_boi_khach': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  'huy_boi_admin': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'khach_bom_hang': <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'processing': <LocalShipping style={{fontSize:18,verticalAlign:'middle',color:'#8b5cf6'}} />,
  'cancelled_by_customer': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#6b7280'}} />,
  'cancelled_by_admin': <Cancel style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'failed_delivery': <ErrorOutline style={{fontSize:18,verticalAlign:'middle',color:'#dc2626'}} />,
  'KHACH_YEU_CAU_HUY': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  
  // Fallback
  '': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'null': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />,
  'undefined': <HourglassEmpty style={{fontSize:18,verticalAlign:'middle',color:'#64748b'}} />
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