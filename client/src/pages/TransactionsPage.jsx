import React from 'react';

// MUI Components
import {
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/material';

// MUI Icons
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const TransactionCard = ({ transaction, onDelete }) => {
  const { _id, type, description, category, amount, date } = transaction;

  const isIncome = type === 'income';
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

  return (
    <Card variant="outlined">
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
          {/* Left Side: Details */}
          <Box>
            <Typography variant="h6" component="div" gutterBottom>
              {description}
            </Typography>
            <Chip 
              label={category}
              size="small" 
              sx={{ mb: 1, backgroundColor: '#f0f0f0' }} 
            />
            <Typography variant="body2" color="text.secondary">
              {formattedDate}
            </Typography>
          </Box>

          {/* Right Side: Amount and Actions */}
          <Box textAlign="right">
            <Typography
              variant="h6"
              component="div"
              color={isIncome ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
            >
              {isIncome ? <TrendingUpIcon sx={{ mr: 0.5 }}/> : <TrendingDownIcon sx={{ mr: 0.5 }}/>}
              {formattedAmount}
            </Typography>
            <Tooltip title="Delete Transaction">
              <IconButton
                aria-label="delete"
                onClick={() => onDelete(_id)}
                size="small"
                sx={{ mt: 1 }}
              >
                <DeleteIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
