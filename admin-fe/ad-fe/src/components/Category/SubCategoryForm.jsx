import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import subCategoryService from '../../services/subCategoryService';
import './SubCategoryForm.css';

const SubCategoryForm = ({ open, onClose, onSubmit, initialData, parentCategory, categories = [] }) => {
  const [formData, setFormData] = useState({
    tenDanhMucChiTiet: '',
    moTa: '',
    id_DanhMuc: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Reset form khi modal mở/đóng
  useEffect(() => {
    if (open) {
      if (initialData) {
        // Sửa danh mục con
        setFormData({
          tenDanhMucChiTiet: initialData.tenDanhMucChiTiet || '',
          moTa: initialData.moTa || '',
          id_DanhMuc: initialData.id_DanhMuc || ''
        });
      } else if (parentCategory) {
        // Thêm danh mục con cho danh mục cha cụ thể
        setFormData({
          tenDanhMucChiTiet: '',
          moTa: '',
          id_DanhMuc: parentCategory.id_DanhMuc
        });
      } else {
        // Thêm danh mục con mới
        setFormData({
          tenDanhMucChiTiet: '',
          moTa: '',
          id_DanhMuc: ''
        });
      }
      setError('');
    }
  }, [open, initialData, parentCategory]);

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
    if (!formData.tenDanhMucChiTiet.trim()) {
      setError('Tên danh mục con không được để trống');
      return;
    }

    if (!formData.id_DanhMuc) {
      setError('Vui lòng chọn danh mục cha');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (initialData) {
        // Cập nhật danh mục con
        await subCategoryService.update(initialData.id_DanhMucChiTiet, formData);
      } else {
        // Thêm danh mục con mới
        await subCategoryService.create(formData);
      }
      
      // Gọi callback và đóng modal
      onSubmit();
      onClose();
    } catch (err) {
      console.error('Error submitting subcategory:', err);
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lưu danh mục con');
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
    <div className="subcategory-form-overlay">
      <div className="subcategory-form-modal">
        <div className="subcategory-form-header">
          <h3>
            {initialData ? 'Sửa danh mục con' : 'Thêm danh mục con mới'}
          </h3>
          {parentCategory && (
            <span className="parent-info">
              Danh mục cha: {parentCategory.tenDanhMuc}
            </span>
          )}
          <button 
            className="close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="subcategory-form">
          <div className="form-group">
            <label htmlFor="id_DanhMuc" className="form-label">
              Danh mục cha <span className="required">*</span>
            </label>
            <select
              id="id_DanhMuc"
              name="id_DanhMuc"
              value={formData.id_DanhMuc}
              onChange={handleChange}
              className="form-select"
              disabled={loading || !!parentCategory}
            >
              <option value="">-- Chọn danh mục cha --</option>
              {categories.map(category => (
                <option key={category.id_DanhMuc} value={category.id_DanhMuc}>
                  {category.tenDanhMuc}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tenDanhMucChiTiet" className="form-label">
              Tên danh mục con <span className="required">*</span>
            </label>
            <input
              type="text"
              id="tenDanhMucChiTiet"
              name="tenDanhMucChiTiet"
              value={formData.tenDanhMucChiTiet}
              onChange={handleChange}
              placeholder="Nhập tên danh mục con..."
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
              placeholder="Nhập mô tả danh mục con (tùy chọn)..."
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
              disabled={loading || !formData.tenDanhMucChiTiet.trim() || !formData.id_DanhMuc}
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

export default SubCategoryForm; 