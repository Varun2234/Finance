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
      elevation={3}
      sx={{
        p: 2.5,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderLeft: 6,
        borderColor: isIncome ? 'success.main' : 'error.main',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 6px 20px rgba(0,0,0,0.12)',
        },
        backgroundColor: 'background.paper',
      }}
    >
      {/* Delete Button */}
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Tooltip title="Delete Transaction">
          <IconButton size="small" onClick={() => onDelete(_id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={1}>
        {/* Icon */}
        <Grid
          item
          xs={2}
          sm={1}
          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          {isIncome ? (
            <TrendingUpIcon sx={{ color: 'success.main', fontSize: 28 }} />
          ) : (
            <TrendingDownIcon sx={{ color: 'error.main', fontSize: 28 }} />
          )}
        </Grid>

        {/* Description */}
        <Grid item xs={10} sm={11}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 500 }}
          >
            {category}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              wordBreak: 'break-word',
              fontFamily: 'Inter, sans-serif',
              fontWeight: 600,
              mt: 0.3,
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
              mt: 1.5,
              px: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: isIncome ? 'success.dark' : 'error.dark',
                fontFamily: 'JetBrains Mono, monospace',
                fontWeight: 600,
                letterSpacing: '0.02em',
                backgroundColor: isIncome ? 'rgba(56, 142, 60, 0.1)' : 'rgba(211, 47, 47, 0.1)',
                px: 1.5,
                py: 0.5,
                borderRadius: 1.2,
              }}
            >
              {isIncome ? '+' : '-'}
              {formatCurrency(amount)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: 'Inter, sans-serif' }}
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
