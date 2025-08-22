import React, { useEffect, useState } from "react";
import orderService from "../services/orderService";
import OrderDetailModal from "../components/Order/OrderDetailModal";
import { CheckCircle, Cancel, LocalShipping, HourglassEmpty, Pause, ErrorOutline } from '@mui/icons-material';

// Status options với label tiếng Việt - Cập nhật theo logic mới
const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "cho_xu_ly", label: "Chờ xử lý" },
  { value: "da_xac_nhan", label: "Đã xác nhận" },
  { value: "dang_chuan_bi", label: "Đang chuẩn bị" },
  { value: "dang_giao", label: "Đang giao" },
  { value: "da_giao", label: "Đã giao" },
  { value: "huy_boi_khach", label: "Đã huỷ (Khách)" },
  { value: "huy_boi_admin", label: "Đã huỷ (Admin)" },
  { value: "khach_bom_hang", label: "Bị bom hàng" },
];

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
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({});

  // Debounce cho search
  const [searchDebounce, setSearchDebounce] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebounce(search);
    }, 500); // Delay 500ms

    return () => clearTimeout(timer);
  }, [search]);

  // Load orders khi dependencies thay đổi
  useEffect(() => {
    loadOrders();
  }, [searchDebounce, status, page]);

  // Load danh sách đơn hàng
  const loadOrders = () => {
    setLoading(true);
    setError("");
    
    const params = {
      page,
      limit: PAGE_SIZE,
      search: searchDebounce,
      trangThaiDonHang: status
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
  const handleStatusChange = async (newStatus) => {
    if (!selectedOrder) return;
    await orderService.update(selectedOrder.id_DonHang, { trangThaiDonHang: newStatus });
    // Reload chi tiết đơn hàng
    const res = await orderService.getById(selectedOrder.id_DonHang);
    setSelectedOrder(res.data.data || res.data);
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


  // Quick filters
  const handleQuickFilter = (filterStatus) => {
    setStatus(filterStatus);
    setPage(1);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearch("");
    setStatus("");
    setPage(1);
  };

  // Hàm hiển thị trạng thái với icon chuyên nghiệp (enum mới + cũ)
  const getStatusBadge = (orderStatus) => {
    const statusConfig = {
      // Enum mới + cũ (label không còn chữ 'cũ')
      'cho_xu_ly': { label: 'Chờ xử lý', color: '#64748b', emoji: '⏳' },
      'da_xac_nhan': { label: 'Đã xác nhận', color: '#3b82f6', emoji: '✔️' },
      'dang_chuan_bi': { label: 'Đang chuẩn bị', color: '#8b5cf6', emoji: '📦' },
      'dang_giao': { label: 'Đang giao', color: '#0ea5e9', emoji: '🚚' },
      'da_giao': { label: 'Đã giao', color: '#10b981', emoji: '✅' },
      'huy_boi_khach': { label: 'Đã huỷ (Khách)', color: '#6b7280', emoji: '❌' },
      'huy_boi_admin': { label: 'Đã huỷ (Admin)', color: '#dc2626', emoji: '🛑' },
      'khach_bom_hang': { label: 'Bị bom hàng', color: '#dc2626', emoji: '⚠️' },
      // Enum cũ mapping về label mới
      'confirmed': { label: 'Đã xác nhận', color: '#3b82f6', emoji: '✔️' },
      'pending_payment': { label: 'Chờ thanh toán', color: '#64748b', emoji: '⏳' },
      'processing': { label: 'Đang chuẩn bị', color: '#8b5cf6', emoji: '📦' },
      'shipping': { label: 'Đang giao', color: '#0ea5e9', emoji: '🚚' },
      'delivered': { label: 'Đã giao', color: '#10b981', emoji: '✅' },
      'cancelled_by_customer': { label: 'Đã huỷ (Khách)', color: '#6b7280', emoji: '❌' },
      'cancelled_by_admin': { label: 'Đã huỷ (Admin)', color: '#dc2626', emoji: '🛑' },
      'failed_delivery': { label: 'Bị bom hàng', color: '#dc2626', emoji: '⚠️' },
      'KHACH_YEU_CAU_HUY': { label: 'Yêu cầu huỷ (Khách)', color: '#64748b', emoji: '⏳' },
    };
    return statusConfig[orderStatus] || { label: orderStatus, color: '#6b7280', emoji: '' };
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
        
        {/* Quick action buttons */}
        <div style={{ marginBottom: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>

          
          <button 
            onClick={() => handleQuickFilter("da_xac_nhan")}
            style={{
              background: status === "da_xac_nhan" ? '#3b82f6' : '#3b82f6',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Đã xác nhận ({stats.da_xac_nhan || 0})
          </button>
          
          <button 
            onClick={() => handleQuickFilter("da_giao")}
            style={{
              background: status === "da_giao" ? '#10b981' : '#10b981',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            Đã giao ({stats.da_giao || 0})
          </button>
          
          <button 
            onClick={handleClearFilters}
            style={{
              background: '#6b7280',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '500'
            }}
          >
            🔄 Tất cả đơn hàng
          </button>
        </div>
      </div>

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

      {/* Bộ lọc tìm kiếm, trạng thái */}
      <div style={{
        display: 'flex',
        gap: 12,
        marginBottom: 16,
        padding: '16px',
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ flex: '1', minWidth: '200px' }}>
          <input 
            placeholder="🔍 Tìm kiếm mã đơn, tên khách, SĐT, email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px'
            }} 
          />
        </div>
        
        <div>
          <select 
            value={status} 
            onChange={e => {setStatus(e.target.value); setPage(1);}}
            style={{
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              fontSize: '14px',
              minWidth: '160px'
            }}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {(search || status) && (
          <button
            onClick={handleClearFilters}
            style={{
              padding: '10px 12px',
              background: '#f3f4f6',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ✖️ Xóa bộ lọc
          </button>
        )}
      </div>

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
                <th style={{padding: '16px 12px', textAlign: 'center', borderBottom: '2px solid #e5e7eb', fontWeight: '600'}}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{
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