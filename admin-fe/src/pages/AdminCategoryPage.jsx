import React, { useState, useEffect } from 'react';
import CategoryList from '../components/Category/CategoryList';
import CategoryForm from '../components/Category/CategoryForm';
import SubCategoryForm from '../components/Category/SubCategoryForm';
import CategoryTree from '../components/Category/CategoryTree';
import categoryService from '../services/categoryService';
import subCategoryService from '../services/subCategoryService';
import './AdminCategoryPage.css';

const AdminCategoryPage = () => {
  // State management
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Modal states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [editType, setEditType] = useState('parent'); // 'parent' or 'sub'
  const [parentCategory, setParentCategory] = useState(null);
  
  // View states
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'tree'
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load categories
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

  // Show success message
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  // Handle add new category
  const handleAddCategory = () => {
    setEditData(null);
    setEditType('parent');
    setParentCategory(null);
    setShowCategoryForm(true);
  };

  // Handle add subcategory
  const handleAddSubCategory = (category = null) => {
    setEditData(null);
    setEditType('sub');
    setParentCategory(category);
    setShowSubCategoryForm(true);
  };

  // Handle edit
  const handleEdit = (data, type) => {
    setEditData(data);
    setEditType(type);
    setParentCategory(null);
    
    if (type === 'parent') {
      setShowCategoryForm(true);
    } else {
      setShowSubCategoryForm(true);
    }
  };

  // Handle delete
  const handleDelete = async (id, type, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${type === 'parent' ? 'danh mục' : 'danh mục con'} "${name}"?`)) {
      return;
    }

    try {
      if (type === 'parent') {
        await categoryService.delete(id);
        showSuccessMessage('Xóa danh mục thành công!');
      } else {
        await subCategoryService.delete(id);
        showSuccessMessage('Xóa danh mục con thành công!');
      }
      
      triggerRefresh();
    } catch (err) {
      console.error('Error deleting:', err);
      setError(err.response?.data?.message || `Lỗi khi xóa ${type === 'parent' ? 'danh mục' : 'danh mục con'}`);
    }
  };

  // Handle form submit
  const handleFormSubmit = () => {
    triggerRefresh();
    showSuccessMessage(
      editData 
        ? `Cập nhật ${editType === 'parent' ? 'danh mục' : 'danh mục con'} thành công!`
        : `Thêm ${editType === 'parent' ? 'danh mục' : 'danh mục con'} thành công!`
    );
  };

  // Handle reorder (for drag & drop)
  const handleReorder = async (draggedItem, targetItem) => {
    // This would implement the reordering logic
    console.log('Reorder:', draggedItem, 'to', targetItem);
    // You can implement the backend API call here
  };

  // Trigger refresh
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  // Get statistics
  const getStats = () => {
    const totalParents = categories.length;
    const totalSubs = categories.reduce((sum, cat) => 
      sum + (cat.subCategories ? cat.subCategories.length : 0), 0
    );
    
    return { totalParents, totalSubs };
  };

  const stats = getStats();

  return (
    <div className="admin-category-page">
      {/* Header */}
      <div className="category-page-header">
        <div className="header-left">
          <h2>Quản lý danh mục</h2>
          <div className="category-stats">
            <span className="stat-item">
              {stats.totalParents} danh mục cha
            </span>
            <span className="stat-item">
              {stats.totalSubs} danh mục con
            </span>
          </div>
        </div>
        
        <div className="header-actions">
          <div className="view-toggle">
            <button 
              className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
            >
              Danh sách
            </button>
            <button 
              className={`toggle-btn ${viewMode === 'tree' ? 'active' : ''}`}
              onClick={() => setViewMode('tree')}
            >
              Cây thư mục
            </button>
          </div>
          
          <div className="action-buttons">
            <button 
              className="btn-add-sub"
              onClick={() => handleAddSubCategory()}
            >
              + Danh mục con
            </button>
            <button 
              className="btn-add-category"
              onClick={handleAddCategory}
            >
              + Danh mục cha
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message">
          {success}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Main content */}
      <div className="category-page-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <span>Đang tải danh mục...</span>
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              <CategoryList
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddSubCategory={handleAddSubCategory}
                refreshTrigger={refreshTrigger}
              />
            ) : (
              <CategoryTree
                categories={categories}
                onReorder={handleReorder}
              />
            )}
          </>
        )}
      </div>

      {/* Forms */}
      <CategoryForm
        open={showCategoryForm}
        onClose={() => setShowCategoryForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
      />

      <SubCategoryForm
        open={showSubCategoryForm}
        onClose={() => setShowSubCategoryForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
        parentCategory={parentCategory}
        categories={categories}
      />
    </div>
  );
};

export default AdminCategoryPage; 