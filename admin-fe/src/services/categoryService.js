import axios from "./api";

const categoryService = {
  // Lấy tất cả danh mục
  getAll: (params = {}) => axios.get("/admin/categories", { params }),
  
  // Lấy cây danh mục (có sub-categories)
  getCategoryTree: () => axios.get("/admin/categories/tree"),
  
  // Lấy danh mục theo ID
  getById: (id) => axios.get(`/admin/categories/${id}`),
  
  // Tạo danh mục mới
  create: (data) => axios.post("/admin/categories", data),
  
  // Cập nhật danh mục
  update: (id, data) => axios.put(`/admin/categories/${id}`, data),
  
  // Xóa danh mục
  delete: (id) => axios.delete(`/admin/categories/${id}`),
  
  // Lấy tất cả danh mục con
  getAllSubCategories: () => axios.get("/admin/categories/sub-categories"),
};

export default categoryService; 