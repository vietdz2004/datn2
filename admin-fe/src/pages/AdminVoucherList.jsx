import React, { useEffect, useState } from "react";
import voucherService from "../services/voucherService";
import "./AdminVoucherList.css";
import VoucherAddForm from "../components/Voucher/VoucherAddForm";
import VoucherEditForm from "../components/Voucher/VoucherEditForm";
import VoucherHideDialog from "../components/Voucher/VoucherHideDialog";
import VoucherList from "../components/Voucher/VoucherList";

const PAGE_SIZE = 25; // Tăng từ 10 lên 25 để hiển thị nhiều vouchers hơn

// Trang quản lý voucher cho admin với giao diện đẹp
export default function AdminVoucherList() {
  // State quản lý dữ liệu voucher, loading, lỗi, popup form, filter, phân trang
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showHide, setShowHide] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [statusFilter, setStatusFilter] = useState(""); // Thêm filter theo trạng thái
  const [page, setPage] = useState(0); // Material-UI uses 0-based pagination
  const [totalPages, setTotalPages] = useState(1);
  const [totalRows, setTotalRows] = useState(0);

  // Hàm load danh sách voucher từ API, có filter/search/phân trang
  const loadVouchers = () => {
    setLoading(true);
    setError(""); // Clear previous errors
    
    const params = { 
      search, 
      dateFrom, 
      dateTo, 
      page: page + 1, // Convert to 1-based for backend
      limit: PAGE_SIZE 
    };
    
    console.log('🔍 Loading vouchers with params:', params);
    
    voucherService.getAll(params)
      .then(res => {
        console.log('✅ Vouchers loaded successfully:', res.data);
        const data = res.data;
        
        if (data.success && data.data) {
          setVouchers(data.data);
          setTotalRows(data.pagination?.total || data.total || data.data.length);
          console.log(`📊 Set ${data.data.length} vouchers, total: ${data.pagination?.total || data.total || data.data.length}`);
        } else {
          console.warn('⚠️ API response format unexpected:', data);
          setVouchers([]);
          setTotalRows(0);
          setError("Dữ liệu API không đúng định dạng");
        }
      })
      .catch(err => {
        console.error('❌ Error loading vouchers:', err);
        const errorMessage = err.response?.data?.message || err.message || "Lỗi tải voucher";
        setError(errorMessage);
        setVouchers([]);
        setTotalRows(0);
      })
      .finally(() => {
        console.log('🏁 Load vouchers finished');
        setLoading(false);
      });
  };

  // Khi filter/search/page thay đổi thì load lại voucher
  useEffect(() => {
    loadVouchers();
    // eslint-disable-next-line
  }, [search, dateFrom, dateTo, page]);

  // Mở popup thêm voucher
  const handleAdd = () => {
    setSelectedVoucher(null);
    setShowAdd(true);
  };

  // Mở popup sửa voucher
  const handleEdit = (item) => {
    setSelectedVoucher(item);
    setShowEdit(true);
  };

  // Mở popup ẩn voucher
  const handleHide = (item) => {
    setSelectedVoucher(item);
    setShowHide(true);
  };

  // Xóa voucher (có confirm)
  const handleDelete = async (id, maVoucher) => {
    if (!window.confirm(`Xác nhận xóa voucher "${maVoucher}"?`)) return;
    try {
      await voucherService.delete(id);
      loadVouchers();
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi xóa voucher");
    }
  };

  // Thêm voucher
  const handleAddSubmit = async (formData) => {
    try {
      await voucherService.create(formData);
      loadVouchers();
      setShowAdd(false);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi thêm voucher");
    }
  };

  // Sửa voucher
  const handleEditSubmit = async (formData) => {
    try {
      await voucherService.update(selectedVoucher.id_voucher, formData);
      loadVouchers();
      setShowEdit(false);
      setSelectedVoucher(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi sửa voucher");
    }
  };

  // Ẩn voucher
  const handleHideConfirm = async (voucher) => {
    try {
      await voucherService.update(voucher.id_voucher, { ...voucher, trangThai: 'hidden' });
      loadVouchers();
      setShowHide(false);
      setSelectedVoucher(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Lỗi ẩn voucher");
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  // Get voucher status - cải thiện để hiển thị chính xác hơn
  const getVoucherStatus = (voucher) => {
    const now = new Date();
    const startDate = voucher.ngayBatDau ? new Date(voucher.ngayBatDau) : null;
    const endDate = voucher.ngayHetHan ? new Date(voucher.ngayHetHan) : null;

    // Nếu không có ngày bắt đầu và kết thúc
    if (!startDate && !endDate) {
      return { label: 'Không giới hạn', className: 'status-unlimited' };
    }

    // Nếu chỉ có ngày kết thúc
    if (!startDate && endDate) {
      if (now > endDate) {
        return { label: 'Hết hạn', className: 'status-expired' };
      } else {
        return { label: 'Đang hoạt động', className: 'status-active' };
      }
    }

    // Nếu chỉ có ngày bắt đầu
    if (startDate && !endDate) {
      if (now < startDate) {
        return { label: 'Chưa bắt đầu', className: 'status-pending' };
      } else {
        return { label: 'Đang hoạt động', className: 'status-active' };
      }
    }

    // Nếu có cả ngày bắt đầu và kết thúc
    if (startDate && endDate) {
      if (now < startDate) {
        return { label: 'Chưa bắt đầu', className: 'status-pending' };
      } else if (now > endDate) {
        return { label: 'Hết hạn', className: 'status-expired' };
      } else {
        return { label: 'Đang hoạt động', className: 'status-active' };
      }
    }

    return { label: 'Không xác định', className: 'status-unknown' };
  };

  // Filter vouchers based on status filter
  const getFilteredVouchers = () => {
    if (!statusFilter) return vouchers;
    
    return vouchers.filter(voucher => {
      const status = getVoucherStatus(voucher);
      switch (statusFilter) {
        case 'active':
          return status.className === 'status-active';
        case 'pending':
          return status.className === 'status-pending';
        case 'expired':
          return status.className === 'status-expired';
        case 'unlimited':
          return status.className === 'status-unlimited';
        default:
          return true;
      }
    });
  };

  const filteredVouchers = getFilteredVouchers();

  return (
    <div className="voucher-management">
      {/* Header */}
      <div className="voucher-header">
        <h2>🎫 Quản lý Voucher</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn-secondary"
            onClick={loadVouchers}
            disabled={loading}
            style={{ 
              background: '#f8f9fa', 
              color: '#495057', 
              border: '1px solid #dee2e6',
              padding: '10px 16px',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            {loading ? '⏳ Đang tải...' : '🔄 Refresh'}
          </button>
          <button className="btn-primary" onClick={handleAdd}>
            + Thêm Voucher
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎫</div>
          <div className="stat-content">
            <div className="stat-number">{totalRows}</div>
            <div className="stat-label">Tổng Voucher</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-number">
              {vouchers.filter(v => getVoucherStatus(v).className === 'status-active').length}
            </div>
            <div className="stat-label">Đang hoạt động</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏰</div>
          <div className="stat-content">
            <div className="stat-number">
              {vouchers.filter(v => getVoucherStatus(v).className === 'status-pending').length}
            </div>
            <div className="stat-label">Chưa bắt đầu</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">❌</div>
          <div className="stat-content">
            <div className="stat-number">
              {vouchers.filter(v => getVoucherStatus(v).className === 'status-expired').length}
            </div>
            <div className="stat-label">Hết hạn</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">♾️</div>
          <div className="stat-content">
            <div className="stat-number">
              {vouchers.filter(v => getVoucherStatus(v).className === 'status-unlimited').length}
            </div>
            <div className="stat-label">Không giới hạn</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="🔍 Tìm kiếm mã voucher..."
            value={search}
            onChange={(e) => {setSearch(e.target.value); setPage(0);}}
            className="search-input"
          />
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => {setDateFrom(e.target.value); setPage(0);}}
            className="date-input"
            title="Ngày bắt đầu"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(e) => {setDateTo(e.target.value); setPage(0);}}
            className="date-input"
            title="Ngày hết hạn"
          />
          <select
            value={statusFilter}
            onChange={(e) => {setStatusFilter(e.target.value); setPage(0);}}
            className="status-filter"
          >
            <option value="">🏷️ Tất cả trạng thái</option>
            <option value="active">✅ Đang hoạt động</option>
            <option value="pending">⏰ Chưa bắt đầu</option>
            <option value="expired">❌ Hết hạn</option>
            <option value="unlimited">♾️ Không giới hạn</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="alert alert-error">
          ❌ {error}
          <button onClick={() => setError("")} className="alert-close">×</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải voucher...</p>
        </div>
      )}

      {/* Voucher Table */}
      {!loading && (
        <VoucherList
          vouchers={filteredVouchers}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onHide={handleHide}
          page={page + 1}
          totalPages={totalPages}
          onPageChange={(newPage) => setPage(newPage - 1)}
          getVoucherStatus={getVoucherStatus}
          formatCurrency={formatCurrency}
        />
      )}

      {/* Popup form thêm voucher */}
      <VoucherAddForm
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSubmit={handleAddSubmit}
      />
      {/* Popup form sửa voucher */}
      <VoucherEditForm
        open={showEdit}
        onClose={() => { setShowEdit(false); setSelectedVoucher(null); }}
        onSubmit={handleEditSubmit}
        initialData={selectedVoucher}
      />
      {/* Popup xác nhận ẩn voucher */}
      <VoucherHideDialog
        open={showHide}
        onClose={() => { setShowHide(false); setSelectedVoucher(null); }}
        onConfirm={handleHideConfirm}
        voucher={selectedVoucher}
      />
    </div>
  );
} 