import React, { useEffect, useState } from "react";
import OrderDetailModal from "../components/Order/OrderDetailModal";
import orderService from "../services/orderService";

const PAGE_SIZE = 10;

// Trang chuyên dụng để quản lý yêu cầu hủy đơn hàng
export default function AdminCancellationRequests() {
  const [cancellationRequests, setCancellationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, today: 0 });

  // Hiển thị thông báo thành công
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Load yêu cầu hủy đơn hàng
  const loadCancellationRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await orderService.getAll({ 
        search, 
        trangThaiDonHang: 'KHACH_YEU_CAU_HUY', 
        page, 
        limit: PAGE_SIZE 
      });
      
      const orders = response.data.data || response.data.orders || [];
      setCancellationRequests(orders);
      setTotalPages(response.data.pagination?.totalPages || 1);
      
      // Tính thống kê
      const today = new Date().toDateString();
      const todayRequests = orders.filter(order => 
        new Date(order.ngayDatHang).toDateString() === today
      ).length;
      
      setStats({
        total: orders.length,
        today: todayRequests
      });
      
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải yêu cầu hủy đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCancellationRequests();
    // eslint-disable-next-line
  }, [search, page]);

  // Mở popup chi tiết đơn hàng
  const handleShowDetail = async (id) => {
    setDetailLoading(true);
    try {
      const res = await orderService.getById(id);
      setSelectedOrder(res.data.data || res.data);
      setShowDetail(true);
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi tải chi tiết đơn hàng");
    } finally {
      setDetailLoading(false);
    }
  };

  // Callback cập nhật trạng thái đơn hàng
  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    await orderService.updateStatus(selectedOrder.id_DonHang, { status: newStatus });
    // Reload chi tiết đơn hàng
    const res = await orderService.getById(selectedOrder.id_DonHang);
    setSelectedOrder(res.data.data || res.data);
    loadCancellationRequests();
  };
  // Callback duyệt yêu cầu hủy
  const handleApproveCancellation = async (orderId) => {
    await orderService.approveCancellation(orderId);
    loadCancellationRequests();
  };
  // Callback từ chối yêu cầu hủy
  const handleRejectCancellation = async (orderId) => {
    await orderService.rejectCancellation(orderId);
    loadCancellationRequests();
  };

  // Duyệt hàng loạt
  const handleBulkApprove = async () => {
    const selectedIds = cancellationRequests
      .filter(order => document.getElementById(`select-${order.id_DonHang}`)?.checked)
      .map(order => order.id_DonHang);
    
    if (selectedIds.length === 0) {
      alert("Vui lòng chọn ít nhất một đơn hàng!");
      return;
    }
    
    if (!window.confirm(`Bạn có chắc chắn muốn chấp nhận ${selectedIds.length} yêu cầu hủy đơn hàng?`)) {
      return;
    }
    
    try {
      for (const orderId of selectedIds) {
        await orderService.approveCancellation(orderId, "Admin duyệt hàng loạt");
      }
      showSuccessMessage(`Đã duyệt ${selectedIds.length} yêu cầu hủy đơn hàng!`);
      loadCancellationRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi duyệt hàng loạt");
    }
  };

  // Toggle chọn tất cả
  const handleSelectAll = (checked) => {
    cancellationRequests.forEach(order => {
      const checkbox = document.getElementById(`select-${order.id_DonHang}`);
      if (checkbox) checkbox.checked = checked;
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        background: 'white', 
        padding: '20px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h2 style={{ margin: '0 0 8px 0', color: '#dc2626' }}>
              🚨 Yêu cầu hủy đơn hàng
            </h2>
            <p style={{ margin: 0, color: '#6b7280' }}>
              Quản lý các yêu cầu hủy đơn hàng từ khách hàng
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ 
              background: '#fef2f2', 
              border: '1px solid #fecaca', 
              padding: '8px 12px', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
                {stats.total}
              </div>
              <div style={{ fontSize: '12px', color: '#7f1d1d' }}>
                Tổng yêu cầu
              </div>
            </div>
            
            <div style={{ 
              background: '#fff7ed', 
              border: '1px solid #fed7aa', 
              padding: '8px 12px', 
              borderRadius: '6px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#ea580c' }}>
                {stats.today}
              </div>
              <div style={{ fontSize: '12px', color: '#9a3412' }}>
                Hôm nay
              </div>
            </div>
          </div>
        </div>

        {/* Thông báo */}
        {success && (
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {success}
          </div>
        )}

        {error && (
          <div style={{
            background: '#ef4444',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Tìm kiếm và thao tác hàng loạt */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <input 
            placeholder="Tìm kiếm mã đơn, tên khách, SĐT..." 
            value={search} 
            onChange={e => { setSearch(e.target.value); setPage(1); }} 
            style={{
              padding: '8px 12px',
              borderRadius: '4px',
              border: '1px solid #d1d5db',
              minWidth: '250px'
            }} 
          />
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleBulkApprove}
              style={{
                background: '#10b981',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              ✅ Duyệt hàng loạt
            </button>
            
            <button
              onClick={() => loadCancellationRequests()}
              style={{
                background: '#6b7280',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🔄 Làm mới
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '40px',
          background: 'white',
          borderRadius: '8px'
        }}>
          Đang tải yêu cầu hủy đơn hàng...
        </div>
      )}

      {/* Danh sách yêu cầu hủy */}
      {!loading && (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
          {cancellationRequests.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px',
              color: '#6b7280'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
              <h3>Không có yêu cầu hủy đơn hàng nào!</h3>
              <p>Tất cả đơn hàng đều đang được xử lý bình thường.</p>
            </div>
          ) : (
            <>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f8f9fa' }}>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>
                      <input 
                        type="checkbox" 
                        onChange={e => handleSelectAll(e.target.checked)}
                        style={{ marginRight: '8px' }}
                      />
                      Chọn
                    </th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Mã đơn</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Khách hàng</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Ngày đặt</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Tổng tiền</th>
                    <th style={{ padding: '12px', textAlign: 'left', border: '1px solid #dee2e6' }}>Thời gian yêu cầu</th>
                    <th style={{ padding: '12px', textAlign: 'center', border: '1px solid #dee2e6' }}>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cancellationRequests.map(order => (
                    <tr key={order.id_DonHang} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '12px' }}>
                        <input 
                          type="checkbox" 
                          id={`select-${order.id_DonHang}`}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600' }}>
                        #{order.id_DonHang}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <div>
                          <div style={{ fontWeight: '500' }}>
                            {order.customerName || order.tenKhachHang || '-'}
                          </div>
                          <div style={{ fontSize: '12px', color: '#6b7280' }}>
                            {order.customerPhone || order.customerEmail || '-'}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '12px' }}>
                        {order.ngayDatHang ? new Date(order.ngayDatHang).toLocaleString('vi-VN') : '-'}
                      </td>
                      <td style={{ padding: '12px', fontWeight: '600', color: '#dc2626' }}>
                        {order.tongThanhToan?.toLocaleString('vi-VN')} đ
                      </td>
                      <td style={{ padding: '12px', fontSize: '12px', color: '#6b7280' }}>
                        {/* Tạm thời dùng ngày đặt hàng, sau này có thể thêm field ngayYeuCauHuy */}
                        {order.ngayDatHang ? new Date(order.ngayDatHang).toLocaleDateString('vi-VN') : '-'}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleShowDetail(order.id_DonHang)}
                            style={{
                              background: '#3b82f6',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            Chi tiết
                          </button>
                          
                          <button 
                            onClick={() => handleApproveCancellation(order.id_DonHang)}
                            style={{
                              background: '#10b981',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ✅ Duyệt
                          </button>
                          
                          <button 
                            onClick={() => handleRejectCancellation(order.id_DonHang)}
                            style={{
                              background: '#ef4444',
                              color: 'white',
                              border: 'none',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                          >
                            ❌ Từ chối
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Phân trang */}
              {totalPages > 1 && (
                <div style={{ 
                  padding: '16px', 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  gap: '8px',
                  borderTop: '1px solid #f1f5f9'
                }}>
                  <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))} 
                    disabled={page <= 1}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: page <= 1 ? '#f9fafb' : 'white',
                      cursor: page <= 1 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Trang trước
                  </button>
                  
                  <span style={{ 
                    padding: '8px 16px', 
                    background: '#f3f4f6', 
                    borderRadius: '4px' 
                  }}>
                    Trang {page} / {totalPages}
                  </span>
                  
                  <button 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                    disabled={page >= totalPages}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: page >= totalPages ? '#f9fafb' : 'white',
                      cursor: page >= totalPages ? 'not-allowed' : 'pointer'
                    }}
                  >
                    Trang sau
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Popup chi tiết đơn hàng */}
      <OrderDetailModal 
        open={showDetail} 
        onClose={() => setShowDetail(false)} 
        order={selectedOrder}
        onStatusChange={handleStatusChange}
        onApproveCancellation={handleApproveCancellation}
        onRejectCancellation={handleRejectCancellation}
      />
      
      {detailLoading && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 18
        }}>
          Đang tải chi tiết...
        </div>
      )}
    </div>
  );
} 