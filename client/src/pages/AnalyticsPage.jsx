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
  Button
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

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  // Fetch summary data from the backend
  const fetchSummary = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      
      const params = { ...appliedFilters };
      // Remove empty filter values so they aren't sent
      if (!params.startDate) delete params.startDate;
      if (!params.endDate) delete params.endDate;
      
      const response = await api.get('/api/transactions/summary', { params });
      setData(response.data);
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

  const barChartData = formatMonthlyDataForBarChart(data?.monthlyTrends);
  const pieChartData = data?.categoryBreakdown || [];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Financial Analytics
      </Typography>

      {/* Filter Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="flex-end">
          <Grid item xs={12} sm={4}>
            <TextField label="Start Date" type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} fullWidth InputLabelProps={{ shrink: true }}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField label="End Date" type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} fullWidth InputLabelProps={{ shrink: true }}/>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button variant="contained" onClick={applyFilters} fullWidth>Apply Filters</Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Top Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Total Income</Typography>
                <Typography variant="h5" color="success.main">{formatCurrency(data?.summary.find(s => s._id === 'income')?.total)}</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Total Expenses</Typography>
                <Typography variant="h5" color="error.main">{formatCurrency(data?.summary.find(s => s._id === 'expense')?.total)}</Typography>
            </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="subtitle1" color="text.secondary">Net Balance</Typography>
                <Typography variant="h5" color={data?.netIncome >= 0 ? 'info.main' : 'error.main'}>{formatCurrency(data?.netIncome)}</Typography>
            </Paper>
        </Grid>
      </Grid>
      
      {/* Charts */}
      <Grid container spacing={3}>
        {/* Expense Category Breakdown (Pie Chart) */}
        <Grid item xs={12} lg={5}>
          <Paper sx={{ p: 2, height: 450 }}>
            <Typography variant="h6" gutterBottom>Expense Breakdown</Typography>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie data={pieChartData} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : <Typography sx={{ textAlign: 'center', pt: 10 }}>No expense data for this period.</Typography>}
          </Paper>
        </Grid>

        {/* Monthly Trends (Bar Chart) */}
        <Grid item xs={12} lg={7}>
          <Paper sx={{ p: 2, height: 450 }}>
            <Typography variant="h6" gutterBottom>Monthly Income vs. Expense</Typography>
            {barChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#1E88E5" />
                <Bar dataKey="expense" fill="#E53935" />
              </BarChart>
            </ResponsiveContainer>
             ) : <Typography sx={{ textAlign: 'center', pt: 10 }}>No monthly data available for this period.</Typography>}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AnalyticsPage;

