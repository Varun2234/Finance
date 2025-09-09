import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';

const COLORS = ['#A78BFA', '#D8B4FE', '#C4B5FD', '#818CF8', '#6366F1', '#D1D5DB', '#E9D5FF', '#4F46E5', '#312E81'];

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const StatCard = ({ title, value, type }) => {
  const isPositive = type === 'net' ? (parseFloat(value.replace(/[^0-9.-]+/g,"")) >= 0) : null;
  const cardColor = type === 'income' ? 'bg-green-100 border-green-400' : type === 'expense' ? 'bg-red-100 border-red-400' : isPositive ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`rounded-lg shadow p-5 text-center flex flex-col justify-center items-center border ${cardColor}`}
    >
      <div className="text-gray-600 font-inter mb-1 font-medium">{title}</div>
      <div className="text-2xl font-bold font-jetbrains text-gray-800">{value}</div>
    </motion.div>
  );
};

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });

  const fetchSummary = async (appliedFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      const params = { ...appliedFilters };
      if (!params.startDate) delete params.startDate;
      if (!params.endDate) delete params.endDate;

      const summaryResponse = await api.get('/api/transactions/summary', { params });
      setData(summaryResponse.data);

      const transactionsResponse = await api.get('/api/transactions', { params: { limit: 10, sort: '-date' } });
      setRecentTransactions(transactionsResponse.data.data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSummary(); }, []);

  const handleFilterChange = (e) => setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const applyFilters = () => fetchSummary(filters);

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatMonthlyDataForBarChart = (trends = []) => {
    const months = {};
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    trends.forEach(trend => {
      const monthYear = `${monthNames[trend._id.month - 1]} '${String(trend._id.year).slice(2)}`;
      if (!months[monthYear]) months[monthYear] = { name: monthYear, income: 0, expense: 0, year: trend._id.year, month: trend._id.month };
      months[monthYear][trend._id.type] = trend.total;
    });
    return Object.values(months).sort((a, b) => a.year === b.year ? a.month - b.month : a.year - b.year);
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-200 h-12 w-12 mb-4"></div></div>;
  if (error) return <div className="m-4 text-center text-red-500">{error}</div>;

  const totalIncome = data?.summary.find(s => s._id === 'income')?.total || 0;
  const totalExpense = data?.summary.find(s => s._id === 'expense')?.total || 0;
  const netBalance = data?.netIncome || 0;

  const barChartData = formatMonthlyDataForBarChart(data?.monthlyTrends);
  const pieChartData = (data?.categoryBreakdown || []).filter(item => item._id && item._id.trim() !== '').sort((a, b) => b.total - a.total);

  return (
    <div className="min-h-screen font-sans" style={{ backgroundImage: 'linear-gradient(to bottom right, #A78BFA, #E5E7EB)' }}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-3xl font-bold tracking-tight text-gray-900 mb-6 font-inter"
        >
          Financial Analytics
        </motion.h1>

        {/* Filter Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white shadow"
        >
          <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border border-gray-300 rounded px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"/>
          <button onClick={applyFilters} className="bg-blue-600 text-white font-inter rounded px-4 py-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition">Apply Filters</button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <StatCard title="Total Income" value={formatCurrency(totalIncome)} type="income" />
          <StatCard title="Total Expenses" value={formatCurrency(totalExpense)} type="expense" />
          <StatCard title="Net Balance" value={formatCurrency(netBalance)} type="net" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-lg shadow p-4 h-[400px] bg-white"
          >
            <h2 className="font-semibold font-inter mb-2 text-gray-900">Expense Breakdown</h2>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <PieChart>
                  <Pie data={pieChartData} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={({ percent }) => `${(percent * 100).toFixed(1)}%`}>
                    {pieChartData.map((entry, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={value => formatCurrency(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400 font-inter">No expense data for this period.</div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-lg shadow p-4 h-[400px] bg-white"
          >
            <h2 className="font-semibold font-inter mb-2 text-gray-900">Monthly Income vs Expense</h2>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={value => `$${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={value => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="income" fill="#4CAF50" name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-gray-400 font-inter">No monthly data available for this period.</div>
            )}
          </motion.div>
        </div>

        {/* Income vs. Expense Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="rounded-lg shadow p-4 h-[400px] bg-white mb-6"
        >
          <h2 className="font-semibold font-inter mb-2 text-gray-900">Income vs. Expense</h2>
          {totalIncome > 0 || totalExpense > 0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Income', value: totalIncome },
                    { name: 'Expense', value: totalExpense },
                  ]}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  <Cell fill="#4CAF50" /> {/* Green for Income */}
                  <Cell fill="#EF4444" /> {/* Red for Expense */}
                </Pie>
                <Tooltip formatter={value => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400 font-inter">No income or expense data for this period.</div>
          )}
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="rounded-lg shadow p-4 bg-white"
        >
          <h2 className="font-semibold font-inter mb-2 text-gray-900">Recent Transactions</h2>
          {recentTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-inter font-semibold text-gray-600">Date</th>
                    <th className="px-4 py-2 text-left text-sm font-inter font-semibold text-gray-600">Description</th>
                    <th className="px-4 py-2 text-left text-sm font-inter font-semibold text-gray-600">Category</th>
                    <th className="px-4 py-2 text-right text-sm font-inter font-semibold text-gray-600">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentTransactions.slice(0, 5).map(tx => (
                    <tr key={tx._id}>
                      <td className="px-4 py-2 font-inter text-sm text-gray-800">{formatDate(tx.date)}</td>
                      <td className="px-4 py-2 font-inter text-sm text-gray-800">{tx.description}</td>
                      <td className="px-4 py-2 font-inter text-sm text-gray-800">{tx.category}</td>
                      <td className={`px-4 py-2 text-right font-jetbrains text-sm ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400 font-inter">
              <p>Recent transactions will appear here once you have transaction data.</p>
              <p className="mt-1">Add some transactions to see your recent activity!</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;