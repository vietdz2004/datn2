import React from "react";
import ProductCard from "./ProductCard";
import "./ProductList.css";

export default function ProductList({ 
  products, 
  loading, 
  onEdit, 
  onDelete, 
  onStatusChange,
  page,
  totalPages,
  onPageChange 
}) {
  if (loading) {
    return (
      <div className="loading-state">
        <div className="loading-spinner"></div>
        <p>Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="empty-state">
        <h3>Chưa có sản phẩm nào</h3>
        <p>Nhấn "Thêm sản phẩm" để tạo sản phẩm đầu tiên</p>
      </div>
    );
  }

  return (
    <div className="product-list">
      {/* Table Header */}
      <div className="table-header">
        <div className="header-cell header-image">Hình ảnh</div>
        <div className="header-cell header-info">Thông tin sản phẩm</div>
        <div className="header-cell header-price">Giá bán</div>
        <div className="header-cell header-stock">Tồn kho</div>
        <div className="header-cell header-status">Trạng thái</div>
        <div className="header-cell header-actions">Thao tác</div>
      </div>

      {/* Table Body */}
      <div className="table-body">
        {products.map((product) => (
          <ProductCard
            key={product.id_SanPham || product.id}
            product={product}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
          >
            ← Trước
          </button>
          
          <div className="page-info">
            <span>Trang {page} / {totalPages}</span>
          </div>
          
          <button
            className="page-btn"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  );
} 