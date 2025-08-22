import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { Star, CloudUpload, Close, CheckCircleOutline } from '@mui/icons-material';
import { reviewAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// ReviewForm: Component form để viết đánh giá sản phẩm
const ReviewForm = ({ 
  open, 
  onClose, 
  productId, 
  productName,
  onReviewSubmitted,
  userHasPurchased = true,
  // New props for order-based reviews
  orderId = null,
  userId = null,
  isOrderReview = false
}) => {
  const { user: authUser } = useAuth();
   // STATE MANAGEMENT - Quản lý trạng thái form
   const [formData, setFormData] = useState({
     rating: 5,
     content: '',
     images: []
   });
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);

  // VALIDATION - Kiểm tra dữ liệu form
  const validateForm = () => {
    if (!formData.rating || formData.rating < 1 || formData.rating > 5) {
      setError('Vui lòng chọn số sao từ 1-5');
      return false;
    }
    // Nội dung không bắt buộc, nhưng nếu có thì phải có ít nhất 10 ký tự
    if (formData.content.trim() && formData.content.trim().length < 10) {
      setError('Nội dung đánh giá phải có ít nhất 10 ký tự hoặc để trống');
      return false;
    }
    return true;
  };

  // SUBMIT HANDLER - Xử lý gửi đánh giá
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    if (!userHasPurchased && !isOrderReview) {
      setError('Bạn cần mua sản phẩm này trước khi có thể đánh giá');
      return;
    }

    setLoading(true);
    
    try {
      let response;
      // Determine effective user id (from prop or auth context)
      const effectiveUserId = userId || authUser?.id_NguoiDung || authUser?.id;
       
      // If we have an orderId and a userId (either passed or from auth), use order-based endpoint
      if ((isOrderReview || orderId) && orderId && effectiveUserId) {
        // Order-based review - sử dụng API mới
        const reviewData = {
          noiDung: formData.content.trim() || null,
          danhGiaSao: formData.rating,
          hinhAnh: formData.images.length > 0 ? formData.images.join(',') : null
        };
        
        console.log('📝 Gửi đánh giá đơn hàng:', { orderId, productId, effectiveUserId, reviewData });
        response = await reviewAPI.createOrderReview(orderId, productId, effectiveUserId, reviewData);
      } else {
        // Regular review endpoint requires id_DonHang on the backend in our system.
        // If we don't have an orderId, reject early and instruct user to review from order page.
        if (!orderId) {
          setError('Không thể gửi đánh giá: thiếu thông tin đơn hàng. Vui lòng đánh giá từ trang Đơn hàng hoặc liên hệ hỗ trợ.');
          setLoading(false);
          return;
        }

        const reviewData = {
          id_SanPham: productId,
          id_DonHang: orderId,
          noiDung: formData.content.trim() || null,
          danhGiaSao: formData.rating,
          hinhAnh: formData.images.length > 0 ? formData.images.join(',') : null
        };

        console.log('📝 Gửi đánh giá thường (với id_DonHang):', reviewData);
        response = await reviewAPI.create(reviewData);
       }
       
       if (response.data.success) {
         setSuccess(true);
         setFormData({ rating: 5, content: '', images: [] });
         
         // Callback để refresh data
         if (onReviewSubmitted) {
           onReviewSubmitted();
         }
         
         // Auto close after 2 seconds
         setTimeout(() => {
           handleClose();
         }, 2000);
       } else {
         setError(response.data.message || 'Có lỗi xảy ra khi gửi đánh giá');
       }
     } catch (err) {
       console.error('❌ Lỗi gửi đánh giá:', err);
       
       if (err.response?.status === 500) {
         setError('Lỗi server khi tạo đánh giá. Vui lòng thử lại sau.');
       } else if (err.response?.data?.message) {
         setError(err.response.data.message);
       } else if (err.message) {
         setError(err.message);
       } else {
         setError('Không thể gửi đánh giá. Vui lòng thử lại sau.');
       }
     } finally {
       setLoading(false);
     }
   };

  // CLOSE HANDLER - Xử lý đóng form
  const handleClose = () => {
    if (!loading) {
      setFormData({ rating: 5, content: '', images: [] });
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  // RATING CHANGE HANDLER
  const handleRatingChange = (event, newValue) => {
    setFormData(prev => ({ ...prev, rating: newValue }));
  };

  // CONTENT CHANGE HANDLER
  const handleContentChange = (event) => {
    setFormData(prev => ({ ...prev, content: event.target.value }));
  };

  // IMAGE UPLOAD HANDLER
  const handleImageUpload = (event) => {
    const files = Array.from(event.target.files);
    const maxFiles = 5; // Giới hạn 5 hình ảnh
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (files.length > maxFiles) {
      setError(`Chỉ có thể tải tối đa ${maxFiles} hình ảnh`);
      return;
    }

    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        setError(`Hình ảnh ${file.name} quá lớn (tối đa 5MB)`);
        return false;
      }
      if (!file.type.startsWith('image/')) {
        setError(`File ${file.name} không phải là hình ảnh`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      // Convert files to base64
      const imagePromises = validFiles.map(file => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then(images => {
        setFormData(prev => ({ 
          ...prev, 
          images: [...prev.images, ...images].slice(0, maxFiles) 
        }));
        setError('');
      });
    }
  };

  // REMOVE IMAGE HANDLER
  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }
      }}
    >
      <DialogTitle 
        sx={{
          background: 'linear-gradient(45deg, primary.main, primary.light)',
          color: 'white',
          py: 3,
          position: 'relative',
          '&::after': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, primary.light 0%, secondary.main 100%)'
          }
        }}
      >
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
            {isOrderReview ? 'Đánh giá sản phẩm đã mua' : 'Đánh giá sản phẩm'}
          </Typography>
          <Typography 
            variant="subtitle1" 
            sx={{ 
              opacity: 0.9,
              fontWeight: 500,
              fontSize: '1.1rem'
            }}
          >
            {productName}
          </Typography>
          {isOrderReview && orderId && (
            <Typography 
              variant="caption" 
              sx={{ 
                display: 'inline-block',
                background: 'rgba(255,255,255,0.2)',
                px: 1.5,
                py: 0.5,
                borderRadius: '12px',
                mt: 1
              }}
            >
              Đơn hàng #{orderId}
            </Typography>
          )}
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ py: 3, px: { xs: 2, sm: 3 } }}>
        {success && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
            icon={<CheckCircleOutline fontSize="inherit" />}
          >
            Đánh giá đã được gửi thành công!
          </Alert>
        )}
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: '12px',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            {error}
          </Alert>
        )}
        
        <Box 
          sx={{ 
            mb: 4,
            p: 3,
            bgcolor: 'background.paper',
            borderRadius: '16px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography 
            component="legend" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.1rem'
            }}
          >
            Đánh giá của bạn *
          </Typography>
          <Box 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1
            }}
          >
            <Rating
              name="rating"
              value={formData.rating}
              onChange={handleRatingChange}
              precision={1}
              size="large"
              sx={{
                '& .MuiRating-icon': {
                  fontSize: '2.5rem',
                  transition: 'all 0.2s',
                  color: 'primary.main'
                },
                '& .MuiRating-iconFilled': {
                  color: 'primary.main'
                },
                '& .MuiRating-iconHover': {
                  transform: 'scale(1.2)',
                  color: 'primary.dark'
                }
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                mt: 1,
                color: 'primary.main',
                fontWeight: 500,
                transition: 'all 0.3s'
              }}
            >
              {formData.rating === 1 && 'Rất không hài lòng 😞'}
              {formData.rating === 2 && 'Không hài lòng 😕'}
              {formData.rating === 3 && 'Bình thường 😐'}
              {formData.rating === 4 && 'Hài lòng 😊'}
              {formData.rating === 5 && 'Rất hài lòng 😍'}
            </Typography>
          </Box>
        </Box>
        
        <TextField
          autoFocus
          margin="dense"
          label="Nội dung đánh giá (không bắt buộc)"
          type="text"
          fullWidth
          variant="outlined"
          multiline
          rows={4}
          value={formData.content}
          onChange={handleContentChange}
          placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này... (không bắt buộc)"
          helperText={formData.content.length > 0 ? `${formData.content.length}/500 ký tự (tối thiểu 10 ký tự nếu có nội dung)` : 'Có thể để trống, chỉ cần chọn số sao'}
          error={formData.content.length > 0 && formData.content.length < 10}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: 'primary.main'
              },
              '&.Mui-focused': {
                boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)'
              }
            },
            '& .MuiInputLabel-root': {
              fontSize: '1rem',
              fontWeight: 500
            },
            '& .MuiFormHelperText-root': {
              margin: '8px 0 0',
              fontSize: '0.875rem'
            }
          }}
        />

        {/* Image Upload Section */}
        <Box sx={{ mt: 3 }}>
          <Typography 
            component="legend" 
            sx={{ 
              mb: 2,
              fontWeight: 600,
              color: 'text.primary',
              fontSize: '1.1rem'
            }}
          >
            Hình ảnh (không bắt buộc)
          </Typography>
          
          <input
            accept="image/*"
            style={{ display: 'none' }}
            id="image-upload"
            multiple
            type="file"
            onChange={handleImageUpload}
          />
          <label htmlFor="image-upload">
            <Button
              variant="outlined"
              component="span"
              startIcon={<CloudUpload />}
              sx={{
                borderRadius: '10px',
                textTransform: 'none',
                fontSize: '1rem',
                py: 1.5,
                px: 3,
                borderStyle: 'dashed',
                borderWidth: 2,
                '&:hover': {
                  borderStyle: 'solid',
                  borderWidth: 2
                }
              }}
            >
              Tải hình ảnh (tối đa 5 ảnh, 5MB/ảnh)
            </Button>
          </label>

          {/* Display uploaded images */}
          {formData.images.length > 0 && (
            <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {formData.images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    width: 100,
                    height: 100,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '2px solid',
                    borderColor: 'divider'
                  }}
                >
                  <img
                    src={image}
                    alt={`Upload ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveImage(index)}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      color: 'error.main',
                      '&:hover': {
                        bgcolor: 'error.main',
                        color: 'white'
                      }
                    }}
                  >
                    <Close />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}
        </Box>
        
        {!userHasPurchased && !isOrderReview && (
          <Alert 
            severity="warning" 
            sx={{ 
              mt: 3,
              borderRadius: '12px',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            Bạn cần mua sản phẩm này trước khi có thể đánh giá
          </Alert>
        )}
        
        {isOrderReview && (
          <Alert 
            severity="info" 
            sx={{ 
              mt: 3,
              borderRadius: '12px',
              '& .MuiAlert-icon': { fontSize: '1.5rem' }
            }}
          >
            Đánh giá này sẽ được gắn với đơn hàng #{orderId}
          </Alert>
        )}
      </DialogContent>
      
      <DialogActions 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          py: 2.5,
          bgcolor: 'background.default',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{
            borderRadius: '10px',
            px: 3,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Hủy
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading || (!userHasPurchased && !isOrderReview)}
          startIcon={loading ? <CircularProgress size={20} /> : null}
          sx={{
            borderRadius: '10px',
            px: 4,
            py: 1,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 500,
            boxShadow: 2,
            '&:hover': {
              boxShadow: 4,
              transform: 'translateY(-1px)'
            },
            '&:active': {
              transform: 'translateY(1px)'
            }
          }}
        >
          {loading ? 'Đang gửi...' : 'Gửi đánh giá'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;