import React, { useEffect, useState, useCallback } from "react";
import productService from "../../services/productService";
import ProductList from "./ProductList";
import ProductFilter from "./ProductFilter";
import ProductForm from "./ProductForm";
import "./AdminProductPage.css";

const PAGE_SIZE = 10;

export default function AdminProductPage() {
  // State quản lý dữ liệu
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState(null);
  const [flatCategories, setFlatCategories] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  
  // State filter & phân trang
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Hiển thị thông báo thành công tạm thời
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 3000);
  };

  // Load danh sách sản phẩm
  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      // Xử lý filter category
      let params = {
        search, 
        status, 
        page, 
        limit: PAGE_SIZE 
      };

      console.log('🔍 Filter params:', { search, status, category, page });

      // Xử lý category filter
      if (category) {
        if (category.startsWith('parent_')) {
          // Filter theo parent category - lấy tất cả subcategories
          const parentId = category.replace('parent_', '');
          const parent = categoryTree.find(cat => (cat.id_DanhMuc || cat.id) == parentId);
          if (parent) {
            const subCategories = parent.subCategories || parent.DanhMucChiTiets || [];
            if (Array.isArray(subCategories) && subCategories.length > 0) {
              const subcatIds = subCategories.map(sub => sub.id_DanhMucChiTiet || sub.id);
              params.subcat = subcatIds.join(',');
            }
          }
        } else {
          // Filter theo subcategory cụ thể
          params.subcat = category;
        }
      }

      const response = await productService.getAdminProducts(params);
      
      // Xử lý response data - Backend trả về { success, data, pagination }
      const responseData = response.data || {};
      const products = responseData.data || [];
      const pagination = responseData.pagination || {};
      const total = pagination.total || 0;
      
      setProducts(Array.isArray(products) ? products : []);
      setTotalPages(pagination.totalPages || Math.ceil(total / PAGE_SIZE));
    } catch (error) {
      console.error('Error loading products:', error);
      setError("Không thể tải danh sách sản phẩm");
      setProducts([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [search, category, status, page, categoryTree]);

  // Load danh mục
  const loadCategories = async () => {
    try {
      console.log('🔄 Loading categories with fetch...');
      
      const response = await fetch('http://localhost:5002/api/admin/categories/tree', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📡 Fetch response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      console.log('📦 Response data:', responseData);
      
      if (!responseData.success) {
        throw new Error('API returned error: ' + responseData.message);
      }
      
      const tree = responseData.data;
      console.log('🌳 Tree data type:', typeof tree);
      console.log('🌳 Tree is array:', Array.isArray(tree));
      console.log('🌳 Tree data:', tree);
      
      if (!Array.isArray(tree)) {
        throw new Error(`Tree data is not an array, got: ${typeof tree}`);
      }
      
      setCategoryTree(tree);

      // Tạo flat categories cho dropdown filter
      const flat = [];
      tree.forEach(parent => {
        console.log(`Processing parent: ${parent.tenDanhMuc} (ID: ${parent.id_DanhMuc})`);
        
        // Thêm parent category
        flat.push({
          id: parent.id_DanhMuc,
          name: parent.tenDanhMuc,
          type: 'parent'
        });
        
        // Thêm child categories
        const subCategories = parent.subCategories || [];
        console.log(`Parent ${parent.tenDanhMuc} has ${subCategories.length} subcategories`);
        
        if (Array.isArray(subCategories) && subCategories.length > 0) {
          subCategories.forEach(child => {
            console.log(`Processing child: ${child.tenDanhMucChiTiet} (ID: ${child.id_DanhMucChiTiet})`);
            flat.push({
              id: child.id_DanhMucChiTiet,
              name: child.tenDanhMucChiTiet,
              parentName: parent.tenDanhMuc,
              type: 'child'
            });
          });
        }
      });
      
      console.log('📋 Final flatCategories count:', flat.length);
      console.log('📋 Final flatCategories:', flat);
      
      if (flat.length > 0) {
        setFlatCategories(flat);
        setError(""); // Clear any previous errors
        console.log('✅ Categories loaded successfully!');
      } else {
        console.warn('⚠️ No categories found in response');
        setError("Không tìm thấy danh mục nào");
      }
      
    } catch (error) {
      console.error('❌ Error loading categories:', error);
      
      // Fallback với hard-coded data
      console.log('🔄 Using fallback categories data...');
      const fallbackCategories = [
        { id: 1, name: 'Hoa Sinh Nhật', type: 'parent' },
        { id: 1, name: 'Hoa Hồng', parentName: 'Hoa Sinh Nhật', type: 'child' },
        { id: 2, name: 'Hoa Cúc', parentName: 'Hoa Sinh Nhật', type: 'child' },
        { id: 2, name: 'Hoa Chúc Mừng', type: 'parent' },
        { id: 3, name: 'Hoa Khai Trương', parentName: 'Hoa Chúc Mừng', type: 'child' },
        { id: 4, name: 'Hoa Sự Kiện', parentName: 'Hoa Chúc Mừng', type: 'child' }
      ];
      
      setFlatCategories(fallbackCategories);
      setError(`Lỗi tải danh mục: ${error.message} (Sử dụng dữ liệu mẫu)`);
      setCategoryTree([]);
    }
  };

  // Chạy khi component mount
  useEffect(() => {
    console.log('🚀 AdminProductPage mounted at:', new Date().toISOString());
    
    // Force load categories immediately
    setTimeout(() => {
      console.log('⏰ Timeout calling loadCategories...');
      loadCategories();
    }, 100);
    
    // Also call directly
    loadCategories();
  }, []);

  // Chạy khi filter thay đổi
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Reset page khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [search, category, status]);

  // Xử lý thêm sản phẩm
  const handleAdd = () => {
    setEditData(null);
    setShowForm(true);
  };

  // Xử lý sửa sản phẩm
  const handleEdit = (product) => {
    setEditData(product);
    setShowForm(true);
  };

  // Xử lý thay đổi trạng thái (thay vì xóa)
  const handleStatusChange = async (productId, newStatus) => {
    try {
      await productService.updateProductStatus(productId, newStatus);
      const statusText = newStatus === 'active' ? 'hiển thị' : 'ẩn';
      showSuccessMessage(`Đã ${statusText} sản phẩm thành công!`);
      loadProducts();
    } catch (error) {
      console.error('Error updating status:', error);
      setError("Không thể cập nhật trạng thái sản phẩm");
    }
  };

  // Xử lý xóa sản phẩm (chuyển thành ẩn)
  const handleDelete = async (productId) => {
    if (!confirm("Bạn có chắc chắn muốn ẩn sản phẩm này khỏi danh sách?")) return;

    try {
      await productService.updateProductStatus(productId, 'hidden');
      showSuccessMessage("Đã ẩn sản phẩm thành công!");
      loadProducts();
    } catch (error) {
      console.error('Error hiding product:', error);
      setError("Không thể ẩn sản phẩm");
    }
  };

  // Xử lý submit form
  const handleFormSubmit = async (formData, imageFile) => {
    try {
      console.log('📝 Form submission:', { formData, imageFile, editData });
      
      if (editData) {
        // Cập nhật sản phẩm
        console.log('🔄 Updating product:', editData.id);
        await productService.updateProduct(editData.id, formData, imageFile);
        showSuccessMessage("Cập nhật sản phẩm thành công!");
      } else {
        // Thêm sản phẩm mới
        console.log('➕ Creating new product');
        const response = await productService.createProduct(formData, imageFile);
        console.log('✅ Create response:', response);
        showSuccessMessage("Thêm sản phẩm thành công!");
      }
      setShowForm(false);
      loadProducts();
    } catch (error) {
      console.error('❌ Error saving product:', error);
      console.error('Error response:', error.response?.data);
      setError(`Lỗi: ${error.response?.data?.message || error.message}`);
      throw error; // Let form handle the error
    }
  };

  return (
    <div className="admin-product-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Quản lý sản phẩm</h1>
          <p>Quản lý toàn bộ sản phẩm trong hệ thống</p>
        </div>
        <button className="add-btn" onClick={handleAdd}>
          Thêm sản phẩm
        </button>
      </div>

      {/* Thông báo */}
      {error && (
        <div className="alert alert-error">
          {error}
          <button onClick={() => setError("")}>×</button>
        </div>
      )}
      
      {success && (
        <div className="alert alert-success">
          {success}
          <button onClick={() => setSuccess("")}>×</button>
        </div>
      )}

      {/* Filter */}
      <ProductFilter
        search={search}
        category={category}
        status={status}
        onSearchChange={setSearch}
        onCategoryChange={setCategory}
        onStatusChange={setStatus}
        flatCategories={flatCategories}
      />

      {/* Product List */}
      <ProductList
        products={products}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {/* Product Form Modal */}
      <ProductForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        initialData={editData}
        categoryTree={categoryTree}
      />
    </div>
  );
} 