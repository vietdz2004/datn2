import React, { useState, useRef, useEffect } from "react";
import "./ProductForm.css";

export default function ProductForm({ 
  open, 
  onClose, 
  onSubmit, 
  initialData = {}, 
  categoryTree = []
}) {
  // State quản lý dữ liệu form
  const [form, setForm] = useState({
    tenSp: "",
    gia: "",
    giaKhuyenMai: "",
    soLuongTon: "",
    soLuongToiThieu: "5",
    thuongHieu: "",
    moTa: "",
    trangThai: "active",
    id_DanhMucChiTiet: "",
  });

  const [errors, setErrors] = useState({});
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();

  // Reset form khi mở modal
  useEffect(() => {
    if (open) {
      if (initialData && initialData.id) {
        // Editing existing product
        setForm({
          tenSp: initialData.tenSp || "",
          gia: initialData.gia || "",
          giaKhuyenMai: initialData.giaKhuyenMai || "",
          soLuongTon: initialData.soLuongTon || "",
          soLuongToiThieu: initialData.soLuongToiThieu || "5",
          thuongHieu: initialData.thuongHieu || "",
          moTa: initialData.moTa || "",
          trangThai: initialData.trangThai || "active",
          id_DanhMucChiTiet: initialData.id_DanhMucChiTiet || "",
        });
      } else {
        // Adding new product
        setForm({
          tenSp: "",
          gia: "",
          giaKhuyenMai: "",
          soLuongTon: "",
          soLuongToiThieu: "5",
          thuongHieu: "",
          moTa: "",
          trangThai: "active",
          id_DanhMucChiTiet: "",
        });
      }
      setImage(null);
      setImagePreview(null);
      setErrors({});
    }
  }, [open, initialData?.id]);

  // Simple validation
  const validateField = (name, value) => {
    switch (name) {
      case "tenSp":
        return !value.trim() ? "Tên sản phẩm là bắt buộc" : "";
      case "gia":
        return !value || isNaN(value) || Number(value) <= 0 ? "Giá bán phải là số dương" : "";
      case "soLuongTon":
        return !value || isNaN(value) || Number(value) < 0 ? "Số lượng tồn phải là số không âm" : "";
      case "thuongHieu":
        return !value.trim() ? "Thương hiệu là bắt buộc" : "";
      case "id_DanhMucChiTiet":
        return !value ? "Danh mục là bắt buộc" : "";
      default:
        return "";
    }
  };

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error khi user nhập
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  // Handle image change  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      console.log('📁 File selected:', file.name, file.type, file.size);
      
      // Validate file
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('Chỉ chấp nhận file ảnh (JPG, PNG, WebP)');
        e.target.value = '';
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert('File ảnh không được vượt quá 5MB');
        e.target.value = '';
        return;
      }
      
      // Set image state
      setImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        console.log('🖼️ Image loaded for preview');
        setImagePreview(event.target.result);
      };
      reader.onerror = (error) => {
        console.error('❌ Error reading file:', error);
        setImagePreview(null);
      };
      reader.readAsDataURL(file);
      
    } else {
      console.log('🚫 No file selected');
      setImage(null);
      setImagePreview(null);
    }
  };

  // Remove image
  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileRef.current) {
      fileRef.current.value = '';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields
    const requiredFields = ['tenSp', 'gia', 'soLuongTon', 'thuongHieu', 'id_DanhMucChiTiet'];
    requiredFields.forEach(field => {
      const error = validateField(field, form[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    setLoading(true);
    try {
      console.log('📤 Submitting form:', { form, image: image?.name });
      await onSubmit(form, image);
      onClose();
    } catch (error) {
      console.error('❌ Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Render category options
  const renderCategoryOptions = () => {
    const options = [];
    
    categoryTree.forEach(parent => {
      if (parent.subCategories && parent.subCategories.length > 0) {
        parent.subCategories.forEach(sub => {
          options.push(
            <option key={sub.id_DanhMucChiTiet || sub.id} value={sub.id_DanhMucChiTiet || sub.id}>
              {parent.tenDanhMuc} - {sub.tenDanhMucChiTiet || sub.tenDanhMuc}
            </option>
          );
        });
      }
    });
    
    return options;
  };

  if (!open) return null;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData?.id ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
          <button 
            type="button" 
            className="close-btn" 
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-grid">
            {/* Tên sản phẩm */}
            <div className="form-group">
              <label htmlFor="tenSp">
                Tên sản phẩm <span className="required">*</span>
              </label>
              <input
                type="text"
                id="tenSp"
                name="tenSp"
                value={form.tenSp}
                onChange={handleChange}
                placeholder="Nhập tên sản phẩm"
                className={errors.tenSp ? "error" : ""}
              />
              {errors.tenSp && <span className="error-text">{errors.tenSp}</span>}
            </div>

            {/* Thương hiệu */}
            <div className="form-group">
              <label htmlFor="thuongHieu">
                Thương hiệu <span className="required">*</span>
              </label>
              <input
                type="text"
                id="thuongHieu"
                name="thuongHieu"
                value={form.thuongHieu}
                onChange={handleChange}
                placeholder="Nhập thương hiệu"
                className={errors.thuongHieu ? "error" : ""}
              />
              {errors.thuongHieu && <span className="error-text">{errors.thuongHieu}</span>}
            </div>

            {/* Giá bán */}
            <div className="form-group">
              <label htmlFor="gia">
                Giá bán (VND) <span className="required">*</span>
              </label>
              <input
                type="number"
                id="gia"
                name="gia"
                value={form.gia}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={errors.gia ? "error" : ""}
              />
              {errors.gia && <span className="error-text">{errors.gia}</span>}
            </div>

            {/* Giá khuyến mãi */}
            <div className="form-group">
              <label htmlFor="giaKhuyenMai">Giá khuyến mãi (VND)</label>
              <input
                type="number"
                id="giaKhuyenMai"
                name="giaKhuyenMai"
                value={form.giaKhuyenMai}
                onChange={handleChange}
                placeholder="0"
                min="0"
              />
            </div>

            {/* Số lượng tồn */}
            <div className="form-group">
              <label htmlFor="soLuongTon">
                Số lượng tồn <span className="required">*</span>
              </label>
              <input
                type="number"
                id="soLuongTon"
                name="soLuongTon"
                value={form.soLuongTon}
                onChange={handleChange}
                placeholder="0"
                min="0"
                className={errors.soLuongTon ? "error" : ""}
              />
              {errors.soLuongTon && <span className="error-text">{errors.soLuongTon}</span>}
            </div>

            {/* Số lượng tối thiểu */}
            <div className="form-group">
              <label htmlFor="soLuongToiThieu">Số lượng tối thiểu</label>
              <input
                type="number"
                id="soLuongToiThieu"
                name="soLuongToiThieu"
                value={form.soLuongToiThieu}
                onChange={handleChange}
                placeholder="5"
                min="0"
              />
            </div>

            {/* Danh mục */}
            <div className="form-group">
              <label htmlFor="id_DanhMucChiTiet">
                Danh mục <span className="required">*</span>
              </label>
              <select
                id="id_DanhMucChiTiet"
                name="id_DanhMucChiTiet"
                value={form.id_DanhMucChiTiet}
                onChange={handleChange}
                className={errors.id_DanhMucChiTiet ? "error" : ""}
              >
                <option value="">Chọn danh mục</option>
                {renderCategoryOptions()}
              </select>
              {errors.id_DanhMucChiTiet && <span className="error-text">{errors.id_DanhMucChiTiet}</span>}
            </div>

            {/* Trạng thái */}
            <div className="form-group">
              <label htmlFor="trangThai">Trạng thái</label>
              <select
                id="trangThai"
                name="trangThai"
                value={form.trangThai}
                onChange={handleChange}
              >
                <option value="active">Hiển thị</option>
                <option value="hidden">Ẩn</option>
              </select>
            </div>
          </div>

          {/* Mô tả */}
          <div className="form-group full-width">
            <label htmlFor="moTa">Mô tả sản phẩm</label>
            <textarea
              id="moTa"
              name="moTa"
              value={form.moTa}
              onChange={handleChange}
              placeholder="Nhập mô tả sản phẩm..."
              rows="4"
            />
          </div>

          {/* Hình ảnh */}
          <div className="form-group full-width">
            <label>Hình ảnh sản phẩm</label>
            
            <input
              type="file"
              ref={fileRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              style={{ display: 'none' }}
            />
            
            <div className="image-upload-container">
              <div className="image-upload-actions">
                <button
                  type="button"
                  className="upload-btn"
                  onClick={() => fileRef.current?.click()}
                >
                  {image || initialData?.hinhAnh ? 'Thay đổi ảnh' : 'Chọn ảnh'}
                </button>
                
                {(image || imagePreview) && (
                  <button
                    type="button"
                    className="remove-btn"
                    onClick={removeImage}
                  >
                    Xóa ảnh
                  </button>
                )}
              </div>
              
              {/* Preview ảnh */}
              <div className="image-preview-container">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <span className="image-info">Ảnh mới: {image?.name}</span>
                  </div>
                ) : initialData?.hinhAnh ? (
                  <div className="image-preview">
                    <img 
                      src={`http://localhost:5002${initialData.hinhAnh}`} 
                      alt="Current"
                      onError={(e) => {
                        e.target.src = '/no-image.png';
                      }}
                    />
                    <span className="image-info">Ảnh hiện tại</span>
                  </div>
                ) : (
                  <div className="no-image">
                    <span>Chưa có ảnh</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn" 
              onClick={onClose}
              disabled={loading}
            >
              Hủy
            </button>
            <button 
              type="submit" 
              className="submit-btn" 
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (initialData?.id ? 'Cập nhật' : 'Thêm mới')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 