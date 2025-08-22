import React from 'react';
import { 
  Box, 
  Alert, 
  AlertTitle, 
  Button, 
  Typography 
} from '@mui/material';
import { Error, Refresh } from '@mui/icons-material';

const ErrorDisplay = ({ 
  error, 
  onRetry,
  title = 'Đã xảy ra lỗi',
  showRetry = true
}) => {
  return (
    <Box sx={{ my: 2 }}>
      <Alert 
        severity="error"
        icon={<Error fontSize="large" />}
        action={
          showRetry && (
            <Button
              color="error"
              size="small"
              startIcon={<Refresh />}
              onClick={onRetry}
            >
              Thử lại
            </Button>
          )
        }
      >
        <AlertTitle>{title}</AlertTitle>
        <Typography variant="body2">
          {error?.message || error || 'Không thể tải dữ liệu. Vui lòng thử lại sau.'}
        </Typography>
      </Alert>
    </Box>
  );
};

export default ErrorDisplay;
