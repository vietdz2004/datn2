import React, { useEffect, useState, useCallback } from "react";
import orderService from "../services/orderService";
import OrderDetailModal from "../components/Order/OrderDetailModal";
import AdvancedSearch from "../components/Search/AdvancedSearch";
import { CheckCircle, Cancel, LocalShipping, HourglassEmpty, Pause, ErrorOutline } from '@mui/icons-material';

const PAGE_SIZE = 10;

// Trang quản lý đơn hàng cho admin
// - Hiển thị danh sách đơn hàng, filter, phân trang, xem chi tiết, cập nhật trạng thái
// - Xử lý yêu cầu hủy đơn hàng từ khách hàng
export default function AdminOrderList() {
  // State quản lý dữ liệu đơn hàng, loading, lỗi, popup chi tiết, filter, phân trang
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});
  
  // Advanced search parameters
  const [searchParams, setSearchParams] = useState({});

  // Load danh sách đơn hàng (memoized)
  const loadOrders = useCallback(() => {
    setLoading(true);
    setError("");
    
    const params = {
      page,
      limit: PAGE_SIZE,
      ...searchParams
    };
    
    orderService.getAll(params)
      .then(res => {
        const data = res.data;
        setOrders(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setStats(data.stats || {});
      })
      .catch(err => {
        console.error("Error loading orders:", err);
        setError(err.response?.data?.message || "Lỗi tải danh sách đơn hàng");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [page, searchParams]);

  // Load orders khi dependencies thay đổi
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Xử lý tìm kiếm nâng cao
  const handleAdvancedSearch = (params) => {
    setSearchParams(params);
    setPage(1); // Reset về trang đầu khi search
  };

  // Reset search
  const handleResetSearch = () => {
    setSearchParams({});
    setPage(1);
  };

  // Hiển thị thông báo thành công

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
  const handleStatusChange = async (orderId, newStatus, reason = '') => {
    console.log('🔄 AdminOrderList.handleStatusChange called with:', { orderId, newStatus, reason });
    if (!orderId) return;
    await orderService.updateStatus(orderId, { status: newStatus, lyDo: reason });
    // Reload chi tiết đơn hàng nếu đang mở
    if (selectedOrder && selectedOrder.id_DonHang === orderId) {
      const res = await orderService.getById(orderId);
      setSelectedOrder(res.data.data || res.data);
    }
    loadOrders();
  };

  const handleStatusChangeById = async (orderId, newStatus, reason = '') => {
    await orderService.updateStatus(orderId, { status: newStatus, lyDo: reason });
    if (selectedOrder && selectedOrder.id_DonHang === orderId) {
      const res = await orderService.getById(orderId);
      setSelectedOrder(res.data.data || res.data);
    }
    loadOrders();
  };
  // Callback duyệt yêu cầu hủy
  const handleApproveCancellation = async (orderId) => {
    await orderService.approveCancellation(orderId);
    loadOrders();
  };
  // Callback từ chối yêu cầu hủy
  const handleRejectCancellation = async (orderId) => {
    await orderService.rejectCancellation(orderId);
    loadOrders();
  };
  // Refund trigger
  const handleRefund = async (o) => {
    if (!o) return;
    const reason = prompt('Lý do hoàn tiền?') || '';
    try {
      await orderService.refund(o.id_DonHang, { reason, amount: o.tongThanhToan });
      loadOrders();
    } catch (e) {
      setError(e.response?.data?.message || 'Hoàn tiền thất bại');
    }
  };


  // Hàm hiển thị trạng thái với icon chuyên nghiệp (enum mới + cũ)
  const getStatusBadge = (orderStatus) => {
    const statusConfig = {
      // ===== HỆ THỐNG TRẠNG THÁI MỚI - CHUẨN HÓA =====
      'pending': { label: 'Chờ xác nhận', color: '#64748b', emoji: '⏳' },
      'confirmed': { label: 'Đã xác nhận', color: '#3b82f6', emoji: '✔️' },
      'shipping': { label: 'Đang giao hàng', color: '#0ea5e9', emoji: '🚚' },
      'delivered': { label: 'Đã giao hàng', color: '#10b981', emoji: '✅' },
      'cancelled': { label: 'Đã hủy', color: '#dc2626', emoji: '❌' },
      
      // ===== TRẠNG THÁI CŨ - HỖ TRỢ =====
      'cho_xu_ly': { label: 'Chờ xử lý', color: '#64748b', emoji: '⏳' },
      'da_xac_nhan': { label: 'Đã xác nhận', color: '#3b82f6', emoji: '✔️' },
      'dang_chuan_bi': { label: 'Đang chuẩn bị', color: '#8b5cf6', emoji: '📦' },
      'dang_giao': { label: 'Đang giao', color: '#0ea5e9', emoji: '🚚' },
      'da_giao': { label: 'Đã giao', color: '#10b981', emoji: '✅' },
      'huy_boi_khach': { label: 'Đã huỷ (Khách)', color: '#6b7280', emoji: '❌' },
      'huy_boi_admin': { label: 'Đã huỷ (Admin)', color: '#dc2626', emoji: '🛑' },
      'khach_bom_hang': { label: 'Bị bom hàng', color: '#dc2626', emoji: '⚠️' },
      'processing': { label: 'Đang chuẩn bị', color: '#8b5cf6', emoji: '📦' },
      'pending_payment': { label: 'Chờ thanh toán', color: '#64748b', emoji: '⏳' },
      'cancelled_by_customer': { label: 'Đã huỷ (Khách)', color: '#6b7280', emoji: '❌' },
      'cancelled_by_admin': { label: 'Đã huỷ (Admin)', color: '#dc2626', emoji: '�' },
      'failed_delivery': { label: 'Bị bom hàng', color: '#dc2626', emoji: '⚠️' },
      'KHACH_YEU_CAU_HUY': { label: 'Yêu cầu huỷ (Khách)', color: '#64748b', emoji: '⏳' },
      
      // ===== FALLBACK CHO TRẠNG THÁI TRỐNG =====
      '': { label: 'Chờ xử lý', color: '#64748b', emoji: '⏳' },
      'null': { label: 'Chờ xử lý', color: '#64748b', emoji: '⏳' },
      'undefined': { label: 'Chờ xử lý', color: '#64748b', emoji: '⏳' }
    };
    
    // Handle null, undefined, hoặc empty string
    const safeStatus = orderStatus || '';
    return statusConfig[safeStatus] || { 
      label: safeStatus || 'Không xác định', 
      color: '#6b7280', 
      emoji: '❓' 
    };
  };

  // Function hiển thị badge thanh toán với tiếng Việt
  const getPaymentBadge = (paymentStatus) => {
    const paymentConfig = {
      // ===== HỆ THỐNG THANH TOÁN MỚI =====
      'unpaid': { label: 'Chưa thanh toán', background: '#f3f4f6', color: '#374151' },
      'pending': { label: 'Chờ thanh toán', background: '#fef9c3', color: '#854d0e' },
      'paid': { label: 'Đã thanh toán', background: '#dcfce7', color: '#166534' },
      'failed': { label: 'Thất bại', background: '#fee2e2', color: '#991b1b' },
      'refunded': { label: 'Đã hoàn tiền', background: '#fee2e2', color: '#991b1b' },
      
      // ===== HỖ TRỢ LEGACY =====
      'DA_THANH_TOAN': { label: 'Đã thanh toán', background: '#dcfce7', color: '#166534' },
      'HOAN_TIEN': { label: 'Hoàn tiền', background: '#fee2e2', color: '#991b1b' },
      'THAT_BAI': { label: 'Thất bại', background: '#fee2e2', color: '#991b1b' },
      'CHO_THANH_TOAN': { label: 'Chờ thanh toán', background: '#fef9c3', color: '#854d0e' },
      'CHUA_THANH_TOAN': { label: 'Chưa thanh toán', background: '#f3f4f6', color: '#374151' },
      'PENDING': { label: 'Chờ thanh toán', background: '#fef9c3', color: '#854d0e' },
      'PAID': { label: 'Đã thanh toán', background: '#dcfce7', color: '#166534' },
      'FAILED': { label: 'Thất bại', background: '#fee2e2', color: '#991b1b' },
      'REFUNDED': { label: 'Đã hoàn tiền', background: '#fee2e2', color: '#991b1b' },
      'REFUND_SUCCESS': { label: 'Hoàn tiền thành công', background: '#fee2e2', color: '#991b1b' },
      
      // ===== FALLBACK =====
      '': { label: 'Chưa thanh toán', background: '#f3f4f6', color: '#374151' },
      'null': { label: 'Chưa thanh toán', background: '#f3f4f6', color: '#374151' },
      'undefined': { label: 'Chưa thanh toán', background: '#f3f4f6', color: '#374151' }
    };
    
    const safePaymentStatus = paymentStatus || '';
    return paymentConfig[safePaymentStatus] || { 
      label: safePaymentStatus || 'Không xác định', 
      background: '#f3f4f6', 
      color: '#374151' 
    };
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <h2>Quản lý đơn hàng</h2>
        
        {/* Stats Overview */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            background: 'white',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {stats.total || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Tổng đơn hàng</div>
          </div>
          

          
          <div style={{
            background: 'white',
            padding: '12px 16px',
            borderRadius: '6px',
            border: '1px solid #e5e7eb',
            minWidth: '120px'
          }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.completed || 0}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>Đã giao</div>
          </div>
        </div>
        
        {/* Quick stats buttons - chỉ hiển thị thống kê */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            background: '#3b82f6',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Đã xác nhận: {stats.byStatus?.da_xac_nhan?.count || 0}
          </div>
          
          <div style={{
            background: '#10b981',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Đã giao: {stats.byStatus?.da_giao?.count || 0}
          </div>
          
          <div style={{
            background: '#64748b',
            color: 'white',
            padding: '8px 12px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: '500'
          }}>
            Tổng: {stats.total || 0} đơn hàng
          </div>
        </div>
      </div>

      {/* Advanced Search Component */}
      <AdvancedSearch 
        onSearch={handleAdvancedSearch}
        onReset={handleResetSearch}
      />

      {/* Thông báo */}
      

      {error && (
        <div style={{
          background: '#ef4444',
          color: 'white',
          padding: '12px 16px',
          borderRadius: '4px',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>❌</span>
          <span>{error}</span>
        </div>
      )}

      {/* Advanced Search Component */}
      <AdvancedSearch 
        onSearch={handleAdvancedSearch}
        onReset={handleResetSearch}
      />

      {/* Loading state */}
      {loading && (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>⏳</div>
          <div>Đang tải đơn hàng...</div>
        </div>
      )}
      
      {/* Bảng đơn hàng */}
      {!loading && (
        <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e5e7eb' }}>
          <table style={{width:'100%', borderCollapse: 'collapse'}}>
            <thead>
              <tr style={{background: '#f8f9fa'}}>
                <th style={{padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Mã đơn</th>
                <th style={{padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Khách hàng</th>
                <th style={{padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Ngày đặt</th>
                <th style={{padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Tổng tiền</th>
                <th style={{padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Trạng thái</th>
                <th style={{padding: '16px 12px', textAlign: 'left', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Thanh toán</th>
                <th style={{padding: '16px 12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#6b7280'
                  }}>
                    <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
                    <div style={{ fontSize: '18px', marginBottom: '8px' }}>Không tìm thấy đơn hàng</div>
                    <div>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id_DonHang} style={{borderBottom: '1px solid #f1f5f9'}}>
                    <td style={{padding: '12px', fontWeight: '600', color: '#1f2937'}}>#{o.id_DonHang}</td>
                    <td style={{padding: '12px'}}>
                      <div style={{ fontWeight: '500' }}>
                        {o.customerName || o.tenKhachHang || '-'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>
                        {o.customerPhone || o.customerEmail || `ID: ${o.id_NguoiDung}`}
                      </div>
                    </td>
                    <td style={{padding: '12px', fontSize: '14px'}}>
                      {o.ngayDatHang ? new Date(o.ngayDatHang).toLocaleString('vi-VN') : '-'}
                    </td>
                    <td style={{padding: '12px', fontWeight: '600', color: '#dc2626'}}>
                      {o.tongThanhToan?.toLocaleString('vi-VN')} đ
                    </td>
                                         <td style={{padding: '12px', textAlign: 'left'}}>
  <span 
    style={{
      background: getStatusBadge(o.trangThaiDonHang).color,
      color: 'white',
      padding: '6px 18px',
      borderRadius: '999px',
      fontSize: '14px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      minWidth: '120px',
      justifyContent: 'flex-start',
      boxShadow: '0 1px 4px #0001',
      transition: 'background 0.2s',
      cursor: 'default',
    }}
    onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.08)'}
    onMouseOut={e => e.currentTarget.style.filter = 'none'}
  >
    <span style={{fontSize:'18px',display:'flex',alignItems:'center'}}>{getStatusBadge(o.trangThaiDonHang).emoji}</span>
    <span>{getStatusBadge(o.trangThaiDonHang).label}</span>
  </span>
</td>
                    <td style={{padding: '12px'}}>
                      <div style={{display:'flex', gap:6, alignItems:'center', flexWrap:'wrap'}}>
                        {o.phuongThucThanhToan && (
                          <span style={{
                            padding:'4px 10px', borderRadius:999, background:'#eef2ff', color:'#3730a3', fontSize:12, fontWeight:600
                          }}>
                            {o.phuongThucThanhToan}
                          </span>
                        )}
                        {o.trangThaiThanhToan && (
                          <span style={{
                            padding:'4px 10px', 
                            borderRadius: 999,
                            background: getPaymentBadge(o.trangThaiThanhToan).background,
                            color: getPaymentBadge(o.trangThaiThanhToan).color,
                            fontSize: 12, 
                            fontWeight: 700
                          }}>
                            {getPaymentBadge(o.trangThaiThanhToan).label}
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{padding: '12px', textAlign: 'center'}}>
                      <div style={{display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap'}}>
                        <button 
                          onClick={() => handleShowDetail(o.id_DonHang)}
                          style={{
                            background: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          👁️ Chi tiết
                        </button>
            {/* Refund for paid online orders */}
            {o.phuongThucThanhToan && o.phuongThucThanhToan !== 'COD' && o.trangThaiThanhToan === 'DA_THANH_TOAN' && (
                          <button
              onClick={() => handleRefund(o)}
                            style={{ background:'#f59e0b', color:'#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontSize:12 }}
                          >
                            ↩️ Hoàn tiền
                          </button>
                        )}
            {o.trangThaiDonHang === 'cho_xu_ly' && (
                          <button
              onClick={() => handleStatusChangeById(o.id_DonHang, 'da_xac_nhan')}
                            style={{ background:'#10b981', color:'#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontSize:12 }}
                          >
                            ✔️ Xác nhận
                          </button>
                        )}
            {o.trangThaiDonHang === 'da_xac_nhan' && (
                          <button
              onClick={() => handleStatusChangeById(o.id_DonHang, 'dang_giao')}
                            style={{ background:'#0ea5e9', color:'#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontSize:12 }}
                          >
                            🚚 Giao hàng
                          </button>
                        )}
            {o.trangThaiDonHang === 'dang_giao' && (
                          <button
              onClick={() => handleStatusChangeById(o.id_DonHang, 'hoan_tat')}
                            style={{ background:'#a855f7', color:'#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontSize:12 }}
                          >
                            ✅ Hoàn tất
                          </button>
                        )}
            {o.trangThaiDonHang === 'cho_xu_ly' && (
                          <button
              onClick={() => {
                const reason = prompt('Lý do hủy đơn?') || '';
                orderService.adminCancel(o.id_DonHang, reason).then(loadOrders);
              }}
                            style={{ background:'#ef4444', color:'#fff', border:'none', padding:'6px 12px', borderRadius:4, cursor:'pointer', fontSize:12 }}
                          >
                            🛑 Hủy đơn
                          </button>
                        )}
                        

                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Phân trang */}
      {!loading && totalPages > 1 && (
        <div style={{
          marginTop: 16,
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))} 
            disabled={page <= 1}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: page <= 1 ? '#f9fafb' : 'white',
              cursor: page <= 1 ? 'not-allowed' : 'pointer',
              color: page <= 1 ? '#9ca3af' : '#374151'
            }}
          >
            ⬅️ Trang trước
          </button>
          
          <span style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            borderRadius: '4px',
            fontWeight: '500'
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
              cursor: page >= totalPages ? 'not-allowed' : 'pointer',
              color: page >= totalPages ? '#9ca3af' : '#374151'
            }}
          >
            Trang sau ➡️
          </button>
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
          position:'fixed',
          top:0,left:0,right:0,bottom:0,
          background:'rgba(0,0,0,0.5)',
          zIndex:2000,
          display:'flex',
          alignItems:'center',
          justifyContent:'center',
          color:'#fff',
          fontSize:18
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            color: '#374151',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{ fontSize: '20px' }}>⏳</div>
            <div>Đang tải chi tiết đơn hàng...</div>
          </div>
        </div>
      )}
    </div>
  );
} 