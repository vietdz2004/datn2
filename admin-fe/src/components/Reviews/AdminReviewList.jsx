import React, { useState } from "react";
import ReviewDetailModal from "./ReviewDetailModal";
import ReviewReplyModal from "./ReviewReplyModal";
import "./AdminReviewList.css";

export default function AdminReviewList({ reviews, loading, onView, onHide, onReply, onDelete }) {
      const [selectedReview, setSelectedReview] = useState(null);
    const [showDetail, setShowDetail] = useState(false);
    const [showReply, setShowReply] = useState(false);

  const handleView = (review) => {
    setSelectedReview(review);
    setShowDetail(true);
  };

  const handleReply = (review) => {
    setSelectedReview(review);
    setShowReply(true);
  };

  const handleSendReply = async (reply) => {
    if (onReply) {
      await onReply(reply);
    }
    setShowReply(false);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <span className="status-badge active">Hiển thị</span>;
      case 'hidden':
        return <span className="status-badge locked">Ẩn</span>;
      case 'deleted':
        return <span className="status-badge deleted">Đã xóa</span>;
      default:
        return <span className="status-badge unknown">{status}</span>;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Hiển thị';
      case 'hidden':
        return 'Ẩn';
      case 'deleted':
        return 'Đã xóa';
      default:
        return status;
    }
  };

  return (
    <>
      <div className="review-table-container">
        <div className="review-table-wrapper">
          <table className="review-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sản phẩm</th>
                <th>User</th>
                <th>Đơn hàng</th>
                <th>Nội dung</th>
                <th>Sao</th>
                <th>Ngày</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} style={{textAlign:'center', padding:24}}>Đang tải...</td></tr>
              ) : reviews.length === 0 ? (
                <tr><td colSpan={9} style={{textAlign:'center', padding:24}}>Chưa có đánh giá nào</td></tr>
              ) : reviews.map(r => (
                <tr key={r.id_Review}>
                  <td>{r.id_Review}</td>
                  <td>{r.productName}</td>
                  <td>{r.userName}</td>
                  <td>
                    <span title={`Đơn hàng #${r.id_DonHang}`}>
                      #{r.id_DonHang}
                    </span>
                    {r.orderStatus && (
                      <div style={{fontSize: '12px', color: '#666'}}>
                        {r.orderStatus}
                      </div>
                    )}
                  </td>
                  <td style={{maxWidth:180, textAlign:'left'}} title={r.noiDung}>
                    {r.noiDung?.length > 40 ? r.noiDung.slice(0,40)+"..." : r.noiDung}
                  </td>
                  <td>
                    <span style={{color: '#f39c12', fontWeight: 'bold'}}>
                      {r.sao} ⭐
                    </span>
                  </td>
                  <td>{r.ngayTao ? new Date(r.ngayTao).toLocaleDateString('vi-VN') : '-'}</td>
                  <td>
                    {getStatusBadge(r.trangThai)}
                  </td>
                  <td>
                    <button 
                      className="action-btn" 
                      style={{padding:'4px 10px',marginRight:6}} 
                      onClick={() => handleView(r)}
                      title="Xem chi tiết"
                    >
                      👁️ Xem
                    </button>
                    
                    <button 
                      className="action-btn" 
                      style={{padding:'4px 10px',marginRight:6}} 
                      onClick={() => onHide(r)}
                      title={`${r.trangThai === 'active' ? 'Ẩn' : 'Hiện'} đánh giá`}
                    >
                      {r.trangThai === 'active' ? '🙈 Ẩn' : '👁️ Hiện'}
                    </button>
                    
                    <button 
                      className="action-btn" 
                      style={{padding:'4px 10px',marginRight:6}} 
                      onClick={() => handleReply(r)}
                      title="Gửi phản hồi"
                    >
                      💬 Phản hồi
                    </button>
                    
                    {onDelete && (
                      <button 
                        className="action-btn" 
                        style={{padding:'4px 10px', color: '#e74c3c'}} 
                        onClick={() => onDelete(r)}
                        title="Xóa đánh giá"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <ReviewDetailModal 
        open={showDetail} 
        onClose={() => setShowDetail(false)} 
        review={selectedReview} 
      />
      
      <ReviewReplyModal 
        open={showReply} 
        onClose={() => setShowReply(false)} 
        review={selectedReview} 
        onSend={handleSendReply} 
      />
    </>
  );
} 