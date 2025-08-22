import React from "react";
import "./VoucherList.css";
// Nếu có thư viện icon, import ở đây:
// import { FiEdit2, FiEyeOff } from "react-icons/fi";

function truncate(str, n) {
  return str && str.length > n ? str.slice(0, n) + "..." : str;
}

export default function VoucherList({
  vouchers,
  loading,
  onEdit,
  onDelete,
  onHide,
  page = 1,
  totalPages = 1,
  onPageChange,
  getVoucherStatus,
  formatCurrency
}) {
  const _formatCurrency = formatCurrency || ((amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0));
  const _getVoucherStatus = getVoucherStatus || ((voucher) => ({ label: voucher.trangThai || '-', className: '' }));

  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách voucher...</p>
      </div>
    );
  }
  if (!vouchers || vouchers.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có voucher nào</h3>
        <p>Nhấn "Thêm voucher" để tạo voucher đầu tiên</p>
      </div>
    );
  }

  return (
    <div className="voucher-list">
      {/* Table Header */}
      <div className="table-header">
        <div className="header-cell code-col">Mã Voucher</div>
        <div className="header-cell">Loại</div>
        <div className="header-cell">Giảm giá</div>
        <div className="header-cell">Số lượng</div>
        <div className="header-cell">Đã dùng</div>
        <div className="header-cell">Áp dụng từ</div>
        <div className="header-cell">Hết hạn</div>
        <div className="header-cell">Trạng thái</div>
        <div className="header-cell condition-col">Điều kiện</div>
        <div className="header-cell desc-col">Mô tả</div>
        <div className="header-cell">Thao tác</div>
      </div>
      {/* Table Body */}
      <div className="table-body">
        {vouchers.map((voucher) => {
          const status = _getVoucherStatus(voucher);
          return (
            <div className="table-row" key={voucher.id_voucher}>
              {/* Mã voucher nổi bật, có tooltip copy */}
              <div className="cell code-col" title={voucher.maVoucher} style={{fontWeight:'bold', color:'#2563eb', cursor:'pointer', textAlign:'center'}}
                onClick={() => {navigator.clipboard.writeText(voucher.maVoucher)}}
              >
                {truncate(voucher.maVoucher, 16)}
              </div>
              {/* Loại voucher */}
              <div className="cell" style={{textAlign:'center'}}>
                {voucher.loai === 'fixed' ? 'Cố định' : voucher.loai === 'percentage' ? '% (Phần trăm)' : 'Không có'}
              </div>
              {/* Giá trị giảm */}
              <div className="cell" title={voucher.loaiVoucher === 'percentage' ? `${voucher.giaTriGiam}%` : _formatCurrency(voucher.giaTriGiam)} style={{textAlign:'center'}}>
                <span className="discount-badge">
                  {voucher.loaiVoucher === 'percentage' ? `${voucher.giaTriGiam}%` : _formatCurrency(voucher.giaTriGiam)}
                </span>
              </div>
              {/* Số lượng tổng */}
              <div className="cell" style={{textAlign:'center'}}>
                {voucher.soLuong}
              </div>
              {/* Số lượng đã dùng */}
              <div className="cell" style={{textAlign:'center'}}>
                {voucher.soLuongDaDung ?? 0}
              </div>
              {/* Ngày áp dụng từ */}
              <div className="cell" title={voucher.ngayBatDau ? new Date(voucher.ngayBatDau).toLocaleDateString('vi-VN') : '-'} style={{textAlign:'center'}}>
                {voucher.ngayBatDau ? new Date(voucher.ngayBatDau).toLocaleDateString('vi-VN') : '-'}
              </div>
              {/* Ngày hết hạn */}
              <div className="cell" title={voucher.ngayHetHan ? new Date(voucher.ngayHetHan).toLocaleDateString('vi-VN') : '-'} style={{textAlign:'center'}}>
                {voucher.ngayHetHan ? new Date(voucher.ngayHetHan).toLocaleDateString('vi-VN') : '-'}
              </div>
              {/* Trạng thái badge nổi bật */}
              <div className="cell" style={{textAlign:'center'}}>
                <span className={`status-badge ${status.className}`}>{status.label}</span>
              </div>
              {/* Điều kiện (tooltip nếu dài) */}
              <div className="cell condition-col" title={voucher.dieuKienApDung} style={{maxWidth:120, textAlign:'center'}}>
                {voucher.dieuKienApDung ? <span>{truncate(voucher.dieuKienApDung, 24)}</span> : <span>Không có</span>}
              </div>
              {/* Mô tả (tooltip nếu dài) */}
              <div className="cell desc-col" title={voucher.moTa} style={{maxWidth:120, textAlign:'center'}}>
                {voucher.moTa ? <span>{truncate(voucher.moTa, 24)}</span> : <span>Không có</span>}
              </div>
              {/* Thao tác */}
              <div className="cell" style={{textAlign:'center'}}>
                {/* Nếu có thư viện icon, dùng: <FiEdit2 /> <FiEyeOff /> */}
                <button className="btn-edit" onClick={() => onEdit(voucher)} title="Chỉnh sửa">
                  {/* SVG bút */}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M14.7 2.29a1 1 0 0 1 1.42 0l1.59 1.59a1 1 0 0 1 0 1.42l-9.34 9.34a1 1 0 0 1-.45.26l-4 1a1 1 0 0 1-1.22-1.22l1-4a1 1 0 0 1 .26-.45l9.34-9.34ZM13 4l3 3M4 16h12" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
                <button className="btn-hide" onClick={() => onHide && onHide(voucher)} title="Ẩn voucher">
                  {/* SVG con mắt gạch */}
                  <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{verticalAlign:'middle'}}><path d="M17.94 11.12c.04-.37.06-.75.06-1.12C18 7.13 15.31 4.5 10 4.5c-1.61 0-3.01.23-4.14.65M2.06 8.88C2.02 9.25 2 9.63 2 10c0 2.87 2.69 5.5 8 5.5 1.61 0 3.01-.23 4.14-.65M3.5 3.5l13 13M8.5 11.5a2 2 0 0 0 3-2.65" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Trước
          </button>
          <div className="page-info">
            <span>Trang {page} / {totalPages}</span>
          </div>
          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
} 