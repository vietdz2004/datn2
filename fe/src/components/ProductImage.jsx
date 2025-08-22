import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { formatImageUrl } from '../services/api';

const ProductImage = ({ 
  imagePath, 
  alt, 
  width = '100%', 
  height = '400px',
  objectFit = 'cover'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const imageUrl = formatImageUrl(imagePath);
  
  console.log('🖼️ ProductImage:', {
    originalPath: imagePath,
    formattedUrl: imageUrl
  });

  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully');
    setLoading(false);
    setError(false);
  };

  const handleImageError = (e) => {
    console.log('❌ Image failed to load:', imageUrl);
    setLoading(false);
    setError(true);
  };

  return (
    <Box 
      sx={{ 
        width, 
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#f5f5f5',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {loading && (
        <Typography variant="body2" color="text.secondary">
          Đang tải...
        </Typography>
      )}
      
      {error && !loading && (
        <Typography variant="body2" color="text.secondary">
          Không có hình ảnh
        </Typography>
      )}
      
      <img
        src={imageUrl}
        alt={alt}
        style={{
          width: '100%',
          height: '100%',
          objectFit,
          display: loading || error ? 'none' : 'block'
        }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </Box>
  );
};

export default ProductImage; 