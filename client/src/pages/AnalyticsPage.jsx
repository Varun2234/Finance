import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Recharts Components for data visualization
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';

// MUI Components
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';

// Colors for the Pie Chart slices
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943', '#19D4FF'];

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
 * A reusable component for the top summary cards.
 */
const StatCard = ({ title, value, color, percentage }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h4" component="div" fontWeight="bold" color={`${color}.main`} sx={{ mb: 1 }}>
        {value}
      </Typography>
      {percentage && (
        <Typography variant="body2" color="text.secondary">
          {percentage}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const AnalyticsPage = () => {
  // State variables
  const [data, setData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch summary data and recent transactions from the backend
  const fetchSummary = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      
      const params = { ...appliedFilters };
      // Remove empty filter values so they aren't sent
      if (!params.startDate) delete params.startDate;
      if (!params.endDate) delete params.endDate;
      
      // Fetch summary data
      const summaryResponse = await api.get('/api/transactions/summary', { params });
      setData(summaryResponse.data);

      // Fetch recent transactions (last 10 transactions)
      const transactionsResponse = await api.get('/api/transactions', { 
        params: { limit: 10, sort: '-date' } 
      });
      setRecentTransactions(transactionsResponse.data.data || []);
      
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(); // Fetch on initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterChange = (e) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    fetchSummary(filters);
  };

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Helper to process monthly data for the bar chart
  const formatMonthlyDataForBarChart = (trends = []) => {
    const months = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    trends.forEach(trend => {
      const monthYear = `${monthNames[trend._id.month - 1]} '${String(trend._id.year).slice(2)}`;
      if (!months[monthYear]) {
        months[monthYear] = { name: monthYear, income: 0, expense: 0, year: trend._id.year, month: trend._id.month };
      }
      months[monthYear][trend._id.type] = trend.total;
    });
    
    // Sort chronologically
    return Object.values(months).sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
  };
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" sx={{ m: 4 }}>{error}</Alert>;
  }

  const totalIncome = data?.summary.find(s => s._id === 'income')?.total || 0;
  const totalExpense = data?.summary.find(s => s._id === 'expense')?.total || 0;
  const netBalance = data?.netIncome || 0;
  
  const barChartData = formatMonthlyDataForBarChart(data?.monthlyTrends);
  // Filter out null/undefined categories and sort by amount
  const pieChartData = (data?.categoryBreakdown || [])
    .filter(item => item._id && item._id.trim() !== '') // Remove null, undefined, or empty categories
    .sort((a, b) => b.total - a.total); // Sort by total amount descending

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Financial Analytics
      </Typography>

      {/* Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField 
              label="Start Date" 
              type="date" 
              name="startDate" 
              value={filters.startDate} 
              onChange={handleFilterChange} 
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField 
              label="End Date" 
              type="date" 
              name="endDate" 
              value={filters.endDate} 
              onChange={handleFilterChange} 
              fullWidth 
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={applyFilters} fullWidth>
              APPLY FILTERS
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Top Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Total Income"
            value={formatCurrency(totalIncome)}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Total Expenses"
            value={formatCurrency(totalExpense)}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard 
            title="Net Balance"
            value={formatCurrency(netBalance)}
            color={netBalance >= 0 ? 'info' : 'error'}
          />
        </Grid>
      </Grid>
      
      {/* Charts Section */}
      <Grid container spacing={3} mb={4}>
        {/* Expense Category Breakdown (Pie Chart) */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie 
                    data={pieChartData} 
                    dataKey="total" 
                    nameKey="_id" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={100} 
                    labelLine={false} 
                    label={({ _id, percent }) => `${(percent * 100).toFixed(1)}%`}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ textAlign: 'center', pt: 10 }}>No expense data for this period.</Typography>
            )}
          </Paper>
        </Grid>

        {/* Monthly Trends (Bar Chart) */}
        <Grid item xs={12} lg={6}>
          <Paper sx={{ p: 3, height: 400 }}>
            <Typography variant="h6" gutterBottom>Monthly Income vs. Expense</Typography>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#1E88E5" name="Income" />
                  <Bar dataKey="expense" fill="#E53935" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Typography sx={{ textAlign: 'center', pt: 10 }}>No monthly data available for this period.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Transactions Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
        {recentTransactions && recentTransactions.length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentTransactions.slice(0, 5).map((transaction) => (
                  <TableRow key={transaction._id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell align="right" sx={{ 
                      color: transaction.type === 'income' ? 'success.main' : 'error.main',
                      fontWeight: 'medium'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              Recent transactions will appear here once you have transaction data.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Add some transactions to see your recent activity!
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;