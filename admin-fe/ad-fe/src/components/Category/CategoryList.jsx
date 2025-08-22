import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import './CategoryList.css';

const CategoryList = ({ onEdit, onDelete, onAddSubCategory, refreshTrigger }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  // Load danh mục từ API
  const loadCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await categoryService.getCategoryTree();
      setCategories(response.data.data || []);
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(err.response?.data?.message || 'Lỗi tải danh mục');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [refreshTrigger]);

  // Toggle mở/đóng danh mục cha
  const toggleCategory = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Render loading state
  if (loading) {
    return (
      <div className="category-list-loading">
        <div className="loading-spinner"></div>
        <span>Đang tải danh mục...</span>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="category-list-error">
        <span className="error-message">{error}</span>
        <button onClick={loadCategories} className="retry-btn">
          Thử lại
        </button>
      </div>
    );
  }

  // Render empty state
  if (categories.length === 0) {
    return (
      <div className="category-list-empty">
        <span>Chưa có danh mục nào</span>
      </div>
    );
  }

  return (
    <div className="category-list">
      <div className="category-list-header">
        <h3>Cây danh mục</h3>
        <span className="category-count">({categories.length} danh mục cha)</span>
      </div>

      <div className="category-tree">
        {categories.map(category => (
          <div key={category.id_DanhMuc} className="category-item">
            {/* Danh mục cha */}
            <div className="parent-category">
              <div className="category-info">
                <button 
                  className={`expand-btn ${expandedCategories.has(category.id_DanhMuc) ? 'expanded' : ''}`}
                  onClick={() => toggleCategory(category.id_DanhMuc)}
                  disabled={!category.subCategories || category.subCategories.length === 0}
                >
                  {category.subCategories && category.subCategories.length > 0 ? '▼' : '▶'}
                </button>
                
                <div className="category-details">
                  <span className="category-name">{category.tenDanhMuc}</span>
                  <span className="category-meta">
                    ID: {category.id_DanhMuc} • 
                    {category.subCategories ? category.subCategories.length : 0} danh mục con
                  </span>
                </div>
              </div>

              <div className="category-actions">
                <button 
                  className="btn-add-sub"
                  onClick={() => onAddSubCategory(category)}
                  title="Thêm danh mục con"
                >
                  + Con
                </button>
                <button 
                  className="btn-edit"
                  onClick={() => onEdit(category, 'parent')}
                  title="Sửa danh mục"
                >
                  Sửa
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => onDelete(category.id_DanhMuc, 'parent', category.tenDanhMuc)}
                  title="Xóa danh mục"
                >
                  Xóa
                </button>
              </div>
            </div>

            {/* Danh mục con */}
            {expandedCategories.has(category.id_DanhMuc) && category.subCategories && (
              <div className="sub-categories">
                {category.subCategories.map(subCategory => (
                  <div key={subCategory.id_DanhMucChiTiet} className="sub-category-item">
                    <div className="sub-category-info">
                      <span className="sub-category-connector">└─</span>
                      <div className="sub-category-details">
                        <span className="sub-category-name">{subCategory.tenDanhMucChiTiet}</span>
                        <span className="sub-category-meta">
                          ID: {subCategory.id_DanhMucChiTiet}
                        </span>
                      </div>
                    </div>

                    <div className="sub-category-actions">
                      <button 
                        className="btn-edit"
                        onClick={() => onEdit(subCategory, 'sub')}
                        title="Sửa danh mục con"
                      >
                        Sửa
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => onDelete(subCategory.id_DanhMucChiTiet, 'sub', subCategory.tenDanhMucChiTiet)}
                        title="Xóa danh mục con"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryList; 