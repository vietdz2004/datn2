import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import './CategoryForm.css';

const CategoryForm = ({ open, onClose, onSubmit, initialData, type = 'parent' }) => {
  const [formData, setFormData] = useState({
    tenDanhMuc: '',
    moTa: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          tenDanhMuc: initialData.tenDanhMuc || '',
          moTa: initialData.moTa || ''
        });
      } else {
        setFormData({
          tenDanhMuc: '',
          moTa: ''
        });
      }
      setError('');
    }
  }, [open, initialData]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.tenDanhMuc.trim()) {
      setError('Tên danh mục không được để trống');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (initialData) {
        // Cập nhật danh mục
        await categoryService.update(initialData.id_DanhMuc, formData);
      } else {
        // Thêm danh mục mới
        await categoryService.create(formData);
      }
      
      // Gọi callback và đóng modal
      onSubmit();
      onClose();
    } catch (err) {
      console.error('Error submitting category:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục');
    } finally {
      setLoading(false);
    }
  };

  // Đóng modal
  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="category-form-overlay">
      <div className="category-form-modal">
        <div className="category-form-header">
          <h3>
            {initialData ? 'Sửa danh mục' : 'Thêm danh mục mới'}
          </h3>
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="category-form">
          <div className="form-group">
            <label htmlFor="tenDanhMuc" className="form-label">
              Tên danh mục <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tenDanhMuc"
              name="tenDanhMuc"
              value={formData.tenDanhMuc}
              onChange={handleChange}
              placeholder="Nhập tên danh mục..."
              className="form-input"
              disabled={loading}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label htmlFor="moTa" className="form-label">
              Mô tả
            </label>
            <textarea
              id="moTa"
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              placeholder="Nhập mô tả danh mục (tùy chọn)..."
              className="form-textarea"
              disabled={loading}
              rows={3}
              maxLength={500}
            />
          </div>

          {error && (
            <div className="form-error">
              {error}
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn-cancel"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading || !formData.tenDanhMuc.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner small"></span>
                  Đang lưu...
                </>
              ) : (
                initialData ? 'Cập nhật' : 'Thêm mới'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryForm; 