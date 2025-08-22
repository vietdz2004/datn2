import axios from "./api";

const voucherService = {
  getAll: (params) => axios.get("/admin/vouchers", { params }),
  getById: (id) => axios.get(`/admin/vouchers/${id}`),
  create: (data) => axios.post("/admin/vouchers", data),
  update: (id, data) => axios.put(`/admin/vouchers/${id}`, data),
  delete: (id) => axios.delete(`/admin/vouchers/${id}`),
};

export default voucherService; 