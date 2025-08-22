import React from "react";
import "./AdminProductPage.css";

const statusOptions = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "active", label: "Hiển thị" },
  { value: "hidden", label: "Ẩn" }
];

export default function ProductFilter({ 
  search, 
  category, 
  status, 
  onSearchChange, 
  onCategoryChange, 
  onStatusChange,
  flatCategories = []
}) {
  return (
    <div className="filter-section">
      {/* Tìm kiếm */}
      <div className="filter-group">
        <label>Tìm kiếm sản phẩm</label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Nhập tên sản phẩm, thương hiệu..."
          className="filter-input"
        />
      </div>

      {/* Danh mục */}
      <div className="filter-group">
        <label>Danh mục</label>
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="filter-select"
        >
          <option value="">Tất cả danh mục</option>
          {flatCategories.length === 0 && (
            <option disabled>Đang tải danh mục...</option>
          )}
          {flatCategories.map((cat) => (
            <option key={cat.type + '_' + cat.id} value={cat.type === 'parent' ? `parent_${cat.id}` : cat.id}>
              {cat.type === 'parent' 
                ? `${cat.name} (Tất cả)` 
                : `${cat.parentName} - ${cat.name}`
              }
            </option>
          ))}
        </select>
      </div>

      {/* Trạng thái */}
      <div className="filter-group">
        <label>Trạng thái</label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
} 