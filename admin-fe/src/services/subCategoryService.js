import axios from "./api";

const subCategoryService = {
  // Lấy tất cả danh mục con (sử dụng endpoint categories tree)
  getAll: (params = {}) => axios.get("/admin/categories/tree", { params }),
  
  // Lấy danh mục con theo danh mục cha
  getByParentId: (parentId) => axios.get(`/admin/categories/${parentId}/subcategories`),
  
  // Tạo danh mục con mới
  create: (data) => {
    const { id_DanhMuc, ...subcategoryData } = data;
    return axios.post(`/admin/categories/${id_DanhMuc}/subcategories`, subcategoryData);
  },
  
  // Cập nhật danh mục con
  update: (id, data) => axios.put(`/admin/categories/subcategories/${id}`, data),
  
  // Xóa danh mục con
  delete: (id) => axios.delete(`/admin/categories/subcategories/${id}`),
  
  // Xóa nhiều danh mục con cùng lúc
  bulkDelete: (ids) => axios.post("/admin/categories/subcategories/bulk/delete", { ids }),
};

export default subCategoryService; 