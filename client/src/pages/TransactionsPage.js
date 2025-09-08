import React, { useState, useEffect } from 'react';
import TransactionCard from '../components/TransactionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { transactionService } from '../services/transactionService';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '' // 'income', 'expense', or '' (all)
  });

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError('');

      const queryParams = {
        page: currentPage,
        limit: 10
      };

      if (filters.startDate && filters.endDate) {
        queryParams.startDate = filters.startDate;
        queryParams.endDate = filters.endDate;
      }
      if (filters.type) {
        queryParams.type = filters.type;
      }

      const data = await transactionService.getTransactions(queryParams);
      
      setTransactions(data.transactions);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setHasNextPage(data.hasNextPage);
      setHasPrevPage(data.hasPrevPage);

    } catch (err) {
      setError('Failed to fetch transactions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]); // Refetch only when page changes

  const handleFilterChange = (e) => {
    setFilters(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const applyFilters = () => {
    setCurrentPage(1); // Reset to first page when filters are applied
    fetchTransactions();
  };

  const resetFilters = () => {
     setFilters({ startDate: '', endDate: '', type: '' });
     setCurrentPage(1);
     // Trigger refetch after state update
     setTimeout(fetchTransactions, 0);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await transactionService.deleteTransaction(id);
        // Refetch or filter locally
        setTransactions(prev => prev.filter(tx => tx._id !== id));
        // Optionally, refetch all data to update totals/pagination if needed
        // fetchTransactions(); 
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError('Failed to delete transaction.');
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
        <p className="mt-1 text-sm text-gray-600">
          View, filter, and manage your transactions.
        </p>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">All</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={applyFilters}
              className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply
            </button>
             <button
              onClick={resetFilters}
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {error && <div className="text-red-600 text-center mb-4">{error}</div>}

      {/* Transactions List */}
      {loading ? (
        <LoadingSpinner text="Fetching transactions..." />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {transactions.length > 0 ? (
              transactions.map(tx => (
                <TransactionCard 
                  key={tx._id} 
                  transaction={tx} 
                  onDelete={handleDelete} 
                />
              ))
            ) : (
              <p className="text-gray-500 col-span-1 lg:col-span-2 text-center py-10">
                No transactions found for the selected criteria.
              </p>
            )}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <nav className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-8">
              <div className="flex w-0 flex-1">
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={!hasPrevPage}
                  className="inline-flex items-center border-t-2 border-transparent pr-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50"
                >
                  <ChevronLeftIcon className="mr-3 h-5 w-5 text-gray-400" />
                  Previous
                </button>
              </div>
              <div className="hidden md:flex">
                <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
              </div>
              <div className="flex w-0 flex-1 justify-end">
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={!hasNextPage}
                  className="inline-flex items-center border-t-2 border-transparent pl-1 pt-4 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50"
                >
                  Next
                  <ChevronRightIcon className="ml-3 h-5 w-5 text-gray-400" />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionsPage;