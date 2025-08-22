import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import styles from './CategoryMenu.module.scss';

const CategoryMenu = ({ isSticky = false }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false); // mobile menu
  const [openSub, setOpenSub] = useState(null); // subMenu accordion
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Đóng menu khi click ra ngoài (mobile)
  useEffect(() => {
    const handleClick = (e) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
        setOpenSub(null);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('📡 Fetching categories for menu...');
        
        const response = await categoriesAPI.getAll();
        console.log('📊 Categories API response:', response.data);
        
        const categoriesData = response.data?.data || response.data || [];
        
        console.log('📋 Categories data:', categoriesData);
        setCategories(categoriesData);
        
        if (categoriesData.length === 0) {
          console.warn('⚠️ No categories found');
        }
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        setError(error.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCatClick = (cat) => {
    // Nếu có sub, mobile thì xổ, PC thì chuyển trang
    if (window.innerWidth <= 768 && cat.SubCategories && cat.SubCategories.length > 0) {
      setOpenSub(openSub === cat.id_DanhMuc ? null : cat.id_DanhMuc);
    } else {
      navigate(`/products?category=${cat.id_DanhMuc}`);
      setOpen(false); setOpenSub(null);
    }
  };
  const handleSubClick = (sub) => {
    navigate(`/products?subcategory=${sub.id_DanhMucChiTiet}`);
    setOpen(false); setOpenSub(null);
  };

  // ✅ Hiển thị loading state
  if (loading) {
    console.log('🔄 CategoryMenu: Loading state');
    return (
      <nav className={`${styles.menuWrap} ${styles.loading}`}>
        <div className={styles.menuContainer}>
          <div className={styles.loadingText}>Đang tải danh mục...</div>
        </div>
      </nav>
    );
  }

  // ✅ Hiển thị error state  
  if (error) {
    return (
      <nav className={styles.menuWrap}>
        <div className={styles.menuContainer}>
          <div className={styles.errorText}>Lỗi tải danh mục: {error}</div>
        </div>
      </nav>
    );
  }

  // ✅ Hiển thị empty state
  if (categories.length === 0) {
    return (
      <nav className={styles.menuWrap}>
        <div className={styles.menuContainer}>
          <div className={styles.emptyText}>Không có danh mục nào</div>
        </div>
      </nav>
    );
  }

  // Hamburger icon SVG
  const Hamburger = (
    <button
      className={styles.hamburgerBtn}
      onClick={() => setOpen((v) => !v)}
      aria-label="Mở menu"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect y="4" width="24" height="3" rx="1.5" fill="#e91e63"/>
        <rect y="10.5" width="24" height="3" rx="1.5" fill="#e91e63"/>
        <rect y="17" width="24" height="3" rx="1.5" fill="#e91e63"/>
      </svg>
    </button>
  );

  // Mũi tên xổ xuống
  const ArrowIcon = ({ open }) => (
    <span style={{ 
      display: 'inline-block', 
      transition: 'transform 0.2s ease', 
      transform: open ? 'rotate(90deg)' : 'rotate(0deg)',
      marginLeft: 8 
    }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z" fill="#e91e63"/>
      </svg>
    </span>
  );

  return (
    <nav className={`${styles.menuWrap} ${isSticky ? styles.compact : ''}`}>
      {/* Hamburger chỉ hiện trên mobile */}
      <div className={styles.hamburgerOnly}>{Hamburger}</div>
      
      {/* Overlay tối khi mở menu mobile */}
      {open && (
        <div 
          className={styles.menuOverlay} 
          onClick={() => {setOpen(false); setOpenSub(null);}}
        />
      )}
      
      {/* Mobile Menu Panel */}
      <div
        className={`${styles.menuMobilePanel} ${open ? styles.menuMobilePanelOpen : ''}`}
        ref={menuRef}
      >
        {/* Header mobile: logo nhỏ + nút đóng */}
        <div className={styles.menuMobileHeader}>
          <span className={styles.menuMobileTitle}>🌸 DANH MỤC</span>
          <button className={styles.closeBtn} onClick={() => {setOpen(false); setOpenSub(null);}} aria-label="Đóng menu">✕</button>
        </div>
        <ul className={styles.menuMobileList}>
          {categories.map((cat) => (
            <li className={styles.menuMobileItem} key={cat.id_DanhMuc}>
              <div
                className={styles.menuMobileBtn}
                onClick={() => handleCatClick(cat)}
              >
                {cat.tenDanhMuc}
                {cat.SubCategories && cat.SubCategories.length > 0 && <ArrowIcon open={openSub === cat.id_DanhMuc} />}
              </div>
              {/* SubMenu xổ dọc */}
              {cat.SubCategories && cat.SubCategories.length > 0 && (
                <ul className={styles.menuMobileSub + ' ' + (openSub === cat.id_DanhMuc ? styles.menuMobileSubOpen : '')}>
                  {cat.SubCategories.map((sub) => (
                    <li
                      className={styles.menuMobileSubItem}
                      key={sub.id_DanhMucChiTiet}
                      onClick={() => handleSubClick(sub)}
                    >
                      {sub.tenDanhMucChiTiet}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
      
      {/* PC/tablet giữ nguyên menuList */}
      <div className={styles.menuContainer}>
        <ul className={styles.menuList}>
          {categories.map((cat) => (
            <li className={styles.menuItem} key={cat.id_DanhMuc}>
              <span
                className={styles.menuBtn}
                onClick={() => handleCatClick(cat)}
              >
                {cat.tenDanhMuc}
              </span>
              {cat.SubCategories && cat.SubCategories.length > 0 && (
                <ul className={styles.subMenu}>
                  {cat.SubCategories.map((sub) => (
                    <li
                      className={styles.subMenuItem}
                      key={sub.id_DanhMucChiTiet}
                      onClick={() => handleSubClick(sub)}
                    >
                      {sub.tenDanhMucChiTiet}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default CategoryMenu; 