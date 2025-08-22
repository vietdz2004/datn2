import React, { useState } from 'react';
import { Box, Typography, Chip, Collapse, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess, Info } from '@mui/icons-material';
import { formatImageUrl } from '../services/api';
import ImageWithFallback from './ImageWithFallback';

const ImageDebug = ({ imagePath, productName, productId }) => {
  const [expanded, setExpanded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formattedUrl = formatImageUrl(imagePath);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoaded(false);
    setImageError(true);
  };

  return (
    <Box sx={{ border: '1px solid #ddd', borderRadius: 1, p: 1, mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Info color="primary" fontSize="small" />
        <Typography variant="caption" color="text.secondary">
          Debug Info
        </Typography>
        <IconButton 
          size="small" 
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <ImageWithFallback 
          src={imagePath}
          alt={productName}
          width={60}
          height={60}
          showLogs={false}
        />
        
        <Box>
          <Typography variant="body2" fontWeight="bold">
            {productName || 'Unknown Product'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {productId}
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
            <Chip 
              label={imageLoaded ? 'Loaded' : 'Not Loaded'} 
              size="small" 
              color={imageLoaded ? 'success' : 'default'}
            />
            {imageError && (
              <Chip 
                label="Error" 
                size="small" 
                color="error"
              />
            )}
          </Box>
        </Box>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" display="block" fontWeight="bold">
            Image Path Details:
          </Typography>
          <Typography variant="caption" display="block" fontFamily="monospace">
            Original: {imagePath || 'null/undefined'}
          </Typography>
          <Typography variant="caption" display="block" fontFamily="monospace">
            Formatted: {formattedUrl}
          </Typography>
          <Typography variant="caption" display="block" fontFamily="monospace">
            Status: {imageLoaded ? '✅ Loaded' : imageError ? '❌ Error' : '⏳ Loading'}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
};

export default ImageDebug;
