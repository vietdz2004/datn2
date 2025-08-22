import axios from "./api";

const orderService = {
  getAll: (params) => axios.get("/admin/orders", { params }),
  getById: (id) => axios.get(`/admin/orders/${id}`),
  update: (id, data) => axios.put(`/admin/orders/${id}`, data),
  
  // Cancellation request handling
  approveCancellation: (id, reason = '') => 
    axios.put(`/admin/orders/${id}/approve-cancellation`, { reason }),
  
  rejectCancellation: (id, reason = '') => 
    axios.put(`/admin/orders/${id}/reject-cancellation`, { reason }),
  
  // Get orders with cancellation requests
  getCancellationRequests: (params) => 
    axios.get("/admin/orders", { ...params, params: { ...params?.params, status: 'KHACH_YEU_CAU_HUY' } }),
};

export default orderService; 