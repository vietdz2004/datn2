import React, { useState } from "react";

export default function ReviewReplyModal({ open, onClose, review, onSend }) {
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  if (!open || !review) return null;
  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSend(reply);
      setReply("");
      onClose();
    } catch (err) {
      setError(err.message || "Lỗi gửi phản hồi");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="modal-bg">
      <div className="modal" style={{minWidth:340,maxWidth:500}}>
        <h3 style={{marginTop:0}}>Phản hồi người dùng</h3>
        <div style={{marginBottom:12}}><b>Đánh giá:</b> {review.noiDung}</div>
        <form onSubmit={handleSend}>
          <textarea value={reply} onChange={e=>setReply(e.target.value)} rows={4} style={{width:'100%',padding:8,borderRadius:6,border:'1px solid #ddd',marginBottom:8}} placeholder="Nhập nội dung phản hồi..." />
          {error && <div style={{color:'#dc2626',marginBottom:8}}>{error}</div>}
          <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
            <button type="button" onClick={onClose} className="action-btn" disabled={loading}>Hủy</button>
            <button type="submit" className="action-btn" disabled={loading || !reply.trim()}>Gửi</button>
          </div>
        </form>
      </div>
      <style>{`.modal-bg{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:1000;display:flex;align-items:center;justify-content:center;}.modal{background:#fff;padding:24px 32px;border-radius:8px;min-width:340px;box-shadow:0 4px 20px rgba(0,0,0,0.15);max-height:90vh;overflow-y:auto;}`}</style>
    </div>
  );
} 