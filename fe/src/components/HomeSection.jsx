import React from "react";
import styles from "./HomeSection.module.scss";

const HomeSection = ({ title, subtitle, children, onViewMore }) => {
  return (
    <section className={styles.homeSection}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <h2 className={styles.title}>{title}</h2>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
        </div>
        {onViewMore && (
          <button 
            className={styles.viewMoreBtn}
            onClick={onViewMore}
          >
            Xem thêm
          </button>
        )}
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </section>
  );
};

export default HomeSection; 