import React, { useState } from 'react';
import { Search, FilterList, Clear, DateRange } from '@mui/icons-material';
import './AdvancedSearch.css';

const AdvancedSearch = ({ onSearch, onReset }) => {
  const [searchParams, setSearchParams] = useState({
    orderId: '',
    customerPhone: '',
    customerEmail: '',
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'cho_xu_ly', label: 'Chờ xử lý' },
    { value: 'da_xac_nhan', label: 'Đã xác nhận' },
    { value: 'dang_giao', label: 'Đang giao hàng' },
    { value: 'da_giao', label: 'Đã giao hàng' },
    { value: 'huy_boi_admin', label: 'Đã hủy' }
  ];

  const handleInputChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // Lọc bỏ các field rỗng
    const filteredParams = Object.fromEntries(
      Object.entries(searchParams).filter(([, value]) => value.trim() !== '')
    );
    onSearch(filteredParams);
  };

  const handleReset = () => {
    const resetParams = {
      orderId: '',
      customerPhone: '',
      customerEmail: '',
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    };
    setSearchParams(resetParams);
    onReset();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="advanced-search">
      {/* Tìm kiếm cơ bản */}
      <div className="search-basic">
        <div className="search-input-group">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn hàng, SĐT hoặc email..."
            value={searchParams.orderId || searchParams.customerPhone || searchParams.customerEmail}
            onChange={(e) => {
              const value = e.target.value;
              // Auto-detect loại tìm kiếm
              if (value.startsWith('#')) {
                handleInputChange('orderId', value.substring(1));
                handleInputChange('customerPhone', '');
                handleInputChange('customerEmail', '');
              } else if (value.includes('@')) {
                handleInputChange('customerEmail', value);
                handleInputChange('orderId', '');
                handleInputChange('customerPhone', '');
              } else if (/^\d+$/.test(value)) {
                handleInputChange('customerPhone', value);
                handleInputChange('orderId', '');
                handleInputChange('customerEmail', '');
              } else {
                handleInputChange('orderId', value);
                handleInputChange('customerPhone', '');
                handleInputChange('customerEmail', '');
              }
            }}
            onKeyPress={handleKeyPress}
            className="search-input"
          />
          <button 
            className="search-btn primary"
            onClick={handleSearch}
          >
            <Search /> Tìm kiếm
          </button>
        </div>
        
        <button 
          className={`advanced-toggle ${showAdvanced ? 'active' : ''}`}
          onClick={() => setShowAdvanced(!showAdvanced)}
        >
          <FilterList /> Tìm kiếm nâng cao
        </button>
      </div>

      {/* Tìm kiếm nâng cao */}
      {showAdvanced && (
        <div className="search-advanced">
          <div className="search-row">
            <div className="search-field">
              <label>Mã đơn hàng:</label>
              <input
                type="text"
                placeholder="Nhập mã đơn hàng..."
                value={searchParams.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <div className="search-field">
              <label>Số điện thoại:</label>
              <input
                type="text"
                placeholder="Nhập SĐT khách hàng..."
                value={searchParams.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <div className="search-field">
              <label>Email:</label>
              <input
                type="email"
                placeholder="Nhập email khách hàng..."
                value={searchParams.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
          </div>

          <div className="search-row">
            <div className="search-field">
              <label>Trạng thái:</label>
              <select
                value={searchParams.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="search-field">
              <label>Từ ngày:</label>
              <input
                type="date"
                value={searchParams.dateFrom}
                onChange={(e) => handleInputChange('dateFrom', e.target.value)}
              />
            </div>
            
            <div className="search-field">
              <label>Đến ngày:</label>
              <input
                type="date"
                value={searchParams.dateTo}
                onChange={(e) => handleInputChange('dateTo', e.target.value)}
              />
            </div>
          </div>

          <div className="search-row">
            <div className="search-field">
              <label>Giá trị từ:</label>
              <input
                type="number"
                placeholder="0"
                value={searchParams.minAmount}
                onChange={(e) => handleInputChange('minAmount', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <div className="search-field">
              <label>Giá trị đến:</label>
              <input
                type="number"
                placeholder="1000000"
                value={searchParams.maxAmount}
                onChange={(e) => handleInputChange('maxAmount', e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            
            <div className="search-actions">
              <button 
                className="search-btn primary"
                onClick={handleSearch}
              >
                <Search /> Áp dụng bộ lọc
              </button>
              <button 
                className="search-btn secondary"
                onClick={handleReset}
              >
                <Clear /> Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hiển thị bộ lọc đang áp dụng */}
      <div className="active-filters">
        {Object.entries(searchParams).map(([key, value]) => {
          if (!value) return null;
          
          let label = '';
          switch(key) {
            case 'orderId': label = `Mã đơn: ${value}`; break;
            case 'customerPhone': label = `SĐT: ${value}`; break;
            case 'customerEmail': label = `Email: ${value}`; break;
            case 'status': {
              const statusLabel = statusOptions.find(s => s.value === value)?.label;
              label = `Trạng thái: ${statusLabel}`;
              break;
            }
            case 'dateFrom': label = `Từ: ${value}`; break;
            case 'dateTo': label = `Đến: ${value}`; break;
            case 'minAmount': label = `Từ: ${Number(value).toLocaleString()}đ`; break;
            case 'maxAmount': label = `Đến: ${Number(value).toLocaleString()}đ`; break;
            default: return null;
          }
          
          return (
            <span key={key} className="filter-tag">
              {label}
              <button onClick={() => handleInputChange(key, '')}>×</button>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default AdvancedSearch;
