import React from "react";

export default function ReviewDetailModal({ open, onClose, review }) {
  if (!open || !review) return null;
  return (
    <div className="modal-bg">
      <div className="modal" style={{minWidth:340,maxWidth:500}}>
        <h3 style={{marginTop:0}}>Chi tiết đánh giá</h3>
        <div style={{marginBottom:12}}><b>ID:</b> {review.id_Review}</div>
        <div style={{marginBottom:12}}><b>Sản phẩm:</b> {review.productName}</div>
        <div style={{marginBottom:12}}><b>User:</b> {review.userName}</div>
        <div style={{marginBottom:12}}><b>Sao:</b> {review.sao}</div>
        <div style={{marginBottom:12}}><b>Ngày:</b> {review.ngayTao ? new Date(review.ngayTao).toLocaleString('vi-VN') : '-'}</div>
        <div style={{marginBottom:12}}><b>Nội dung:</b><br/>{review.noiDung}</div>
        <div style={{marginBottom:12}}><b>Trạng thái:</b> <span className={"status-badge "+(review.trangThai==='active'?'active':'locked')}>{review.trangThai==='active'?'Hiển thị':'Ẩn'}</span></div>
        {review.phanHoiAdmin && (
          <div style={{marginBottom:12,background:'#f3f4f6',padding:10,borderRadius:6}}>
            <b>Phản hồi của admin:</b><br/>
            <span>{review.phanHoiAdmin}</span>
          </div>
        )}
        <div style={{display:'flex',justifyContent:'flex-end',marginTop:20}}>
          <button onClick={onClose} className="action-btn">Đóng</button>
        </div>
      </div>
      <style>{`.modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;}.modal{background:#fff;padding:24px 32px;border-radius:8px;min-width:340px;box-shadow:0 4px 20px rgba(0,0,0,0.15);max-height:90vh;overflow-y:auto;}`}</style>
    </div>
  );
} 