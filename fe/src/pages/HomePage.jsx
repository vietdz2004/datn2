import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.scss';
import BannerSlider from '../components/BannerSlider';
import CategoryMenu from '../components/CategoryMenu';
import HomeSection from '../components/HomeSection';
import ProductList from '../components/ProductList';
import SearchHero from '../components/SearchHero';
import { productAPI } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [discountProducts, setDiscountProducts] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [bestsellerProducts, setBestsellerProducts] = useState([]);
  const [categoryProductSections, setCategoryProductSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all data from server-side APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🔄 Fetching homepage data...');

        // Parallel API calls for optimal performance
        const [
          discountResponse, 
          popularResponse,
          newResponse,
          bestsellerResponse,
          categoryProductsResponse
        ] = await Promise.all([
          productAPI.getDiscountProducts({ limit: 8 }).catch(e => ({ data: { data: [] }, error: e })),
          productAPI.getPopularProducts({ limit: 8 }).catch(e => ({ data: { data: [] }, error: e })),
          productAPI.getNewProducts({ limit: 8 }).catch(e => ({ data: { data: [] }, error: e })),
          productAPI.getBestsellerProducts({ limit: 8 }).catch(e => ({ data: { data: [] }, error: e })),
          productAPI.getProductsByCategories({ limit: 6, shuffle: true }).catch(e => ({ data: { data: [] }, error: e }))
        ]);

        console.log('📊 API Responses loaded successfully');

        // Set data from server responses - Handle both formats
        const discountData = discountResponse.data?.data || discountResponse.data || [];
        const popularData = popularResponse.data?.data || popularResponse.data || [];
        const newData = newResponse.data?.data || newResponse.data || [];
        const bestsellerData = bestsellerResponse.data?.data || bestsellerResponse.data || [];
        const categoryProductSectionsData = categoryProductsResponse.data?.data || categoryProductsResponse.data || [];

        setDiscountProducts(discountData);
        setPopularProducts(popularData);
        setNewProducts(newData);
        setBestsellerProducts(bestsellerData);
        setCategoryProductSections(categoryProductSectionsData);

        console.log('✅ Data loaded successfully:', {
          discountCount: discountData.length,
          popularCount: popularData.length,
          newCount: newData.length,
          bestsellerCount: bestsellerData.length,
          categoryProductSectionsCount: categoryProductSectionsData.length
        });

      } catch (err) {
        console.error('❌ Error fetching data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleProductClick = (product) => {
    navigate(`/products/${product.id_SanPham}`);
  };

  const handleQuickOrder = () => {
    alert('Vui lòng gọi hotline: 0123-456-789 để đặt hàng nhanh!');
  };

  const handleViewMore = (categoryId) => {
    navigate(`/products?category=${categoryId}`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <h3>Có lỗi xảy ra</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Thử lại</button>
      </div>
    );
  }

  return (
    <div className={styles.homePage}>
      {/* Banner Slider */}
      <BannerSlider />

      {/* Search Hero Section */}
      <SearchHero />

      {/* Quick Order Button */}
      <div className={styles.quickOrderSection}>
        <button 
          className={styles.quickOrderBtn}
          onClick={handleQuickOrder}
        >
          📞 Đặt Hàng Nhanh
        </button>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        
        {/* Discount Products Section */}
        {discountProducts.length > 0 && (
          <HomeSection 
            title="🔥 Sản phẩm giảm giá" 
            subtitle="Ưu đãi hấp dẫn - Số lượng có hạn"
            onViewMore={() => navigate('/products?discount=true')}
          >
            <ProductList 
              products={discountProducts} 
              onProductClick={handleProductClick}
            />
          </HomeSection>
        )}

        {/* Popular Products Section */}
        {popularProducts.length > 0 && (
          <HomeSection 
            title="⭐ Sản phẩm phổ biến" 
            subtitle="Được khách hàng yêu thích nhất"
            onViewMore={() => navigate('/products?popular=true')}
          >
            <ProductList 
              products={popularProducts} 
              onProductClick={handleProductClick}
            />
          </HomeSection>
        )}

        {/* New Products Section */}
        {newProducts.length > 0 && (
          <HomeSection 
            title="🆕 Sản phẩm mới" 
            subtitle="Bộ sưu tập mới nhất"
            onViewMore={() => navigate('/products?new=true')}
          >
            <ProductList 
              products={newProducts} 
              onProductClick={handleProductClick}
            />
          </HomeSection>
        )}

        {/* Bestseller Products Section */}
        {bestsellerProducts.length > 0 && (
          <HomeSection 
            title="🏆 Sản phẩm bán chạy" 
            subtitle="Top sản phẩm được mua nhiều nhất"
            onViewMore={() => navigate('/products?bestseller=true')}
          >
            <ProductList 
              products={bestsellerProducts} 
              onProductClick={handleProductClick}
            />
          </HomeSection>
        )}

        {/* Category Sections - Mỗi danh mục là 1 section riêng */}
        {categoryProductSections.map((categorySection) => (
          <HomeSection 
            key={categorySection.categoryId}
            title={`🌺 ${categorySection.categoryName}`} 
            subtitle={`${categorySection.products.length} sản phẩm chọn lọc`}
            onViewMore={() => handleViewMore(categorySection.categoryId)}
          >
            <ProductList 
              products={categorySection.products} 
              onProductClick={handleProductClick}
            />
          </HomeSection>
        ))}

        {/* Show message if no products */}
        {discountProducts.length === 0 && 
         popularProducts.length === 0 && 
         newProducts.length === 0 && 
         bestsellerProducts.length === 0 && 
         categoryProductSections.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3>Không có sản phẩm nào</h3>
            <p>Vui lòng kiểm tra lại kết nối API hoặc database</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage; 