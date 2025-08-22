import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, InputBase, Badge, Container } from '@mui/material';
import { Search as SearchIcon, ShoppingCart as CartIcon } from '@mui/icons-material';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PersonOutline from '@mui/icons-material/PersonOutline';
import PaymentIcon from '@mui/icons-material/Payment';
import { Facebook, Twitter, Instagram } from '@mui/icons-material';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import CategoryMenu from './CategoryMenu';
import styles from './Header.module.scss';

const Header = ({ isScrolled }) => {
  const [openAccount, setOpenAccount] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 60, right: 20 });
  const accountRef = useRef(null);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Handle account button click
  const handleAccountClick = () => {
    // Calculate dropdown position based on button position
    if (accountRef.current) {
      const rect = accountRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 5, // 5px below button
        right: window.innerWidth - rect.right // Align right edge with button
      });
    }
    setOpenAccount(v => !v);
  };

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClick = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setOpenAccount(false);
      }
    };
    if (openAccount) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openAccount]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCartClick = () => {
    navigate('/cart');
  };



  const handleLogout = async () => {
    await logout();
    setOpenAccount(false);
    navigate('/');
  };

  // Clean functional dropdown
  const dropdownContent = openAccount && (
    <div
      style={{
        position: 'fixed',
        top: `${dropdownPosition.top}px`,
        right: `${dropdownPosition.right}px`,
        background: 'white',
        border: '1px solid #ddd',
        borderRadius: '8px',
        zIndex: 999999,
        width: '220px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        pointerEvents: 'auto'
      }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {isAuthenticated ? (
        <div>
          <Link 
            to="/profile"
            onClick={() => setOpenAccount(false)}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              borderBottom: '1px solid #f0f0f0',
              display: 'block',
              textDecoration: 'none',
              color: '#333',
              whiteSpace: 'nowrap'
            }}
          >
            👤 Thông tin cá nhân
          </Link>
          <Link 
            to="/orders"
            onClick={() => setOpenAccount(false)}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              borderBottom: '1px solid #f0f0f0',
              display: 'block',
              textDecoration: 'none',
              color: '#333',
              whiteSpace: 'nowrap'
            }}
          >
            📦 Đơn hàng của tôi
          </Link>
          <div 
            onClick={() => {
              setOpenAccount(false);
              handleLogout();
            }}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              color: '#e91e63',
              whiteSpace: 'nowrap'
            }}
          >
            🚪 Đăng xuất
          </div>
        </div>
      ) : (
        <div>
          <Link 
            to="/register"
            onClick={() => setOpenAccount(false)}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer', 
              borderBottom: '1px solid #f0f0f0',
              display: 'block',
              textDecoration: 'none',
              color: '#333',
              whiteSpace: 'nowrap'
            }}
          >
            📝 Đăng ký
          </Link>
          <Link 
            to="/login"
            onClick={() => setOpenAccount(false)}
            style={{ 
              padding: '12px 16px', 
              cursor: 'pointer',
              display: 'block',
              textDecoration: 'none',
              color: '#333',
              whiteSpace: 'nowrap'
            }}
          >
            🔑 Đăng nhập
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <>
      <Box className={`${styles.headerWrap} ${isScrolled ? styles.scrolled : ''}`}>
        {/* TOP BAR - Dòng 1 */}
        <Box className={`${styles.topBar} ${isScrolled ? styles.hidden : ''}`}>
          <Container className={styles.container}>
            <Typography className={styles.hotline}>
              HOTLINE: 1900 633 045 | 0865 160 360
            </Typography>
            <Box className={styles.accountBarTop}>
              <Box ref={accountRef} className={styles.accountWrapper}>
                <Box 
                  className={styles.accountBtnTop} 
                  onClick={handleAccountClick}
                  data-text={isAuthenticated ? `Chào ${user?.hoTen || user?.ten || 'Bạn'}` : 'Tài khoản'}
                  sx={{ cursor: 'pointer' }}
                >
                  <PersonOutline fontSize="small" />
                  <span className={styles.accountTextTop}>
                    {isAuthenticated ? `Chào ${user?.hoTen || user?.ten || 'Bạn'}` : 'Tài khoản'}
                  </span>
                </Box>
              </Box>
              
              <Box className={styles.cartBtnTop} onClick={handleCartClick}>
                <ShoppingBagIcon fontSize="small" />
                <span className={styles.accountTextTop}>Giỏ hàng</span>
              </Box>
              
              <Box className={styles.paymentBtnTop} onClick={() => navigate('/orders')}>
                <PaymentIcon fontSize="small" />
                <span className={styles.accountTextTop}>Thanh toán</span>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* MAIN BAR - Dòng 2 */}
        <Box className={`${styles.midBar} ${isScrolled ? styles.hidden : ''}`}>
          <Container className={styles.container} style={{ position: 'relative' }}>
            {/* Social Icons - Left */}
            <Box className={styles.socialsMid}>
              <IconButton 
                href="https://facebook.com" 
                target="_blank" 
                size="small"
                className={styles.socialIcon}
              >
                <Facebook fontSize="small" />
              </IconButton>
              <IconButton 
                href="https://twitter.com" 
                target="_blank" 
                size="small"
                className={styles.socialIcon}
              >
                <Twitter fontSize="small" />
              </IconButton>
              <IconButton 
                href="https://instagram.com" 
                target="_blank" 
                size="small"
                className={styles.socialIcon}
              >
                <Instagram fontSize="small" />
              </IconButton>
            </Box>

            {/* Logo - Center */}
            <Box className={styles.logoWrapMid}>
              <Link to="/" className={styles.logoLink}>
                <img 
                  src="/images/logo.png" 
                  alt="FlowerCorner"
                  className={styles.logoImg}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'block';
                  }}
                />
                <Box style={{ display: 'none' }}>
                  <Typography className={styles.logoText}>
                    🌸 FLOWERCORNER
                  </Typography>
                  <Typography className={styles.logoSlogan}>
                    Say it with flowers
                  </Typography>
                </Box>
              </Link>
            </Box>

            {/* Search + Cart - Right */}
            <Box className={styles.rightBar}>
              <Box className={styles.searchCartWrap}>
                {/* Search */}
                <Box className={styles.searchWrap}>
                  <form onSubmit={handleSearch} className={styles.searchForm}>
                    <InputBase
                      placeholder="Tìm kiếm sản phẩm..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={styles.searchInput}
                    />
                    <IconButton type="submit" size="small" className={styles.searchBtn}>
                      <SearchIcon fontSize="small" />
                    </IconButton>
                  </form>
                </Box>

                {/* Cart */}
                <IconButton 
                  className={styles.cartBtn} 
                  onClick={handleCartClick}
                >
                  <Badge badgeContent={totalItems} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* CATEGORY MENU - Dòng 3 - STICKY khi scroll */}
        <Box className={`${styles.categoryMenuWrap} ${isScrolled ? styles.sticky : ''}`}>
          <CategoryMenu isSticky={isScrolled} />
        </Box>
      </Box>
      
      {/* Dropdown - renders at fixed position */}
      {dropdownContent}
    </>
  );
};

export default Header;