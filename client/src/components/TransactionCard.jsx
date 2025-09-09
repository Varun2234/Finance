import React from 'react';
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Grid,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount || 0);

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const TransactionCard = ({ transaction, onDelete }) => {
  if (!transaction || !transaction._id) return null;

  const { _id, type, amount, category, description, date } = transaction;
  const isIncome = type === 'income';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(139, 90, 150, 0.15)',
          background: 'rgba(255, 255, 255, 0.95)',
        },
      }}
    >
      {/* Delete Button */}
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <Tooltip title="Delete Transaction">
          <IconButton 
            size="small" 
            onClick={() => onDelete(_id)}
            sx={{
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              color: '#F44336',
              '&:hover': {
                bgcolor: 'rgba(244, 67, 54, 0.2)',
                transform: 'scale(1.1)'
              },
              transition: 'all 0.2s ease'
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={2}>
        {/* Icon */}
        <Grid
          item
          xs={2}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: isIncome 
                ? 'linear-gradient(135deg, #00D4AA 0%, #00C49F 100%)'
                : 'linear-gradient(135deg, #FF6B9D 0%, #FF8A80 100%)',
              boxShadow: isIncome
                ? '0 4px 12px rgba(0, 212, 170, 0.3)'
                : '0 4px 12px rgba(255, 107, 157, 0.3)'
            }}
          >
            {isIncome ? (
              <TrendingUpIcon sx={{ color: 'white', fontSize: 24 }} />
            ) : (
              <TrendingDownIcon sx={{ color: 'white', fontSize: 24 }} />
            )}
          </Box>
        </Grid>

        {/* Description */}
        <Grid item xs={10}>
          <Typography
            variant="caption"
            sx={{ 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: 600,
              color: '#8B5A96',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.7rem'
            }}
          >
            {category}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              wordBreak: 'break-word',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 700,
              mt: 0.5,
              color: '#2D1B40',
              lineHeight: 1.3
            }}
          >
            {description}
          </Typography>
        </Grid>

        {/* Amount and Date */}
        <Grid item xs={12}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2,
              p: 2,
              borderRadius: 3,
              background: isIncome 
                ? 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 196, 159, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(255, 107, 157, 0.1) 0%, rgba(255, 138, 128, 0.1) 100%)'
            }}
          >
            <Typography
              variant="h5"
              sx={{
                color: isIncome ? '#00D4AA' : '#FF6B9D',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 700,
                letterSpacing: '0.02em',
              }}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(amount)}
            </Typography>
            <Typography
              variant="body2"
              sx={{ 
                fontFamily: 'Inter, sans-serif',
                color: '#8B5A96',
                fontWeight: 500
              }}
            >
              {formatDate(date)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionCard;