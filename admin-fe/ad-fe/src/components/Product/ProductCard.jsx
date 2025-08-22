import React from "react";

const API_BASE_URL = "http://localhost:5002"; // Base URL without /api for static files

export default function ProductCard({ product, onEdit, onDelete, onStatusChange }) {
  const imageUrl = product.hinhAnh 
    ? `${API_BASE_URL}${product.hinhAnh}`
    : "/no-image.png";

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { text: "Hết hàng", className: "stock-out" };
    if (stock <= minStock) return { text: "Sắp hết", className: "stock-low" };
    return { text: "Còn hàng", className: "stock-ok" };
  };

  const stockStatus = getStockStatus(product.soLuongTon, product.soLuongToiThieu);

  const handleStatusToggle = () => {
    const newStatus = product.trangThai === 'active' ? 'hidden' : 'active';
    onStatusChange(product.id_SanPham || product.id, newStatus);
  };

  const handleEdit = () => {
    onEdit(product);
  };

  const handleHide = () => {
    onDelete(product.id_SanPham || product.id);
  };

  return (
    <div className="product-row">
      {/* Hình ảnh */}
      <div className="cell cell-image" data-label="Hình ảnh">
        <div className="product-image">
          <img 
            src={imageUrl}
            alt={product.tenSp}
            onError={(e) => {
              e.target.src = "/no-image.png";
            }}
          />
        </div>
      </div>

      {/* Thông tin sản phẩm */}
      <div className="cell cell-info" data-label="Thông tin">
        <div className="product-info">
          <h4 className="product-name">{product.tenSp}</h4>
          <p className="product-brand">{product.thuongHieu}</p>
          <p className="product-category">
            {product.tenDanhMuc && product.tenDanhMucChiTiet 
              ? `${product.tenDanhMuc} › ${product.tenDanhMucChiTiet}`
              : (product.tenDanhMucChiTiet || 'Chưa phân loại')
            }
          </p>
        </div>
      </div>

      {/* Giá bán */}
      <div className="cell cell-price" data-label="Giá bán">
        <div className="price-info">
          <div className="price-current">{formatPrice(product.gia)}</div>
          {product.giaKhuyenMai && product.giaKhuyenMai < product.gia && (
            <div className="price-sale">{formatPrice(product.giaKhuyenMai)}</div>
          )}
        </div>
      </div>

      {/* Tồn kho */}
      <div className="cell cell-stock" data-label="Tồn kho">
        <div className="stock-info">
          <div className="stock-number">{product.soLuongTon}</div>
          <div className={`stock-status ${stockStatus.className}`}>
            {stockStatus.text}
          </div>
        </div>
      </div>

      {/* Trạng thái */}
      <div className="cell cell-status" data-label="Trạng thái">
        <button
          className={`status-toggle ${product.trangThai}`}
          onClick={handleStatusToggle}
          title={product.trangThai === 'active' ? 'Click để ẩn sản phẩm' : 'Click để hiển thị sản phẩm'}
        >
          {product.trangThai === 'active' ? 'Hiển thị' : 'Ẩn'}
        </button>
      </div>

      {/* Thao tác */}
      <div className="cell cell-actions" data-label="Thao tác">
        <div className="action-buttons">
          <button
            className="action-btn edit-btn"
            onClick={handleEdit}
            title="Chỉnh sửa sản phẩm"
          >
            Sửa
          </button>
          
          <button
            className="action-btn hide-btn"
            onClick={handleHide}
            title="Ẩn sản phẩm khỏi danh sách"
          >
            Ẩn
          </button>
        </div>
      </div>
    </div>
  );
} 