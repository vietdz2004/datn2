import React, { useEffect, useState } from 'react';
import api from '../services/api';
import ProductList from '../components/ProductList';
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

// CategoryPage: Trang danh mục sản phẩm
const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories with subcategories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const res = await api.get('/categories');
        console.log('Categories response:', res.data);
        
        const categoriesData = res.data?.data || [];
        setCategories(categoriesData);
        console.log('Categories set:', categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Update subcategories when parent category changes
  useEffect(() => {
    if (selectedCat) {
      const selectedCategory = categories.find(c => c.id_DanhMuc.toString() === selectedCat.toString());
      console.log('Selected category:', selectedCategory);
      
      if (selectedCategory && selectedCategory.SubCategories) {
        setSubCategories(selectedCategory.SubCategories);
        console.log('SubCategories set:', selectedCategory.SubCategories);
      } else {
        setSubCategories([]);
      }
      setSelectedSub(''); // Reset subcategory when parent changes
    } else {
      setSubCategories([]);
      setSelectedSub('');
    }
  }, [selectedCat, categories]);

  // Fetch products based on selected filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let apiUrl = '/products';
        let params = {};
        
        // Priority: subcategory > category
        if (selectedSub) {
          params.subcat = selectedSub;
          console.log('Filtering by subcategory:', selectedSub);
        } else if (selectedCat) {
          params.category = selectedCat;
          console.log('Filtering by category:', selectedCat);
        }
        
        console.log('API call:', apiUrl, 'with params:', params);
        
        const res = await api.get(apiUrl, { params });
        console.log('Products response:', res.data);
        
        const productsData = res.data?.data || [];
        setProducts(productsData);
        console.log('Products set:', productsData.length, 'items');
        
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [selectedCat, selectedSub]);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    console.log('Category changed to:', value);
    setSelectedCat(value);
  };

  const handleSubCategoryChange = (event) => {
    const value = event.target.value;
    console.log('Subcategory changed to:', value);
    setSelectedSub(value);
  };

  return (
    <Box mt={4} sx={{ width: '100vw' }}>
      <Typography variant="h4" color="secondary" fontWeight={700} mb={3}>
        Danh mục sản phẩm
      </Typography>
      
      <Box display="flex" gap={3} mb={4} flexWrap="wrap">
        <FormControl sx={{ minWidth: 220 }} size="small">
          <InputLabel>Danh mục cha</InputLabel>
          <Select
            value={selectedCat}
            label="Danh mục cha"
            onChange={handleCategoryChange}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {categories.map(cat => (
              <MenuItem value={cat.id_DanhMuc} key={cat.id_DanhMuc}>
                {cat.tenDanhMuc}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 220 }} size="small" disabled={!selectedCat}>
          <InputLabel>Danh mục con</InputLabel>
          <Select
            value={selectedSub}
            label="Danh mục con"
            onChange={handleSubCategoryChange}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {subCategories.map(sub => (
              <MenuItem value={sub.id_DanhMucChiTiet} key={sub.id_DanhMucChiTiet}>
                {sub.tenDanhMucChiTiet}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      
      {loading ? (
        <Typography align="center" color="secondary">
          Đang tải sản phẩm...
        </Typography>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Tìm thấy {products.length} sản phẩm
          </Typography>
          <ProductList 
            products={products} 
            onViewDetail={p => window.location.href = `/products/${p.id_SanPham}`} 
          />
        </>
      )}
    </Box>
  );
};

export default CategoryPage; 