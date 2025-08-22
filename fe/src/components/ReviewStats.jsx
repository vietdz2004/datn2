import React from 'react';
import {
  Box,
  Typography,
  LinearProgress,
  Rating,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import { Star } from '@mui/icons-material';

const ReviewStats = ({ stats, avgRating, totalReviews }) => {
  if (!stats || totalReviews === 0) {
    return (
      <Card sx={{ mb: 3, bgcolor: '#f9f9f9' }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Thống kê đánh giá
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Chưa có đánh giá nào cho sản phẩm này
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const ratingDistribution = stats.ratingDistribution || {};

  return (
    <Card sx={{ mb: 3, bgcolor: '#f9f9f9' }}>
      <CardContent>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
          Thống kê đánh giá
        </Typography>
        
        <Grid container spacing={3}>
          {/* Tổng quan */}
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: 'center', p: 2 }}>
              <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                {avgRating}
              </Typography>
              <Rating 
                value={parseFloat(avgRating)} 
                readOnly 
                precision={0.1}
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                {totalReviews} đánh giá
              </Typography>
            </Box>
          </Grid>

          {/* Phân bố sao */}
          <Grid item xs={12} md={8}>
            <Box>
              {[5, 4, 3, 2, 1].map((stars) => {
                const data = ratingDistribution[stars] || { count: 0, percentage: 0 };
                return (
                  <Box key={stars} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', width: 60 }}>
                      <Typography variant="body2" sx={{ mr: 1 }}>
                        {stars}
                      </Typography>
                      <Star sx={{ fontSize: '1rem', color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ flex: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={data.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: 'primary.main'
                          }
                        }}
                      />
                    </Box>
                    <Typography variant="body2" sx={{ minWidth: 40, textAlign: 'right' }}>
                      {data.count}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ReviewStats;
