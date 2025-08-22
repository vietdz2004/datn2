import axios from "./api";

const productService = {
  // Lấy danh sách sản phẩm với filter và phân trang (alias cho getAll)
  getAdminProducts: (params) => axios.get("/admin/products", { params }),

  // Lấy danh sách sản phẩm với filter và phân trang
  getAll: (params) => axios.get("/admin/products", { params }),

  // Lấy chi tiết sản phẩm theo ID
  getById: (id) => axios.get(`/admin/products/${id}`),

  // Tạo sản phẩm mới
  createProduct: (data, imageFile) => {
    console.log('📤 Creating product with data:', data, 'imageFile:', imageFile?.name);
    
    const formData = new FormData();
    
    // Append form fields
    Object.keys(data).forEach(key => {
      console.log(`📝 Appending field: ${key} = ${data[key]}`);
      formData.append(key, data[key]);
    });
    
    // Append image file with correct field name
    if (imageFile) {
      console.log('🖼️ Appending image file:', imageFile.name);
      formData.append('image', imageFile); // Backend expects 'image' field
    }
    
    // Debug FormData
    console.log('📋 FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value);
    }
    
    return axios.post("/admin/products", formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Tạo sản phẩm mới (alias)
  create: (data) => axios.post("/admin/products", data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Cập nhật sản phẩm
  updateProduct: (id, data, imageFile) => {
    console.log('📤 Updating product with data:', data, 'imageFile:', imageFile?.name);
    
    const formData = new FormData();
    
    // Append form fields
    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });
    
    // Append image file with correct field name
    if (imageFile) {
      formData.append('image', imageFile); // Backend expects 'image' field
    }
    
    return axios.put(`/admin/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Cập nhật sản phẩm (alias)
  update: (id, data) => axios.put(`/admin/products/${id}`, data, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),

  // Xóa sản phẩm
  deleteProduct: (id) => axios.delete(`/admin/products/${id}`),

  // Xóa sản phẩm (alias)
  delete: (id) => axios.delete(`/admin/products/${id}`),

  // Cập nhật trạng thái sản phẩm
  updateProductStatus: (id, status) => axios.put(`/admin/products/${id}/status`, { status }),

  // Cập nhật trạng thái sản phẩm (alias)
  updateStatus: (id, status) => axios.put(`/admin/products/${id}/status`, { status }),

  // Xóa nhiều sản phẩm
  bulkDelete: (ids) => axios.post("/admin/products/bulk/delete", { ids }),

  // Tìm kiếm sản phẩm nâng cao
  search: (params) => axios.get("/admin/products/search/advanced", { params }),

  // Lấy sản phẩm đang giảm giá
  getDiscountProducts: (params) => axios.get("/admin/products/filter/discounted", { params }),

  // Lấy sản phẩm theo danh mục
  getByCategory: (categoryId, params) => axios.get(`/admin/products/filter/by-category/${categoryId}`, { params })
};

export default productService; 