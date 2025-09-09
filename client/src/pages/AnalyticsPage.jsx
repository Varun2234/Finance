import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#0088FE','#00C49F','#FFBB28','#FF8042','#AF19FF','#FF1943','#19D4FF','#FFA500','#00CED1','#FF69B4'];

const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount || 0);

const StatCard = ({ title, value, color }) => (
  <div className="bg-white rounded-lg shadow p-5 text-center flex flex-col justify-center items-center">
    <div className="text-gray-500 font-inter mb-1">{title}</div>
    <div className={`text-2xl font-bold font-jetbrains ${color}`}>{value}</div>
  </div>
);

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
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    trends.forEach(trend => {
      const monthYear = `${monthNames[trend._id.month-1]} '${String(trend._id.year).slice(2)}`;
      if (!months[monthYear]) months[monthYear] = { name: monthYear, income:0, expense:0, year:trend._id.year, month:trend._id.month };
      months[monthYear][trend._id.type] = trend.total;
    });
    return Object.values(months).sort((a,b) => a.year===b.year?a.month-b.month:a.year-b.year);
  };

  if (loading) return <div className="flex justify-center items-center h-[80vh]"><div className="loader"></div></div>;
  if (error) return <div className="m-4 text-red-500">{error}</div>;

  const totalIncome = data?.summary.find(s => s._id==='income')?.total || 0;
  const totalExpense = data?.summary.find(s => s._id==='expense')?.total || 0;
  const netBalance = data?.netIncome || 0;

  const barChartData = formatMonthlyDataForBarChart(data?.monthlyTrends);
  const pieChartData = (data?.categoryBreakdown || []).filter(item => item._id && item._id.trim() !== '').sort((a,b) => b.total - a.total);

  return (
    <div className="container mx-auto my-6 px-4">
      <h1 className="text-3xl font-semibold mb-6 font-inter">Financial Analytics</h1>

      {/* Filter Section */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="border rounded px-3 py-2"/>
        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="border rounded px-3 py-2"/>
        <button onClick={applyFilters} className="bg-blue-600 text-white font-inter rounded px-4 py-2">Apply Filters</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard title="Total Income" value={formatCurrency(totalIncome)} color="text-green-600" />
        <StatCard title="Total Expenses" value={formatCurrency(totalExpense)} color="text-red-600" />
        <StatCard title="Net Balance" value={formatCurrency(netBalance)} color={netBalance>=0?'text-blue-600':'text-red-600'} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Pie Chart */}
        <div className="bg-white shadow rounded-lg p-4 h-[400px]">
          <h2 className="font-semibold font-inter mb-2">Expense Breakdown</h2>
          {pieChartData.length>0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie data={pieChartData} dataKey="total" nameKey="_id" cx="50%" cy="50%" outerRadius={100} label={({ percent }) => `${(percent*100).toFixed(1)}%`}>
                  {pieChartData.map((entry,index)=> <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={value => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400 font-inter">No expense data for this period.</div>
          )}
        </div>

        {/* Bar Chart */}
        <div className="bg-white shadow rounded-lg p-4 h-[400px]">
          <h2 className="font-semibold font-inter mb-2">Monthly Income vs Expense</h2>
          {barChartData.length>0 ? (
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={value => `$${(value/1000).toFixed(0)}k`} />
                <Tooltip formatter={value => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#1E88E5" name="Income"/>
                <Bar dataKey="expense" fill="#E53935" name="Expense"/>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex justify-center items-center h-full text-gray-400 font-inter">No monthly data available for this period.</div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold font-inter mb-2">Recent Transactions</h2>
        {recentTransactions.length>0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-inter font-semibold">Date</th>
                  <th className="px-4 py-2 text-left font-inter font-semibold">Description</th>
                  <th className="px-4 py-2 text-left font-inter font-semibold">Category</th>
                  <th className="px-4 py-2 text-right font-inter font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentTransactions.slice(0,5).map(tx => (
                  <tr key={tx._id}>
                    <td className="px-4 py-2 font-inter">{formatDate(tx.date)}</td>
                    <td className="px-4 py-2 font-inter">{tx.description}</td>
                    <td className="px-4 py-2 font-inter">{tx.category}</td>
                    <td className={`px-4 py-2 text-right font-jetbrains ${tx.type==='income'?'text-green-600':'text-red-600'}`}>
                      {tx.type==='income' ? '+' : '-'}{formatCurrency(tx.amount)}
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
      </div>
    </div>
  );
};

export default AnalyticsPage;
