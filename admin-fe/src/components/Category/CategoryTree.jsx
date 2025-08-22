import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import './CategoryTree.css';

const CategoryTree = ({ categories, onReorder, compact = false }) => {
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverItem, setDragOverItem] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState(new Set());

  // Toggle collapse/expand category
  const toggleCollapse = (categoryId) => {
    const newCollapsed = new Set(collapsedCategories);
    if (newCollapsed.has(categoryId)) {
      newCollapsed.delete(categoryId);
    } else {
      newCollapsed.add(categoryId);
    }
    setCollapsedCategories(newCollapsed);
  };

  // Drag handlers
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e, item, type) => {
    e.preventDefault();
    setDragOverItem({ ...item, type });
  };

  const handleDragLeave = (e) => {
    // Only clear if leaving the entire tree area
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDragOverItem(null);
    }
  };

  const handleDrop = (e, targetItem, targetType) => {
    e.preventDefault();
    
    if (!draggedItem || !targetItem) return;
    
    // Don't allow dropping on itself
    if (draggedItem.type === targetType && 
        draggedItem.id_DanhMuc === targetItem.id_DanhMuc) {
      setDraggedItem(null);
      setDragOverItem(null);
      return;
    }

    // Handle reordering logic
    if (onReorder) {
      onReorder(draggedItem, targetItem);
    }

    setDraggedItem(null);
    setDragOverItem(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDragOverItem(null);
  };

  // Render category statistics
  const renderCategoryStats = (category) => {
    const subCount = category.subCategories ? category.subCategories.length : 0;
    return (
      <span className="category-stats">
        {subCount} danh mục con
      </span>
    );
  };

  // Render subcategory item
  const renderSubCategory = (subCategory, parentCategory) => {
    const isDraggedOver = dragOverItem && 
      dragOverItem.type === 'sub' && 
      dragOverItem.id_DanhMucChiTiet === subCategory.id_DanhMucChiTiet;

    return (
      <div
        key={subCategory.id_DanhMucChiTiet}
        className={`subcategory-tree-item ${isDraggedOver ? 'drag-over' : ''}`}
        draggable
        onDragStart={(e) => handleDragStart(e, subCategory, 'sub')}
        onDragOver={handleDragOver}
        onDragEnter={(e) => handleDragEnter(e, subCategory, 'sub')}
        onDrop={(e) => handleDrop(e, subCategory, 'sub')}
        onDragEnd={handleDragEnd}
      >
        <div className="subcategory-content">
          <span className="subcategory-connector">├─</span>
          <div className="subcategory-info">
            <span className="subcategory-name">{subCategory.tenDanhMucChiTiet}</span>
            {!compact && (
              <span className="subcategory-id">ID: {subCategory.id_DanhMucChiTiet}</span>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Render category item
  const renderCategory = (category) => {
    const isCollapsed = collapsedCategories.has(category.id_DanhMuc);
    const hasSubCategories = category.subCategories && category.subCategories.length > 0;
    const isDraggedOver = dragOverItem && 
      dragOverItem.type === 'parent' && 
      dragOverItem.id_DanhMuc === category.id_DanhMuc;

    return (
      <div
        key={category.id_DanhMuc}
        className={`category-tree-item ${isDraggedOver ? 'drag-over' : ''}`}
      >
        <div
          className="category-content"
          draggable
          onDragStart={(e) => handleDragStart(e, category, 'parent')}
          onDragOver={handleDragOver}
          onDragEnter={(e) => handleDragEnter(e, category, 'parent')}
          onDrop={(e) => handleDrop(e, category, 'parent')}
          onDragEnd={handleDragEnd}
        >
          <div className="category-header">
            <button
              className={`collapse-btn ${isCollapsed ? 'collapsed' : 'expanded'}`}
              onClick={() => toggleCollapse(category.id_DanhMuc)}
              disabled={!hasSubCategories}
            >
              {hasSubCategories ? (isCollapsed ? '▶' : '▼') : '○'}
            </button>
            
            <div className="category-info">
              <span className="category-name">{category.tenDanhMuc}</span>
              {!compact && (
                <div className="category-meta">
                  <span className="category-id">ID: {category.id_DanhMuc}</span>
                  {renderCategoryStats(category)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Subcategories */}
        {!isCollapsed && hasSubCategories && (
          <div className="subcategories-container">
            {category.subCategories.map(subCategory => 
              renderSubCategory(subCategory, category)
            )}
          </div>
        )}
      </div>
    );
  };

  if (!categories || categories.length === 0) {
    return (
      <div className="category-tree-empty">
        <span>Không có danh mục nào để hiển thị</span>
      </div>
    );
  }

  return (
    <div 
      className={`category-tree ${compact ? 'compact' : ''}`}
      onDragLeave={handleDragLeave}
    >
      <div className="category-tree-header">
        <h4>Cây danh mục</h4>
        <span className="tree-info">
          Kéo thả để sắp xếp lại thứ tự
        </span>
      </div>

      <div className="category-tree-content">
        {categories.map(category => renderCategory(category))}
      </div>

      {draggedItem && (
        <div className="drag-preview">
          Đang di chuyển: {draggedItem.tenDanhMuc || draggedItem.tenDanhMucChiTiet}
        </div>
      )}
    </div>
  );
};

export default CategoryTree; 