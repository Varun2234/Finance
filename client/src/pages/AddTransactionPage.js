import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { transactionService } from '../services/transactionService';
import { UploadCloudIcon, DollarSignIcon } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

const AddTransactionPage = () => {
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0] // Today's date
  });
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch categories from the backend
    const fetchCategories = async () => {
      try {
        const cats = await transactionService.getCategories();
        setCategories(cats);
        // Set default category if categories are fetched
        if (cats.length > 0) {
          setFormData(prev => ({ ...prev, category: cats[0] }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setMessage({ type: 'error', content: 'Failed to load categories' });
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleReceiptUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', content: 'Please select a file to upload.' });
      return;
    }

    setUploadLoading(true);
    setMessage({ type: '', content: '' });

    try {
      const data = await transactionService.uploadReceipt(selectedFile);
      // Backend provides mock data - populate the form
      setFormData({
        type: 'expense', // Receipts are almost always expenses
        amount: data.extractedData.amount,
        category: categories.includes(data.extractedData.category) ? data.extractedData.category : categories[0],
        description: data.extractedData.description,
        date: data.extractedData.date
      });
      setMessage({ type: 'success', content: 'Receipt processed! Please review and save.' });
    } catch (error) {
      console.error('Error uploading receipt:', error);
      setMessage({ type: 'error', content: error.response?.data?.message || 'Receipt upload failed.' });
    } finally {
      setUploadLoading(false);
      setSelectedFile(null); // Clear the file input
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      await transactionService.createTransaction(formData);
      setMessage({ type: 'success', content: 'Transaction created successfully!' });
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to create transaction.' });
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Add New Transaction</h1>
      
      {/* Upload Receipt Section */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Add from Receipt</h2>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            id="receipt"
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            onChange={handleFileChange}
            accept=".jpg,.jpeg,.png,.pdf"
          />
          <button
            onClick={handleReceiptUpload}
            disabled={uploadLoading || !selectedFile}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {uploadLoading ? <LoadingSpinner size="small" text="Processing..." /> : <UploadCloudIcon className="h-4 w-4 mr-2" />}
            {uploadLoading ? '' : 'Upload'}
          </button>
        </div>
         {selectedFile && <p className="text-sm text-gray-500 mt-2">Selected: {selectedFile.name}</p>}
      </div>

      {/* Manual Entry Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 space-y-6">
         <h2 className="text-lg font-medium text-gray-800">Manual Entry</h2>
         
         {message.content && (
            <div className={`p-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {message.content}
            </div>
          )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Type</label>
          <div className="mt-1">
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">Amount</label>
          <div className="mt-1 relative rounded-md shadow-sm">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSignIcon className="h-5 w-5 text-gray-400" />
              </div>
            <input
              type="number"
              name="amount"
              id="amount"
              step="0.01"
              min="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
              className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category"
            id="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <input
            type="text"
            name="description"
            id="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            placeholder="e.g., Coffee meeting"
          />
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
          <input
            type="date"
            name="date"
            id="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Transaction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTransactionPage;