import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';

const LoadingProgress = ({ message = 'Đang tải...', size = 40 }) => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: 200
      }}
    >
      <CircularProgress size={size} />
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ mt: 2 }}
      >
        {message}
      </Typography>
    </Box>
  );
};

export default LoadingProgress;
