import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5002/api",
});

// Thêm token admin nếu có
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('🔍 API Request:', config.method?.toUpperCase(), config.url, config.params);
  return config;
});

// Response interceptor để debug
instance.interceptors.response.use(
  (response) => {
    console.log('✅ API Success:', response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.config?.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default instance; 