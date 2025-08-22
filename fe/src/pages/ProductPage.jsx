import React, { useEffect, useState, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Pagination, 
  Card, 
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  GridView as GridIcon,
  ViewList as ListIcon,
  TuneOutlined as FilterIcon
} from '@mui/icons-material';
import ProductList from '../components/ProductList';
import { productAPI, categoriesAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './ProductPage.module.scss';

// ============================================
// PRODUCT PAGE - Trang danh sách sản phẩm
// ============================================
const ProductPage = () => {
  // ============================================
  // STATE MANAGEMENT - Quản lý state
  // ============================================
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageTitle, setPageTitle] = useState('Danh Sách Sản Phẩm');
  
  // Thông tin phân trang từ server
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12
  });
  
  // Bộ lọc sẽ gửi lên server
  const [filters, setFilters] = useState({
    sortBy: 'default',
    itemsPerPage: 12,
    priceRange: 'all'
  });
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ============================================
  // HELPER FUNCTIONS - Hàm tiện ích
  // ============================================

  // Xây dựng params API dựa trên filters và URL params
  const buildAPIParams = useCallback(() => {
    const apiParams = {
      page: 1, // Always start from page 1 for new search/filter
      limit: filters.itemsPerPage
    };

    // Xử lý SEARCH QUERY từ URL - QUAN TRỌNG!
    const searchQuery = searchParams.get('search');
    if (searchQuery) {
      apiParams.q = searchQuery; // API search yêu cầu param 'q'
      return { apiParams, urlFilters: { search: searchQuery }, searchQuery };
    }

    // Xử lý các filter đặc biệt từ URL (từ nút "Xem thêm")
    const urlFilters = {
      category: searchParams.get('category'),
      discount: searchParams.get('discount'),
      popular: searchParams.get('popular'),
      new: searchParams.get('new'),
      bestseller: searchParams.get('bestseller')
    };

    // Cập nhật tiêu đề trang dựa trên URL params
    const subcatId = searchParams.get('subcategory');
    if (subcatId) {
      apiParams.subcat = subcatId;
    } else if (urlFilters.category) {
      apiParams.category = urlFilters.category;
    }

    // Áp dụng filters từ form - CHỈ CÒN PRICE RANGE
    if (filters.priceRange !== 'all') {
      apiParams.priceRange = filters.priceRange;
    }

    // Áp dụng URL params CÓ PRIORITY CAO NHẤT (sau dropdown filters)
    if (urlFilters.category) {
      apiParams.category = urlFilters.category;
    }

    // Áp dụng sắp xếp
    if (filters.sortBy !== 'default') {
      const sortMap = {
        'name-asc': { sortBy: 'name', sortOrder: 'ASC' },
        'name-desc': { sortBy: 'name', sortOrder: 'DESC' },
        'price-asc': { sortBy: 'price', sortOrder: 'ASC' },
        'price-desc': { sortBy: 'price', sortOrder: 'DESC' }
      };
      
      const sortConfig = sortMap[filters.sortBy];
      if (sortConfig) {
        Object.assign(apiParams, sortConfig);
      }
    }

    return { apiParams, urlFilters, searchQuery: null };
  }, [filters, searchParams, categories]);

  // Chọn API endpoint phù hợp dựa trên loại filter
  const callAppropriateAPI = useCallback(async (apiParams, urlFilters, searchQuery) => {
    // QUAN TRỌNG: Nếu có search query, gọi API search
    if (searchQuery) {
      return await productAPI.search(searchQuery, apiParams);
    }
    
    // Ngược lại, gọi các API khác như trước
    if (urlFilters.discount === 'true') {
      return await productAPI.getDiscountProducts(apiParams);
    } else if (urlFilters.popular === 'true') {
      return await productAPI.getPopularProducts(apiParams);
    } else if (urlFilters.new === 'true') {
      return await productAPI.getNewProducts(apiParams);
    } else if (urlFilters.bestseller === 'true') {
      return await productAPI.getBestsellerProducts(apiParams);
    } else {
      return await productAPI.getAll(apiParams);
    }
  }, []);

  // ============================================
  // DATA FETCHING - Tải dữ liệu
  // ============================================

  // Tải danh sách sản phẩm với server-side filtering
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      
      const { apiParams, urlFilters, searchQuery } = buildAPIParams();
      
      const response = await callAppropriateAPI(apiParams, urlFilters, searchQuery);
      
      if (response.data.success || response.data.data) {
        const productsData = response.data.data || response.data || [];
        setProducts(productsData);
        
        // Use pagination from API response for all cases
        const apiPagination = response.data.pagination || {};
        
        const newPagination = {
          currentPage: apiPagination.page || apiPagination.currentPage || 1,
          totalPages: apiPagination.totalPages || 1,
          totalItems: apiPagination.total || productsData.length,
          itemsPerPage: apiPagination.limit || filters.itemsPerPage
        };
        
        console.log('📄 Setting pagination to:', newPagination);
        setPagination(newPagination);
      } else {
        throw new Error('API response không thành công');
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Lỗi tải sản phẩm:', err);
      setError('Không thể tải dữ liệu sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildAPIParams, callAppropriateAPI, filters.itemsPerPage]);

  // Function to fetch products with specific page
  const fetchProductsWithPage = useCallback(async (page) => {
    try {
      setLoading(true);
      
      const { apiParams, urlFilters, searchQuery } = buildAPIParams();
      apiParams.page = page; // Override page parameter
      
      console.log('📡 Fetching page:', page, 'with params:', apiParams);
      
      const response = await callAppropriateAPI(apiParams, urlFilters, searchQuery);
      
      if (response.data.success || response.data.data) {
        const productsData = response.data.data || response.data || [];
        setProducts(productsData);
        
        // Use pagination from API response
        const apiPagination = response.data.pagination || {};
        
        const newPagination = {
          currentPage: apiPagination.page || page,
          totalPages: apiPagination.totalPages || 1,
          totalItems: apiPagination.total || productsData.length,
          itemsPerPage: apiPagination.limit || filters.itemsPerPage
        };
        
        console.log('📄 Updated pagination to:', newPagination);
        setPagination(newPagination);
      } else {
        throw new Error('API response không thành công');
      }
      
      setError(null);
    } catch (err) {
      console.error('❌ Lỗi tải sản phẩm trang', page, ':', err);
      setError('Không thể tải dữ liệu sản phẩm');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [buildAPIParams, callAppropriateAPI, filters.itemsPerPage]);

  // Tải danh sách danh mục CÓ SUBCATEGORIES
  const fetchCategories = useCallback(async () => {
    try {
      const response = await categoriesAPI.getWithSubcategories();
      
      const categoriesData = response.data?.data || [];
      setCategories(categoriesData);
    } catch (error) {
      console.error('❌ Lỗi tải danh mục:', error);
      setCategories([]);
    }
  }, []);

  function highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <b key={i} style={{color:'#e91e63'}}>{part}</b> : part
    );
  }

  // ============================================
  // EFFECTS - Xử lý side effects
  // ============================================
  
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Watch for currentPage changes
  useEffect(() => {
    console.log('📊 Current page changed to:', pagination.currentPage);
  }, [pagination.currentPage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Effect to update page title based on URL params
  useEffect(() => {
    const { urlFilters, searchQuery } = buildAPIParams();
    const subcatId = searchParams.get('subcategory');
    const catId = searchParams.get('category');

    if (searchQuery) {
      setPageTitle(`🔍 Kết quả tìm kiếm: "${searchQuery}"`);
    } else if (subcatId) {
      let foundSubcat = null;
      for (const cat of categories) {
        if (cat.SubCategories && Array.isArray(cat.SubCategories)) {
          const sub = cat.SubCategories.find(s => s.id_DanhMucChiTiet?.toString() === subcatId);
          if (sub) {
            foundSubcat = sub;
            break;
          }
        }
      }
      if (foundSubcat) {
        setPageTitle(foundSubcat.tenDanhMucChiTiet);
      } else {
        setPageTitle('Sản phẩm theo danh mục con');
      }
    } else if (catId || urlFilters.category) {
      const cat = categories.find(c => c.id_DanhMuc.toString() === (catId || urlFilters.category));
      setPageTitle(cat ? `${cat.tenDanhMuc}` : 'Sản phẩm theo danh mục');
    } else {
      setPageTitle('Danh Sách Sản Phẩm');
    }
  }, [buildAPIParams, categories, searchParams]);


  // ============================================
  // EVENT HANDLERS - Xử lý sự kiện
  // ============================================

  const handleViewDetail = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  const handlePageChange = (event, page) => {
    console.log('🔄 Changing to page:', page);
    fetchProductsWithPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Các handler cập nhật filter và reset về trang đầu
  const handleSortChange = (newSort) => {
    setFilters(prev => ({ ...prev, sortBy: newSort }));
  };

  const handlePriceRangeChange = (newPriceRange) => {
    setFilters(prev => ({ ...prev, priceRange: newPriceRange }));
  };

  const handleItemsPerPageChange = (newItemsPerPage) => {
    setFilters(prev => ({ ...prev, itemsPerPage: newItemsPerPage }));
  };

  // ============================================
  // RENDER - Hiển thị giao diện
  // ============================================

  // Loading state
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>Đang tải sản phẩm...</Typography>
      </Container>
    );
  }

  // Error state
  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  const searchKeyword = searchParams.get('search') || '';

  return (
    <Container maxWidth="lg" className={styles.container}>
      {/* Header - Tiêu đề trang */}
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title}>
          {pageTitle}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tìm thấy {pagination.totalItems} sản phẩm
        </Typography>
      </Box>

      {/* Filters - Bộ lọc */}
      <Card className={styles.filterCard}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            {/* Sắp xếp */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Sắp xếp theo</InputLabel>
                <Select
                  value={filters.sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sắp xếp theo"
                >
                  <MenuItem value="default">Mặc định</MenuItem>
                  <MenuItem value="name-asc">Tên (A - Z)</MenuItem>
                  <MenuItem value="name-desc">Tên (Z - A)</MenuItem>
                  <MenuItem value="price-asc">Giá (Thấp &gt; Cao)</MenuItem>
                  <MenuItem value="price-desc">Giá (Cao &gt; Thấp)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Khoảng giá */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Khoảng giá</InputLabel>
                <Select
                  value={filters.priceRange}
                  onChange={(e) => handlePriceRangeChange(e.target.value)}
                  label="Khoảng giá"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="under-200k">Dưới 200k</MenuItem>
                  <MenuItem value="200k-500k">200k - 500k</MenuItem>
                  <MenuItem value="500k-1m">500k - 1M</MenuItem>
                  <MenuItem value="over-1m">Trên 1M</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Số sản phẩm mỗi trang */}
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Hiển thị</InputLabel>
                <Select
                  value={filters.itemsPerPage}
                  onChange={(e) => handleItemsPerPageChange(e.target.value)}
                  label="Hiển thị"
                >
                  <MenuItem value={8}>8 sản phẩm</MenuItem>
                  <MenuItem value={12}>12 sản phẩm</MenuItem>
                  <MenuItem value={20}>20 sản phẩm</MenuItem>
                  <MenuItem value={40}>40 sản phẩm</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Results Info - Thông tin kết quả và filter đang áp dụng */}
      <Box className={styles.resultsInfo}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FilterIcon color="action" />
          <Typography variant="body2">
            Hiển thị {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1}-{Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} 
            của {pagination.totalItems} sản phẩm
          </Typography>
        </Stack>
        
        {/* Active Filters - CHỈ HIỂN THỊ PRICE RANGE */}
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {filters.priceRange !== 'all' && (
            <Chip 
              label={`Giá: ${filters.priceRange}`}
              onDelete={() => handlePriceRangeChange('all')}
              size="small"
              color="primary"
            />
          )}
        </Stack>
      </Box>

      {/* Products List - Danh sách sản phẩm */}
      {products.length > 0 ? (
        <ProductList 
          products={products} 
          onProductClick={handleViewDetail}
          highlightKeyword={searchKeyword ? (text => highlightKeyword(text, searchKeyword)) : undefined}
        />
      ) : (
        <Box className={styles.noResults}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy sản phẩm nào
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thử thay đổi bộ lọc để xem thêm sản phẩm
          </Typography>
        </Box>
      )}

      {/* Pagination - Phân trang */}
      {pagination.totalPages > 1 && (
        <Box className={styles.pagination}>
          {console.log('🎯 Pagination state:', { 
            currentPage: pagination.currentPage, 
            totalPages: pagination.totalPages 
          })}
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>
      )}
    </Container>
  );
};

export default ProductPage; 