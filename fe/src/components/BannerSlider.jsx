import React, { useState, useEffect } from 'react';
import styles from './BannerSlider.module.scss';

const banners = [
  { src: '/images/banners/banner1.webp', alt: 'Banner 1' },
  { src: '/images/banners/banner2.webp', alt: 'Banner 2' },
  { src: '/images/banners/banner3.webp', alt: 'Banner 3' },
];

const BannerSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === banners.length - 1 ? 0 : prevIndex + 1));
  };
  
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  
  // Tự động chuyển slide (tùy chọn, có thể bỏ)
  useEffect(() => {
    const timer = setTimeout(handleNext, 5000); // 5 giây
    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className={styles.sliderContainer}>
      <div 
        className={styles.slidesWrapper}
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {banners.map((banner, index) => (
          <img
            key={index}
            src={banner.src}
            alt={banner.alt}
            className={styles.bannerImage}
          />
        ))}
      </div>

      <button onClick={handlePrev} className={`${styles.navButton} ${styles.prev}`}>&#10094;</button>
      <button onClick={handleNext} className={`${styles.navButton} ${styles.next}`}>&#10095;</button>
      
      <div className={styles.dotsContainer}>
        {banners.map((_, index) => (
          <div 
            key={index}
            className={`${styles.dot} ${currentIndex === index ? styles.active : ''}`}
            onClick={() => goToSlide(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerSlider; 