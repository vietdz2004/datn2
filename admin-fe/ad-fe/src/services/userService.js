import axios from "./api";

const userService = {
  getAll: (params) => axios.get("/admin/users", { params }),
  getById: (id) => axios.get(`/admin/users/${id}`),
  update: (id, data) => axios.put(`/admin/users/${id}`, data),
  delete: (id) => axios.delete(`/admin/users/${id}`),
  updateStatus: (id, status) => axios.put(`/admin/users/${id}/status`, { status }),
  changePassword: (id, data) => axios.put(`/admin/users/${id}/change-password`, data),
};

export default userService; 