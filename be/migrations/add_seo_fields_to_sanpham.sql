-- Migration: Add SEO fields to sanpham table
-- Date: 2024-12-20
-- Description: Add SEO optimization fields for better search engine visibility

ALTER TABLE sanpham 
ADD COLUMN seoTitle VARCHAR(255) NULL COMMENT 'SEO Title for search engines',
ADD COLUMN seoDescription TEXT NULL COMMENT 'SEO Meta Description for search engines', 
ADD COLUMN seoKeywords TEXT NULL COMMENT 'SEO Keywords separated by commas',
ADD COLUMN slug VARCHAR(255) NULL COMMENT 'URL-friendly slug for product page',
ADD INDEX idx_slug (slug),
ADD INDEX idx_seo_title (seoTitle);

-- Add some sample SEO data for existing products
UPDATE sanpham 
SET 
  seoTitle = CONCAT(tenSp, ' - Chất Lượng Cao | HoaShop'),
  slug = REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      LOWER(tenSp), 
      ' ', '-'), 
    'á', 'a'), 'à', 'a'), 'ả', 'a'), 'ã', 'a'),
    'é', 'e'), 'è', 'e'), 'ẻ', 'e'), 'ẽ', 'e'),
    'ơ', 'o')
WHERE tenSp IS NOT NULL AND tenSp != '';

-- Update sample descriptions for existing products  
UPDATE sanpham 
SET seoDescription = CONCAT(
  SUBSTRING(COALESCE(moTa, tenSp), 1, 140), 
  '. Chất lượng cao, giao hàng nhanh. Đặt ngay tại HoaShop!'
)
WHERE tenSp IS NOT NULL; 