import React, { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import "../App.css";

const menu = [
  { label: "Dashboard", path: "/admin" },
  { label: "Sản phẩm", path: "/admin/products" },
  { label: "Danh mục", path: "/admin/categories" },
  { label: "Đơn hàng", path: "/admin/orders" },
  { label: "🚨 Yêu cầu hủy", path: "/admin/cancellation-requests" },
  { label: "Đánh giá", path: "/admin/reviews" },
  { label: "Voucher", path: "/admin/vouchers" },
  { label: "Người dùng", path: "/admin/users" },
];

// Layout tổng thể cho admin: sidebar, header, main content
export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 767);
      if (window.innerWidth > 767) {
        setIsMobileMenuOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="admin-layout">
      <aside className={`admin-sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="admin-logo" onClick={() => navigate("/admin")}>
          HOASHOP ADMIN
        </div>
        <nav>
          <ul className="admin-menu">
            {menu.map((item) => (
              <li key={item.path} className="admin-menu-item">
                <Link 
                  to={item.path}
                  className={location.pathname === item.path ? 'active' : ''}
                  onClick={handleLinkClick}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      
      <main className="admin-content">
        <header className="admin-header">
          {isMobile && (
            <button 
              className="mobile-menu-btn"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle menu"
            >
              ☰
            </button>
          )}
          <span>Xin chào, Admin</span>
          <button 
            className="admin-logout" 
            onClick={() => { 
              localStorage.removeItem("admin_token"); 
              navigate("/admin/login"); 
            }}
          >
            Đăng xuất
          </button>
        </header>
        <div className="admin-main">
          <Outlet />
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isMobile && isMobileMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
} 