import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Chip,
  InputAdornment,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Search,
  TrendingUp,
  History,
  LocalFlorist
} from '@mui/icons-material';
import { productAPI } from '../services/api';
import styles from './SearchHero.module.scss';

// SearchHero: Component search lớn và đẹp cho trang chủ
const SearchHero = () => {
  // STATE MANAGEMENT - Quản lý trạng thái search
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  // REFS - Để quản lý dropdown và focus
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);
  const navigate = useNavigate();

  // POPULAR SEARCH TERMS - Từ khóa tìm kiếm phổ biến
  const popularSearches = [
    'Hoa hồng đỏ',
    'Hoa cưới',
    'Hoa sinh nhật', 
    'Hoa valentine',
    'Hoa tulip',
    'Hoa cúc',
    'Bó hoa tình yêu',
    'Hoa khai trương'
  ];

  // LOAD RECENT SEARCHES - Tải searches gần đây từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.warn('Error loading recent searches:', e);
      }
    }
  }, []);

  // CLOSE SUGGESTIONS - Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchRef.current && 
        !searchRef.current.contains(event.target) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // FETCH SUGGESTIONS - Lấy gợi ý từ API
  const fetchSuggestions = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      // Gọi API search với limit nhỏ để lấy suggestions
      const response = await productAPI.search(searchQuery, {
        limit: 5
      });
      
      const products = response.data?.data || response.data || [];
      setSuggestions(products);
      
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // HANDLE INPUT CHANGE - Xử lý thay đổi input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Debounce API calls
    if (fetchSuggestions.timeoutId) {
      clearTimeout(fetchSuggestions.timeoutId);
    }
    
    fetchSuggestions.timeoutId = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // HANDLE FOCUS - Hiển thị dropdown khi focus
  const handleFocus = () => {
    setShowSuggestions(true);
    if (query.length >= 2) {
      fetchSuggestions(query);
    }
  };

  // SAVE SEARCH - Lưu search vào recent searches
  const saveSearch = (searchTerm) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    const updated = [
      trimmed,
      ...recentSearches.filter(item => item !== trimmed)
    ].slice(0, 5); // Giữ tối đa 5 searches

    setRecentSearches(updated);
    localStorage.setItem('recentSearches', JSON.stringify(updated));
  };

  // HANDLE SEARCH SUBMIT - Xử lý submit search
  const handleSearch = (searchTerm = query) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    saveSearch(trimmed);
    setShowSuggestions(false);
    setQuery('');
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  };

  // HANDLE SUGGESTION CLICK - Click vào suggestion
  const handleSuggestionClick = (product) => {
    saveSearch(product.tenSp);
    setShowSuggestions(false);
    setQuery('');
    navigate(`/products/${product.id_SanPham}`);
  };

  // HANDLE CHIP CLICK - Click vào popular/recent search
  const handleChipClick = (searchTerm) => {
    setQuery(searchTerm);
    handleSearch(searchTerm);
  };

  // HANDLE KEY DOWN - Xử lý phím tắt
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  function highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <b key={i} style={{color:'#e91e63'}}>{part}</b> : part
    );
  }

  return (
    <Box className={styles.searchHeroWrap}>
      <Box className={styles.searchHeroContainer}>
        {/* TITLE */}
        <Typography variant="h4" className={styles.searchTitle}>
          <LocalFlorist className={styles.titleIcon} />
          Tìm kiếm hoa yêu thích
        </Typography>
        <Typography variant="body1" className={styles.searchSubtitle}>
          Khám phá hàng ngàn loài hoa đẹp cho mọi dịp đặc biệt
        </Typography>

        {/* SEARCH BOX */}
        <Box className={styles.searchBoxWrap} ref={searchRef}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm hoa hồng, hoa cưới, hoa sinh nhật..."
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            className={styles.searchInput}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className={styles.searchIcon} />
                </InputAdornment>
              ),
              endAdornment: loading && (
                <InputAdornment position="end">
                  <CircularProgress size={20} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
          />

          {/* SEARCH SUGGESTIONS DROPDOWN */}
          {showSuggestions && (
            <Paper className={styles.suggestionsDropdown} ref={suggestionsRef}>
              
              {/* PRODUCT SUGGESTIONS */}
              {suggestions.length > 0 && (
                <Box className={styles.suggestionSection}>
                  <Typography variant="subtitle2" className={styles.sectionTitle}>
                    <Search fontSize="small" /> Sản phẩm
                  </Typography>
                  <List dense>
                    {suggestions.map((product) => (
                      <ListItem
                        key={product.id_SanPham}
                        button
                        onClick={() => handleSuggestionClick(product)}
                        className={styles.suggestionItem}
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={`http://localhost:5002/images/products/${product.hinhAnh}`}
                            variant="rounded"
                            sx={{ width: 40, height: 40 }}
                          >
                            <LocalFlorist />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={highlightKeyword(product.tenSp, query)}
                          secondary={product.gia ? `${Number(product.gia).toLocaleString('vi-VN')}₫` : ''}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {/* RECENT SEARCHES */}
              {recentSearches.length > 0 && query.length < 2 && (
                <Box className={styles.suggestionSection}>
                  <Typography variant="subtitle2" className={styles.sectionTitle}>
                    <History fontSize="small" /> Tìm kiếm gần đây
                  </Typography>
                  <Box className={styles.chipContainer}>
                    {recentSearches.map((term, index) => (
                      <Chip
                        key={index}
                        label={term}
                        onClick={() => handleChipClick(term)}
                        className={styles.searchChip}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* POPULAR SEARCHES */}
              {query.length < 2 && (
                <Box className={styles.suggestionSection}>
                  <Typography variant="subtitle2" className={styles.sectionTitle}>
                    <TrendingUp fontSize="small" /> Tìm kiếm phổ biến
                  </Typography>
                  <Box className={styles.chipContainer}>
                    {popularSearches.slice(0, 6).map((term, index) => (
                      <Chip
                        key={index}
                        label={term}
                        onClick={() => handleChipClick(term)}
                        className={styles.searchChip}
                        variant="outlined"
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* NO RESULTS */}
              {query.length >= 2 && suggestions.length === 0 && !loading && (
                <Box className={styles.noResults}>
                  <Typography variant="body2" color="text.secondary">
                    Không tìm thấy sản phẩm cho "{query}"
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Thử tìm kiếm với từ khóa khác
                  </Typography>
                </Box>
              )}
            </Paper>
          )}
        </Box>

        {/* QUICK ACTIONS */}
        <Box className={styles.quickActions}>
          <Typography variant="body2" className={styles.quickActionsLabel}>
            Tìm kiếm nhanh:
          </Typography>
          {popularSearches.slice(0, 4).map((term, index) => (
            <Chip
              key={index}
              label={term}
              onClick={() => handleChipClick(term)}
              className={styles.quickActionChip}
              size="small"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default SearchHero; 