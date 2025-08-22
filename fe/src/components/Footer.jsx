import React from 'react';
import styles from './Footer.module.scss';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.title}>Về Hoà Nghệ</h3>
          <p>Chuyên cung cấp các sản phẩm nội thất gỗ chất lượng cao, mang lại sự sang trọng và ấm cúng cho không gian sống của bạn.</p>
        </div>
        <div className={styles.section}>
          <h3 className={styles.title}>Liên kết nhanh</h3>
          <ul className={styles.links}>
            <li><a href="/">Trang chủ</a></li>
            <li><a href="/products">Sản phẩm</a></li>
            <li><a href="/about">Giới thiệu</a></li>
            <li><a href="/contact">Liên hệ</a></li>
          </ul>
        </div>
        <div className={styles.section}>
          <h3 className={styles.title}>Thông tin liên hệ</h3>
          <p>Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM</p>
          <p>Email: support@hoanghe.com</p>
          <p>Điện thoại: 0123 456 789</p>
        </div>
      </div>
      <div className={styles.copyright}>
        <p>&copy; {new Date().getFullYear()} Hoà Nghệ. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 