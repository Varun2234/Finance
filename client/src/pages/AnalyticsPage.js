import React, { useState, useEffect } from 'react';
import { transactionService } from '../services/transactionService';
import LoadingSpinner from '../components/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#D946EF', '#6B7280'];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError('');
      const query = {};
      if (filters.startDate && filters.endDate) {
        query.startDate = filters.startDate;
        query.endDate = filters.endDate;
      }
      const summaryData = await transactionService.getSummary(query);
      setData(summaryData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch on initial load

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };
  
  const applyFilters = () => {
    fetchSummary();
  };

  // Helper to process monthly data for the bar chart
  const formatMonthlyDataForBarChart = (trends = []) => {
    const months = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    trends.forEach(trend => {
      const monthYear = `${monthNames[trend._id.month - 1]} ${trend._id.year}`;
      if (!months[monthYear]) {
        months[monthYear] = { name: monthYear, income: 0, expense: 0, year: trend._id.year, month: trend._id.month };
      }
      months[monthYear][trend._id.type] = trend.total;
    });

    return Object.values(months).sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
  };

  if (loading) {
    return <LoadingSpinner size="large" text="Loading analytics..." />;
  }

  if (error) {
    return <p className="text-center text-red-600 mt-10">{error}</p>;
  }

  const chartData = formatMonthlyDataForBarChart(data?.monthlyTrends);
  const incomeTotal = data?.summary.find(s => s._id === 'income')?.total || 0;
  const expenseTotal = data?.summary.find(s => s._id === 'expense')?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
       <p className="mt-1 text-sm text-gray-600 mb-6">
          Visualize your financial habits and trends.
       </p>

       {/* Filter Section */}
       <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>
          <button
            onClick={applyFilters}
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

       {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Income</dt>
            <dd className="text-2xl font-semibold text-green-600">{formatCurrency(incomeTotal)}</dd>
        </div>
         <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
            <dd className="text-2xl font-semibold text-red-600">{formatCurrency(expenseTotal)}</dd>
        </div>
         <div className="bg-white overflow-hidden shadow rounded-lg p-5">
            <dt className="text-sm font-medium text-gray-500 truncate">Net Balance</dt>
            <dd className={`text-2xl font-semibold ${data.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(data.netIncome)}
            </dd>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category Breakdown (Pie Chart) */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-2">
           <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Category Breakdown</h3>
           {data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="total"
                    nameKey="_id"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    fill="#8884d8"
                    labelLine={true}
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend layout="horizontal" align="center" verticalAlign="bottom" wrapperStyle={{ paddingTop: '20px' }} />
                </PieChart>
              </ResponsiveContainer>
           ) : (
            <p className="text-center text-gray-500 py-20">No expense data for this period.</p>
           )}
        </div>

        {/* Monthly Trends (Bar Chart) */}
        <div className="bg-white shadow rounded-lg p-6 lg:col-span-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Income vs. Expense</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(value) => `$${value/1000}k`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend verticalAlign="top" />
                <Bar dataKey="income" fill="#10B981" />
                <Bar dataKey="expense" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <p className="text-center text-gray-500 py-20">No monthly data available for this period.</p>
          )}
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;