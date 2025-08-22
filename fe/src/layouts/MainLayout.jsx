import React, { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import styles from './MainLayout.module.scss';
import Footer from '../components/Footer';

// MainLayout: Layout chính cho toàn bộ ứng dụng, chứa header và phần nội dung
const MainLayout = ({ children }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Optimize scroll handler with requestAnimationFrame
  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    const shouldScroll = scrollY > 100; // Match threshold with CSS
    
    if (shouldScroll !== isScrolled) {
      setIsScrolled(shouldScroll);
    }
  }, [isScrolled]);

  // Effect for handling scroll with RAF for smoothness
  useEffect(() => {
    let rafId = null;
    let ticking = false;
    
    const onScroll = () => {
      if (!ticking) {
        rafId = requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [handleScroll]);

  return (
    <>
      <Header isScrolled={isScrolled} />
      <main className={`${styles.contentWrap} ${!isScrolled ? styles.headerVisible : styles.scrolled}`}>
        {children}
      </main>
      <Footer />
    </>
  );
};

export default MainLayout; 