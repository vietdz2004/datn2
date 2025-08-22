  import React, { useState } from 'react';
import { Avatar } from '@mui/material';
import { formatImageUrl } from '../services/api';

const ImageWithFallback = ({ 
  src, 
  alt, 
  variant = "square", 
  sx = {}, 
  width = 80, 
  height = 80,
  showLogs = false 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const formattedSrc = formatImageUrl(src);
  
  if (showLogs) {
    console.log('🖼️ ImageWithFallback:', {
      originalSrc: src,
      formattedSrc: formattedSrc,
      hasError: imageError,
      isLoaded: imageLoaded
    });
  }

  const handleImageLoad = () => {
    if (showLogs) {
      console.log('✅ Image loaded successfully:', src);
    }
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e) => {
    if (showLogs) {
      console.log('❌ Image failed to load:', src, 'URL:', formattedSrc);
    }
    setImageError(true);
    setImageLoaded(false);
    e.target.onerror = null;
    e.target.src = '/no-image.png';
  };

  return (
    <Avatar
      variant={variant}
      src={imageError ? '/no-image.png' : formattedSrc}
      onLoad={handleImageLoad}
      onError={handleImageError}
      sx={{ 
        width, 
        height,
        ...sx 
      }}
      alt={alt}
    />
  );
};

export default ImageWithFallback;
