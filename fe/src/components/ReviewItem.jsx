import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Rating,
  Avatar,
  Chip,
  IconButton,
  Dialog,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import {
  Star,
  Image as ImageIcon,
  Close
} from '@mui/icons-material';
import { useFormatters } from '../utils/formatters';

const ReviewItem = ({ review }) => {
  const [imageDialogOpen, setImageDialogOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const { formatDate } = useFormatters();

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setImageDialogOpen(true);
  };

  const handleCloseImageDialog = () => {
    setImageDialogOpen(false);
    setSelectedImage(null);
  };

  // Parse images from string
  const images = review.hinhAnh ? review.hinhAnh.split(',').filter(img => img.trim()) : [];

  return (
    <>
      <Card sx={{ mb: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar 
              sx={{ 
                bgcolor: 'primary.main', 
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              {review.User?.ten?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 2 }}>
                  {review.User?.ten || 'Khách hàng'}
                </Typography>
                <Chip 
                  label={formatDate(review.ngayDanhGia)} 
                  size="small" 
                  variant="outlined"
                  sx={{ fontSize: '0.75rem' }}
                />
              </Box>
              <Rating 
                value={review.danhGiaSao || review.sao || 0} 
                readOnly 
                size="small"
                sx={{ mb: 1 }}
              />
            </Box>
          </Box>

          {review.noiDung && (
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.6 }}>
              {review.noiDung}
            </Typography>
          )}

          {/* Display images if available */}
          {images.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {images.map((image, index) => (
                <Box
                  key={index}
                  sx={{
                    position: 'relative',
                    cursor: 'pointer',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image}
                    alt={`Review image ${index + 1}`}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid #e0e0e0'
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                      '&:hover': {
                        bgcolor: 'rgba(255, 255, 255, 1)'
                      }
                    }}
                  >
                    <ImageIcon fontSize="small" />
                  </IconButton>
                </Box>
              ))}
            </Box>
          )}

          {/* Admin reply if available */}
          {review.phanHoiAdmin && (
            <Box sx={{ 
              mt: 2, 
              p: 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1,
              borderLeft: '4px solid',
              borderColor: 'primary.main'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
                Phản hồi từ cửa hàng:
              </Typography>
              <Typography variant="body2">
                {review.phanHoiAdmin}
              </Typography>
              {review.ngayPhanHoi && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                  {formatDate(review.ngayPhanHoi)}
                </Typography>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Image preview dialog */}
      <Dialog
        open={imageDialogOpen}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogContent sx={{ p: 0, textAlign: 'center' }}>
          {selectedImage && (
            <img
              src={selectedImage}
              alt="Review image"
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain'
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ReviewItem;