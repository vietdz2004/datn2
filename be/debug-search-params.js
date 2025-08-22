// Debug script to count parameters in search query
const searchTerm = 'hoa';
const cleanSearchTerm = searchTerm.trim().toLowerCase();
const normalizedKeyword = 'hoa'; // Simplified for debug

// Build WHERE conditions
const whereConditions = [
  'p.trangThai = "active"',
  `(
    LOWER(p.tenSp) LIKE ? OR 
    p.tenSp_normalized LIKE ? OR
    LOWER(p.tenSp) LIKE ? OR
    p.tenSp_normalized LIKE ?
  )`
];

// Tạo pattern cho tên sản phẩm
const exactMatchPattern = `%${cleanSearchTerm}%`;
const normalizedExactPattern = `%${normalizedKeyword}%`;
const wordMatchPattern = `%${cleanSearchTerm}%`;
const normalizedWordPattern = `%${normalizedKeyword}%`;

const queryParams = [
  exactMatchPattern,        // tenSp exact
  normalizedExactPattern,   // tenSp_normalized exact
  wordMatchPattern,         // tenSp word by word
  normalizedWordPattern     // tenSp_normalized word by word
];

// Tham số cho relevance scoring - đơn giản hóa
const scoringParams = [
  `%${cleanSearchTerm}%`,    // Contains exact
  `%${normalizedKeyword}%`,  // Contains normalized
  `${cleanSearchTerm}%`,     // Starts with exact
  `${normalizedKeyword}%`,   // Starts with normalized
  `%${cleanSearchTerm}`,     // Ends with exact
  `%${normalizedKeyword}`    // Ends with normalized
];

const allParams = [...queryParams, ...scoringParams, 5, 0]; // limit=5, offset=0

console.log('🔍 Debug Search Parameters:');
console.log('queryParams length:', queryParams.length);
console.log('scoringParams length:', scoringParams.length);
console.log('allParams length:', allParams.length);
console.log('allParams:', allParams);

// Count ? in the query
const query = `
  SELECT 
    p.*,
    sc.tenDanhMucChiTiet,
    c.tenDanhMuc,
    COALESCE(p.giaKhuyenMai, p.gia) as effectivePrice,
    CASE 
      WHEN p.giaKhuyenMai IS NOT NULL AND p.giaKhuyenMai > 0 AND p.giaKhuyenMai < p.gia 
      THEN ROUND(((p.gia - p.giaKhuyenMai) / p.gia) * 100, 0)
      ELSE 0 
    END as discountPercent,
    (
      CASE 
        WHEN LOWER(p.tenSp) LIKE ? THEN 100
        WHEN p.tenSp_normalized LIKE ? THEN 95
        WHEN LOWER(p.tenSp) LIKE ? THEN 90
        WHEN p.tenSp_normalized LIKE ? THEN 85
        WHEN LOWER(p.tenSp) LIKE ? THEN 80
        WHEN p.tenSp_normalized LIKE ? THEN 75
        ELSE 50
      END
      + CASE WHEN p.soLuongTon > 0 THEN 5 ELSE 0 END
      + CASE WHEN p.giaKhuyenMai IS NOT NULL AND p.giaKhuyenMai < p.gia THEN 3 ELSE 0 END
    ) as relevance_score
  FROM sanpham p
  LEFT JOIN danhmucchitiet sc ON p.id_DanhMucChiTiet = sc.id_DanhMucChiTiet
  LEFT JOIN danhmuc c ON sc.id_DanhMuc = c.id_DanhMuc
  WHERE p.trangThai = "active" AND (
    LOWER(p.tenSp) LIKE ? OR 
    p.tenSp_normalized LIKE ? OR
    LOWER(p.tenSp) LIKE ? OR
    p.tenSp_normalized LIKE ?
  )
  HAVING relevance_score > 10
  ORDER BY relevance_score DESC, p.soLuongTon DESC, p.id_SanPham DESC
  LIMIT ? OFFSET ?
`;

const questionMarkCount = (query.match(/\?/g) || []).length;
console.log('\n📊 Query Analysis:');
console.log('Question marks in query:', questionMarkCount);
console.log('Parameters provided:', allParams.length);
console.log('Mismatch:', questionMarkCount - allParams.length); 