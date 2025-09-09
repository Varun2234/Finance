import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
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
  Chip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

const categories = ["Rent", "Electricity", "Groceries", "Personal Care", "Health Insurance", "Loan", "Others"];

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    category: 'all',
    search: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netBalance: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.get('/api/transactions', {
          params: {
            page,
            limit: 10,
            sort: `${filters.sortOrder === 'desc' ? '-' : ''}${filters.sortBy}`,
            type: filters.type !== 'all' ? filters.type : undefined,
            category: filters.category !== 'all' ? filters.category : undefined,
            search: filters.search || undefined
          }
        });
        setTransactions(res.data.data);
        setTotalPages(res.data.pages);

        // Calculate summary from the fetched data
        const totalIncome = res.data.data.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = res.data.data.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        const netBalance = totalIncome - totalExpense;
        setSummary({ totalIncome, totalExpense, netBalance });

      } catch (err) {
        console.error(err);
        setError('Failed to load transactions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, filters]);

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1);
  };

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

  const clearFilters = () => {
    setFilters({ type: 'all', category: 'all', search: '', sortBy: 'date', sortOrder: 'desc' });
    setPage(1);
  };

  const formatCurrency = amount => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const activeFiltersCount = Object.entries(filters).filter(([key, val]) => (key !== 'sortBy' && key !== 'sortOrder') && (key === 'search' ? val.trim() !== '' : val !== 'all')).length;

  // Determine colors based on summary values
  const totalIncomeColor = '#4CAF50'; // green
  const totalExpensesColor = '#F44336'; // red
  const netBalanceColor = summary.netBalance >= 0 ? '#4CAF50' : '#F44336';

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}><CircularProgress /></Box>;

  return (
    <Container maxWidth="lg" sx={{ 
      mt: 4, 
      mb: 4, 
      // Increased gradient intensity
      backgroundImage: 'linear-gradient(135deg, #B19CD9 0%, #9A7FB5 50%, #87CEEB 100%)', 
      backgroundAttachment: 'fixed', 
      borderRadius: '12px', 
      boxShadow: '0 8px 32px 0 rgba(0,0,0,0.1)' 
    }}>
      <Box sx={{ p: 4, color: '#333' }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>Transactions</Typography>
              <Typography variant="body1" color="text.secondary">Manage and track your financial transactions</Typography>
            </Box>
            <Button component={Link} to="/add-transaction" variant="contained" startIcon={<AddIcon />} sx={{ fontWeight: 600, backgroundColor: '#9370DB', '&:hover': { backgroundColor: '#8A2BE2' } }}>
              Add Transaction
            </Button>
          </Box>
        </motion.div>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Total Balance Card */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{
              p: 3, 
              textAlign: 'center', 
              bgcolor: netBalanceColor, 
              color: 'white' 
            }}>
              <Typography variant="h6" gutterBottom>Total Balance</Typography>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600 }}>
                {formatCurrency(summary.netBalance)}
              </Typography>
            </Paper>
          </Grid>
          {/* Total Income Card */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{
              p: 3, 
              textAlign: 'center', 
              bgcolor: totalIncomeColor, 
              color: 'white' 
            }}>
              <Typography variant="h6" gutterBottom>Total Income</Typography>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600 }}>
                {formatCurrency(summary.totalIncome)}
              </Typography>
            </Paper>
          </Grid>
          {/* Total Expenses Card */}
          <Grid item xs={12} sm={4}>
            <Paper sx={{
              p: 3, 
              textAlign: 'center', 
              bgcolor: totalExpensesColor, 
              color: 'white' 
            }}>
              <Typography variant="h6" gutterBottom>Total Expenses</Typography>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '1.5rem', fontWeight: 600 }}>
                {formatCurrency(summary.totalExpense)}
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

        {transactions.length === 0 ? (
          <Paper sx={{ p: 8, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
              No transactions found
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first transaction to track your finances!
            </Typography>
            <Button component={Link} to="/add-transaction" variant="contained" startIcon={<AddIcon />} sx={{ fontWeight: 600 }}>
              Add Your First Transaction
            </Button>
          </Paper>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
                Page {page} of {totalPages}
              </Typography>
              <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.875rem', color: 'text.secondary' }}>
                Net: {formatCurrency(summary.netBalance)}
              </Typography>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><b>Description</b></TableCell>
                    <TableCell><b>Date</b></TableCell>
                    <TableCell><b>Category</b></TableCell>
                    <TableCell><b>Type</b></TableCell>
                    <TableCell align="right"><b>Amount</b></TableCell>
                    <TableCell align="center"><b>Actions</b></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map(t => (
                    <TableRow key={t._id}>
                      <TableCell>{t.description}</TableCell>
                      <TableCell>{new Date(t.date).toLocaleDateString()}</TableCell>
                      <TableCell>{t.category}</TableCell>
                      <TableCell sx={{ color: t.type === 'income' ? '#4CAF50' : '#F44336', fontWeight: 600 }}>
                        {t.type}
                      </TableCell>
                      <TableCell align="right" sx={{ fontFamily: 'JetBrains Mono, monospace' }}>
                        {formatCurrency(t.amount)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          component={Link}
                          to={`/edit-transaction/${t._id}`}
                          variant="outlined"
                          color="info"
                          size="small"
                          sx={{ mr: 1 }}
                        >
                          <EditIcon sx={{ fontSize: 16 }} />
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => handleDeleteTransaction(t._id)}
                        >
                          <DeleteIcon sx={{ fontSize: 16 }} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          </>
        )}

        <Fab color="primary" aria-label="add transaction" component={Link} to="/add-transaction" sx={{ position: 'fixed', bottom: 16, right: 16 }}>
          <AddIcon />
        </Fab>
      </Box>
    </Container>
  );
};

export default TransactionsPage;