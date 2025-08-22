import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import AdminLayout from "./layouts/AdminLayout";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProductPage from "./components/Product/AdminProductPage";
import AdminOrderList from "./pages/AdminOrderList";
import AdminCancellationRequests from "./pages/AdminCancellationRequests";
import AdminVoucherList from "./pages/AdminVoucherList";
import AdminUserList from "./pages/AdminUserList";
// Removed legacy reports pages; dashboard now contains analytics
import AdminCategoryPage from "./pages/AdminCategoryPage";
import AdminReviewList from "./pages/AdminReviewList";

function RequireAdminAuth() {
  const token = localStorage.getItem("admin_token");
  return token ? <Outlet /> : <Navigate to="/admin/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route element={<RequireAdminAuth />}> {/* Bảo vệ các route admin */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProductPage />} />
            <Route path="categories" element={<AdminCategoryPage />} />
            <Route path="orders" element={<AdminOrderList />} />
            <Route path="cancellation-requests" element={<AdminCancellationRequests />} />
            <Route path="vouchers" element={<AdminVoucherList />} />
            <Route path="users" element={<AdminUserList />} />
            {/** reports route removed; analytics integrated into dashboard */}
            <Route path="/admin/reviews" element={<AdminReviewList />} />
          </Route>
        </Route>
        <Route path="/" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
