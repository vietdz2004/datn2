import React, { createContext, useContext, useReducer, useEffect, useState, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { useAuth } from './AuthContext';

// ============================================
// CART CONTEXT - Quản lý giỏ hàng toàn cục
// ============================================

const CartContext = createContext();

// Các hành động có thể thực hiện với giỏ hàng
const CART_ACTIONS = {
  ADD_ITEM: 'ADD_ITEM',           // Thêm sản phẩm vào giỏ
  REMOVE_ITEM: 'REMOVE_ITEM',     // Xóa sản phẩm khỏi giỏ
  UPDATE_QUANTITY: 'UPDATE_QUANTITY', // Cập nhật số lượng
  CLEAR_CART: 'CLEAR_CART',       // Xóa toàn bộ giỏ hàng
  LOAD_CART: 'LOAD_CART',         // Tải giỏ hàng từ DB/localStorage
  SET_LOADING: 'SET_LOADING',     // Cập nhật trạng thái loading
  SET_VOUCHER: 'SET_VOUCHER',     // Áp dụng voucher
  REMOVE_VOUCHER: 'REMOVE_VOUCHER' // Xóa voucher
};

// ============================================
// CART REDUCER - Xử lý logic cập nhật state
// ============================================
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case CART_ACTIONS.ADD_ITEM: {
      const { product, quantity = 1 } = action.payload;
      const existingItem = state.items.find(item => item.id_SanPham === product.id_SanPham);
      
      if (existingItem) {
        // Nếu sản phẩm đã có, tăng số lượng
        return {
          ...state,
          items: state.items.map(item =>
            item.id_SanPham === product.id_SanPham
              ? { ...item, quantity: item.quantity + quantity, soLuong: item.quantity + quantity }
              : item
          )
        };
      } else {
        // Thêm sản phẩm mới vào giỏ
        const cartItem = {
          id_SanPham: product.id_SanPham,
          tenSp: product.tenSp,
          gia: product.gia,
          giaKhuyenMai: product.giaKhuyenMai,
          hinhAnh: product.hinhAnh,
          quantity: quantity,
          soLuong: quantity,
          thuongHieu: product.thuongHieu || ''
        };
        
        return { ...state, items: [...state.items, cartItem] };
      }
    }

    case CART_ACTIONS.REMOVE_ITEM:
      return {
        ...state,
        items: state.items.filter(item => item.id_SanPham !== action.payload.productId)
      };

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { productId, quantity } = action.payload;
      
      // Nếu số lượng <= 0, xóa sản phẩm
      if (quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(item => item.id_SanPham !== productId)
        };
      }
      
      // Cập nhật số lượng mới
      return {
        ...state,
        items: state.items.map(item =>
          item.id_SanPham === productId
            ? { ...item, quantity, soLuong: quantity }
            : item
        )
      };
    }

    case CART_ACTIONS.CLEAR_CART:
      return { ...state, items: [], voucher: null };

    case CART_ACTIONS.LOAD_CART:
      return { ...state, items: action.payload.items || [] };

    case CART_ACTIONS.SET_VOUCHER:
      return { ...state, voucher: action.payload.voucher };

    case CART_ACTIONS.REMOVE_VOUCHER:
      return { ...state, voucher: null };

    default:
      return state;
  }
};

// State ban đầu của giỏ hàng
const initialState = {
  items: [],
  loading: false,
  voucher: null
};

// ============================================
// CART PROVIDER - Component cung cấp context
// ============================================
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user, loading: authLoading } = useAuth();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ============================================
  // CÁC HELPER FUNCTIONS - Hàm tiện ích (thứ tự đúng)
  // ============================================

  // Tải giỏ hàng từ localStorage cho guest user (định nghĩa trước)
  const loadCartFromLocalStorage = useCallback(() => {
    try {
      const savedCart = localStorage.getItem('hoashop_cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: cartData.items || [] }
        });
        console.log('✅ Tải giỏ hàng từ localStorage thành công:', cartData.items?.length || 0, 'items');
      }
    } catch (error) {
      console.error('❌ Lỗi tải giỏ hàng từ localStorage:', error);
    }
  }, []);

  // Tải giỏ hàng từ database cho user đã đăng nhập (định nghĩa sau)
  const loadCartFromDatabase = useCallback(async (userId) => {
    if (!userId) return;
    
    try {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: true });
      const response = await cartAPI.get();
      
      if (response.data.success) {
        // Backend trả về format: { success: true, data: { items: [...], totalItems, totalAmount } }
        const cartItems = response.data.data?.items || [];
        dispatch({
          type: CART_ACTIONS.LOAD_CART,
          payload: { items: cartItems }
        });
        console.log('✅ Tải giỏ hàng từ database thành công:', cartItems.length, 'items');
      }
    } catch (error) {
      console.error('❌ Lỗi tải giỏ hàng từ database:', error);
      // Nếu user chưa đăng nhập, fallback về localStorage
      if (error.message?.includes('must be logged in')) {
        console.log('🔄 Fallback to localStorage cart...');
        loadCartFromLocalStorage();
      }
    } finally {
      dispatch({ type: CART_ACTIONS.SET_LOADING, payload: false });
    }
  }, [loadCartFromLocalStorage]);

  // Lưu giỏ hàng vào localStorage (chỉ cho guest user)
  const saveCartToLocalStorage = useCallback(() => {
    try {
      localStorage.setItem('hoashop_cart', JSON.stringify(state));
    } catch (error) {
      console.error('❌ Lỗi lưu giỏ hàng vào localStorage:', error);
    }
  }, [state]);

  // Đồng bộ giỏ hàng từ localStorage lên database khi user đăng nhập
  const syncLocalStorageToDatabase = useCallback(async (userId, localItems) => {
    if (!userId || !localItems.length) return;

    try {
      console.log('🔄 Syncing', localItems.length, 'items from localStorage to database...');
      await cartAPI.sync(localItems);
      localStorage.removeItem('hoashop_cart'); // Xóa localStorage sau khi sync thành công
      console.log('✅ Cart sync completed successfully');
    } catch (error) {
      console.error('❌ Lỗi đồng bộ giỏ hàng lên database:', error);
    }
  }, []);

  // ============================================
  // EFFECTS - Xử lý side effects
  // ============================================

  // Khởi tạo giỏ hàng khi user thay đổi (login/logout)
  useEffect(() => {
    // ⚠️ CHỜ AUTH LOADING HOÀN THÀNH TRƯỚC KHI KHỞI TẠO CART
    if (authLoading) {
      console.log('⏳ Waiting for auth to complete...');
      return;
    }

    const initializeCart = async () => {
      const newUserId = user?.id_NguoiDung;
      
      console.log('🚀 Initializing cart for user:', newUserId || 'guest');
      
      // Bỏ qua nếu cùng user hoặc chưa khởi tạo
      if (currentUserId === newUserId && isInitialized) {
        console.log('⏭️ Skipping cart initialization - same user');
        return;
      }
      
      setCurrentUserId(newUserId);
      
      if (newUserId) {
        // User đã đăng nhập
        console.log('👤 User logged in - loading cart from database...');
        const localCart = localStorage.getItem('hoashop_cart');
        let localItems = [];
        
        try {
          if (localCart) {
            const cartData = JSON.parse(localCart);
            localItems = cartData.items || [];
          }
        } catch (error) {
          console.error('❌ Lỗi parse localStorage cart:', error);
        }
        
        // Đồng bộ localStorage nếu có items
        if (localItems.length > 0) {
          await syncLocalStorageToDatabase(newUserId, localItems);
        }
        
        // Tải giỏ hàng từ database
        await loadCartFromDatabase(newUserId);
        
      } else {
        // User chưa đăng nhập hoặc đã logout
        console.log('👤 Guest user - loading cart from localStorage...');
        dispatch({ type: CART_ACTIONS.CLEAR_CART });
        loadCartFromLocalStorage();
      }
      
      if (!isInitialized) {
        setIsInitialized(true);
        console.log('✅ Cart initialization completed');
      }
    };

    initializeCart();
  }, [authLoading, user?.id_NguoiDung, loadCartFromDatabase, loadCartFromLocalStorage, 
      syncLocalStorageToDatabase, currentUserId, isInitialized]);

  // Lưu vào localStorage khi giỏ hàng thay đổi (chỉ cho guest user)
  useEffect(() => {
    if (isInitialized && !authLoading && !user?.id_NguoiDung) {
      saveCartToLocalStorage();
    }
  }, [state, user?.id_NguoiDung, isInitialized, authLoading, saveCartToLocalStorage]);

  // ============================================
  // CART ACTIONS - Các hành động với giỏ hàng
  // ============================================

  // Thêm sản phẩm vào giỏ hàng
  const addToCart = async (product, quantity = 1) => {
    if (user?.id_NguoiDung) {
      // User đã đăng nhập - lưu vào database
      try {
        await cartAPI.add(product.id_SanPham, quantity);
        await loadCartFromDatabase(user.id_NguoiDung);
      } catch (error) {
        console.error('❌ Lỗi thêm vào giỏ hàng:', error);
        // Fallback về local state
        dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { product, quantity } });
      }
    } else {
      // Guest user - cập nhật local state
      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: { product, quantity } });
    }
  };

  // Xóa sản phẩm khỏi giỏ hàng
  const removeFromCart = async (productId) => {
    if (user?.id_NguoiDung) {
      try {
        await cartAPI.remove(productId);
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
      } catch (error) {
        console.error('❌ Lỗi xóa khỏi giỏ hàng:', error);
        dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
      }
    } else {
      dispatch({ type: CART_ACTIONS.REMOVE_ITEM, payload: { productId } });
    }
  };

  // Cập nhật số lượng sản phẩm
  const updateQuantity = async (productId, quantity) => {
    if (user?.id_NguoiDung) {
      try {
        if (quantity <= 0) {
          await removeFromCart(productId);
        } else {
          await cartAPI.update(productId, quantity);
          dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
        }
      } catch (error) {
        console.error('❌ Lỗi cập nhật số lượng:', error);
        dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
      }
    } else {
      dispatch({ type: CART_ACTIONS.UPDATE_QUANTITY, payload: { productId, quantity } });
    }
  };

  // Xóa toàn bộ giỏ hàng
  const clearCart = async () => {
    if (user?.id_NguoiDung) {
      try {
        await cartAPI.clear();
      } catch (error) {
        console.error('❌ Lỗi xóa giỏ hàng từ database:', error);
      }
    }
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  // Áp dụng voucher
  const applyVoucher = (voucherData) => {
    dispatch({ type: CART_ACTIONS.SET_VOUCHER, payload: { voucher: voucherData } });
  };

  // Xóa voucher
  const removeVoucher = () => {
    dispatch({ type: CART_ACTIONS.REMOVE_VOUCHER });
  };

  // ============================================
  // COMPUTED VALUES - Giá trị tính toán
  // ============================================
  
  const totalItems = state.items.reduce((total, item) => 
    total + (item.quantity || item.soLuong || 0), 0);
  
  const totalAmount = state.items.reduce((total, item) => {
    const price = item.giaKhuyenMai || item.gia;
    const quantity = item.quantity || item.soLuong || 0;
    return total + (price * quantity);
  }, 0);
  console.log('CartContext totalAmount:', totalAmount);

  // ============================================
  // HELPER FUNCTIONS - Hàm tiện ích công khai
  // ============================================
  
  const isInCart = (productId) => 
    state.items.some(item => item.id_SanPham === productId);

  const getItemQuantity = (productId) => {
    const item = state.items.find(item => item.id_SanPham === productId);
    return item ? (item.quantity || item.soLuong || 0) : 0;
  };

  // Context value được cung cấp cho component con
  const value = {
    // State
    items: state.items,
    cartItems: state.items, // Alias for backward compatibility
    totalItems,
    totalAmount,
    loading: state.loading,
    voucher: state.voucher, // Thêm voucher vào context value
    
    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    applyVoucher,
    removeVoucher,
    
    // Helpers
    isInCart,
    getItemQuantity,
    getTotalItems: () => totalItems,
    getTotalPrice: () => totalAmount
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// ============================================
// CUSTOM HOOK - Hook sử dụng Cart Context
// ============================================
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart phải được sử dụng trong CartProvider');
  }
  return context;
};

export { CartContext };
export default CartContext; 