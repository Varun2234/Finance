import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TransactionCard from '../components/TransactionCard';
import { motion } from 'framer-motion';

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
  InputAdornment,
  Paper,
  Chip
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

const categories = ["Rent", "Electricity", "Groceries", "Personal Care", "Health Insurance", "Loan", "Others"];

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/api/transactions');
        setTransactions(res.data.data);
        setFilteredTransactions(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...transactions];
    if (filters.type !== 'all') filtered = filtered.filter(t => t.type === filters.type);
    if (filters.category !== 'all') filtered = filtered.filter(t => t.category === filters.category);
    if (filters.search) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    filtered.sort((a, b) => {
      let comp = 0;
      switch (filters.sortBy) {
        case 'date': comp = new Date(a.date) - new Date(b.date); break;
        case 'amount': comp = a.amount - b.amount; break;
        case 'category': comp = a.category.localeCompare(b.category); break;
        default: comp = new Date(a.date) - new Date(b.date);
      }
      return filters.sortOrder === 'desc' ? -comp : comp;
    });
    setFilteredTransactions(filtered);
  }, [transactions, filters]);

  const handleFilterChange = (name, value) => setFilters(prev => ({ ...prev, [name]: value }));

  const handleDeleteTransaction = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    try {
      await api.delete(`/api/transactions/${id}`);
      setTransactions(prev => prev.filter(t => t._id !== id));
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to delete transaction. Please try again.');
    }
  };

  const clearFilters = () => setFilters({ type: 'all', category: 'all', search: '', sortBy: 'date', sortOrder: 'desc' });

  const totalAmount = filteredTransactions.reduce((sum, t) => t.type === 'income' ? sum + t.amount : sum - t.amount, 0);
  const totalIncome = filteredTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = filteredTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const formatCurrency = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => (key !== 'sortBy' && key !== 'sortOrder') && (key === 'search' ? val.trim() !== '' : val !== 'all')).length;

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Transactions</Typography>
            <Typography variant="body1" color="text.secondary">Manage and track your financial transactions</Typography>
          </Box>
          <Button component={Link} to="/add-transaction" variant="contained" startIcon={<AddIcon />} sx={{ fontWeight: 600 }}>
            Add Transaction
          </Button>
        </Box>
      </motion.div>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Total Balance</Typography>
            <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600, color: totalAmount >= 0 ? 'success.main' : 'error.main' }}>
              {formatCurrency(totalAmount)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Total Income</Typography>
            <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600, color: 'success.main' }}>
              {formatCurrency(totalIncome)}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>Total Expenses</Typography>
            <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600, color: 'error.main' }}>
              {formatCurrency(totalExpense)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Filters & Search</Typography>
          {activeFiltersCount > 0 && <Chip label={`${activeFiltersCount} active`} size="small" color="primary" sx={{ ml: 2 }} />}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Type" value={filters.type} onChange={e => handleFilterChange('type', e.target.value)} fullWidth size="small">
              <MenuItem value="all">All Types</MenuItem>
              <MenuItem value="income">Income</MenuItem>
              <MenuItem value="expense">Expense</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Category" value={filters.category} onChange={e => handleFilterChange('category', e.target.value)} fullWidth size="small">
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Sort By" value={filters.sortBy} onChange={e => handleFilterChange('sortBy', e.target.value)} fullWidth size="small">
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="category">Category</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField select label="Order" value={filters.sortOrder} onChange={e => handleFilterChange('sortOrder', e.target.value)} fullWidth size="small">
              <MenuItem value="desc">Newest First</MenuItem>
              <MenuItem value="asc">Oldest First</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={8}>
            <TextField
              label="Search transactions..."
              value={filters.search}
              onChange={e => handleFilterChange('search', e.target.value)}
              fullWidth
              size="small"
              placeholder="Search by description or category..."
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <Button onClick={clearFilters} variant="outlined" fullWidth sx={{ height: 40, fontWeight: 500 }}>
              Clear All Filters
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {filteredTransactions.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
            {transactions.length === 0 ? 'No transactions found' : 'No transactions match your filters'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            {transactions.length === 0
              ? 'Start by adding your first transaction to track your finances!'
              : 'Try adjusting your filters or search terms to find what you\'re looking for.'}
          </Typography>
          {transactions.length === 0 && (
            <Button component={Link} to="/add-transaction" variant="contained" startIcon={<AddIcon />} sx={{ fontWeight: 600 }}>
              Add Your First Transaction
            </Button>
          )}
        </Paper>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </Typography>
            <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: 'text.secondary' }}>
              Net: {formatCurrency(totalAmount)}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {filteredTransactions.map(t => (
              <Grid item xs={12} sm={6} md={4} key={t._id}>
                <TransactionCard transaction={t} onDelete={handleDeleteTransaction} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <Fab color="primary" aria-label="add transaction" component={Link} to="/add-transaction" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
        <AddIcon />
      </Fab>
    </Container>
  );
};

export default TransactionsPage;
