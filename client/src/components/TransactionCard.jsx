import React from 'react';

// MUI Components
import {
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Grid
} from '@mui/material';

// MUI Icons
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

/**
 * A utility function to format currency numbers.
 */
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount || 0);
};

/**
 * A utility function to format dates.
 */
const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const TransactionCard = ({ transaction, onDelete }) => {
  // Guard clause to prevent rendering if the transaction prop is invalid.
  if (!transaction || !transaction._id) {
    console.warn("TransactionCard received an invalid transaction prop:", transaction);
    return null; 
  }

  const { _id, type, amount, category, description, date } = transaction;
  const isIncome = type === 'income';

  return (
    <Paper 
      elevation={2} 
      sx={{ 
        p: 2, 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        borderLeft: 5,
        borderColor: isIncome ? 'success.main' : 'error.main'
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Tooltip title="Delete Transaction">
          <IconButton size="small" onClick={() => onDelete(_id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={1}>
        <Grid item xs={2} sm={1} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isIncome ? 
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: '2rem' }} /> : 
            <TrendingDownIcon sx={{ color: 'error.main', fontSize: '2rem' }} />
          }
        </Grid>
        <Grid item xs={10} sm={11}>
          <Typography variant="body2" color="text.secondary" gutterBottom sx={{
            fontFamily: 'Inter, sans-serif'
          }}>
            {category}
          </Typography>
          <Typography variant="h6" component="p" sx={{ 
            wordBreak: 'break-word',
            fontFamily: 'Inter, sans-serif'
          }}>
            {description}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1, px: 1 }}>
            <Typography variant="h6" sx={{ 
              color: isIncome ? 'success.dark' : 'error.dark',
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 500,
              letterSpacing: '0.02em'
            }}>
              {formatCurrency(amount)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{
              fontFamily: 'Inter, sans-serif'
            }}>
              {formatDate(date)}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default TransactionCard;