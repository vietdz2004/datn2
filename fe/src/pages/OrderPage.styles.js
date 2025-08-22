export const styles = {
  container: {
    py: 4
  },
  loadingContainer: {
    py: 4,
    textAlign: 'center'
  },
  loadingText: {
    mt: 2
  },
  errorContainer: {
    py: 4
  },
  errorButton: {
    mb: 2
  },
  emptyState: {
    p: 6,
    textAlign: 'center',
    borderRadius: 2,
    bgcolor: 'background.paper',
    boxShadow: 1
  },
  emptyStateIcon: {
    fontSize: 60,
    color: 'text.disabled',
    mb: 2
  },
  emptyStateText: {
    color: 'text.secondary',
    mb: 2,
    fontWeight: 500
  },
  emptyStateButton: {
    mt: 2,
    textTransform: 'none',
    fontWeight: 500
  },
  orderCard: {
    borderRadius: 2,
    boxShadow: (theme) => 
      `0 0 20px ${theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(145, 158, 171, 0.2)'}`,
    border: '1px solid',
    borderColor: 'divider'
  },
  orderHeader: {
    p: 3,
    borderBottom: '1px solid',
    borderColor: 'divider',
    bgcolor: 'background.neutral'
  },
  orderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    fontWeight: 600
  },
  orderStatus: {
    fontWeight: 500,
    '& .MuiChip-icon': {
      fontSize: '1.2rem'
    }
  },
  orderDate: {
    display: 'flex',
    alignItems: 'center',
    gap: 0.5
  },
  productList: {
    p: 0
  },
  productItem: {
    py: 2,
    px: 3,
    borderBottom: '1px solid',
    borderColor: 'divider',
    '&:last-child': {
      borderBottom: 'none'
    }
  },
  productContent: {
    display: 'flex',
    alignItems: 'flex-start',
    width: '100%'
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: 1,
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    mr: 2,
    flexShrink: 0,
    bgcolor: 'background.paper'
  },
  productDetails: {
    flexGrow: 1
  },
  productName: {
    fontWeight: 600,
    mb: 1
  },
  productPrice: {
    display: 'flex',
    alignItems: 'center',
    mb: 1
  },
  price: {
    fontWeight: 600,
    mr: 1,
    color: 'primary.main'
  },
  quantity: {
    color: 'text.secondary'
  },
  total: {
    color: 'text.secondary'
  }
};
