import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TransactionCard from '../components/TransactionCard';

// MUI Components
import {
  Container,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Box,
  CircularProgress,
  Alert,
  Fab,
  InputAdornment
} from '@mui/material';

// MUI Icons
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';

// *** MODIFICATION: Define the static category list ***
const categories = [
  "Rent", 
  "Electricity", 
  "Groceries", 
  "Personal Care", 
  "Health Insurance", 
  "Loan", 
  "Others"
];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });
  // *** MODIFICATION: Removed useState for categories ***

  // Fetch transactions and categories on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch transactions
        const transactionsResponse = await api.get('/api/transactions');
        setTransactions(transactionsResponse.data.data);
        setFilteredTransactions(transactionsResponse.data.data); 

        // *** MODIFICATION: Removed categories fetch ***

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters whenever filters or transactions change
  useEffect(() => {
    let filtered = [...transactions];

    // Filter by type
    if (filters.type !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === filters.type);
    }

    // Filter by category
    if (filters.category !== 'all') {
      filtered = filtered.filter(transaction => transaction.category === filters.category);
    }

    // Filter by search term
    if (filters.search) {
      filtered = filtered.filter(transaction =>
        transaction.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        transaction.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    // Sort transactions
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.date) - new Date(b.date);
          break;
        case 'amount':
          comparison = a.amount - b.amount;
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        default:
          comparison = new Date(a.date) - new Date(b.date);
      }

      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });

    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleDeleteTransaction = async (transactionId) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) {
      return;
    }

    try {
      await api.delete(`/api/transactions/${transactionId}`);
      
      // Remove the deleted transaction from state
      setTransactions(prev => prev.filter(transaction => transaction._id !== transactionId));
      
      // Show success message
      setError('');
    } catch (err) {
      console.error('Error deleting transaction:', err);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  const clearFilters = () => {
    setFilters({
      type: 'all',
      category: 'all',
      search: '',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Transactions
        </Typography>
        <Button
          component={Link}
          to="/add-transaction"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add Transaction
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters Section */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Type"
            value={filters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="expense">Expense</MenuItem>
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="all">All Categories</MenuItem>
            {/* *** MODIFICATION: Mapped over static list *** */}
            {categories.map(category => (
              <MenuItem key={category} value={category}>{category}</MenuItem>
            ))}
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Sort By"
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="date">Date</MenuItem>
            <MenuItem value="amount">Amount</MenuItem>
            <MenuItem value="category">Category</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            label="Order"
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="desc">Newest First</MenuItem>
            <MenuItem value="asc">Oldest First</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} md={8}>
          <TextField
            label="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            fullWidth
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <Button
            onClick={clearFilters}
            variant="outlined"
            fullWidth
            sx={{ height: '40px' }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {/* Transactions List */}
      {filteredTransactions.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {transactions.length === 0 ? 'No transactions found' : 'No transactions match your filters'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {transactions.length === 0 
              ? 'Start by adding your first transaction!' 
              : 'Try adjusting your filters or search terms.'}
          </Typography>
        </Box>
      ) : (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </Typography>
          
          <Grid container spacing={2}>
            {filteredTransactions.map((transaction) => (
              <Grid item xs={12} sm={6} md={4} key={transaction._id}>
                <TransactionCard
                  transaction={transaction}
                  onDelete={handleDeleteTransaction}
                />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Floating Action Button for Add Transaction */}
      <Fab
        color="primary"
        aria-label="add transaction"
        component={Link}
        to="/add-transaction"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
      >
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default TransactionsPage;