import React, { useEffect, useState } from "react";
import axios from "../services/api";
import "./AdminUserList.css";
import AdminReviewList from "../components/Reviews/AdminReviewList";
import ReviewDetailModal from "../components/Reviews/ReviewDetailModal";
import ReviewReplyModal from "../components/Reviews/ReviewReplyModal";

export default function AdminReviewListPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReview, setSelectedReview] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showReply, setShowReply] = useState(false);

  useEffect(() => {
    loadReviews();
    // eslint-disable-next-line
  }, [search, status, page]);

  const loadReviews = () => {
    setLoading(true);
    setError("");
    
    // Sử dụng API mới cho reviews
    axios.get("/reviews", { 
      params: { 
        search, 
        status, 
        page, 
        limit: 10 
      } 
    })
      .then(res => {
        const data = res.data;
        if (data.success && data.data) {
          setReviews(data.data);
          setTotalPages(data.pagination?.totalPages || 1);
        } else {
          setReviews([]);
          setError("Dữ liệu API không đúng định dạng");
        }
      })
      .catch(err => {
        setError(err.response?.data?.message || err.message || "Lỗi tải đánh giá");
        setReviews([]);
      })
      .finally(() => setLoading(false));
  };

  // Xem chi tiết
  const handleView = (review) => {
    setSelectedReview(review);
    setShowDetail(true);
  };

  // Ẩn/Hiện đánh giá
  const handleHide = async (review) => {
    try {
      const newStatus = review.trangThai === 'active' ? 'hidden' : 'active';
      
      // Sử dụng API mới để toggle visibility
      await axios.patch(`/reviews/${review.id_Review}/visibility`, { 
        trangThai: newStatus 
      });
      
      // Refresh danh sách
      loadReviews();
      
      // Thông báo thành công
      alert(`Đã ${newStatus === 'hidden' ? 'ẩn' : 'hiển thị'} đánh giá thành công`);
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi cập nhật trạng thái");
    }
  };

  // Phản hồi
  const handleReply = (review) => {
    setSelectedReview(review);
    setShowReply(true);
  };

  const handleSendReply = async (reply) => {
    try {
      // Sử dụng API mới để gửi phản hồi
      await axios.post(`/reviews/${selectedReview.id_Review}/reply`, { 
        reply 
      });
      
      // Refresh danh sách
      loadReviews();
      
      // Đóng modal
      setShowReply(false);
      
      // Thông báo thành công
      alert("Đã gửi phản hồi thành công");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi gửi phản hồi");
    }
  };

  // Xóa đánh giá (soft delete)
  const handleDelete = async (review) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đánh giá của ${review.userName}?`)) {
      return;
    }

    try {
      // Sử dụng API mới để xóa (soft delete)
      await axios.delete(`/api/reviews/${review.id_Review}`);
      
      // Refresh danh sách
      loadReviews();
      
      // Thông báo thành công
      alert("Đã xóa đánh giá thành công");
    } catch (err) {
      alert(err.response?.data?.message || err.message || "Lỗi xóa đánh giá");
    }
  };

  return (
    <div className="admin-user-list-page">
      <h1 className="admin-user-list-title">Quản lý đánh giá sản phẩm</h1>
      
      <div className="admin-user-list-filters">
        <input
          type="text"
          placeholder="Tìm kiếm sản phẩm, user, nội dung..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hiển thị</option>
          <option value="hidden">Ẩn</option>
          <option value="deleted">Đã xóa</option>
        </select>
      </div>
      
      {error && <div className="admin-user-list-error">{error}</div>}
      
      <AdminReviewList
        reviews={reviews}
        loading={loading}
        onView={handleView}
        onHide={handleHide}
        onReply={handleReply}
        onDelete={handleDelete}
      />
      
      <div className="admin-user-list-pagination">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))} 
          disabled={page <= 1}
        >
          ← Trước
        </button>
        <span>Trang {page} / {totalPages}</span>
        <button 
          onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
          disabled={page >= totalPages}
        >
          Sau →
        </button>
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
    </div>
  );
} 