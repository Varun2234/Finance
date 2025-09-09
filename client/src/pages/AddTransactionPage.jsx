import React, { useState } from 'react';
// Note: In a real app, you would use 'react-router-dom' for navigation.
// Since this is a single file component, we'll simulate the navigate function.
// import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
// Note: The 'api' service is simulated for this example.
import api from '../services/api';

// Mock navigate function
const useNavigate = () => {
    return (path) => console.log(`Navigating to ${path}`);
};


// --- Validation Schema and Categories ---

// Define the validation schema based on backend requirements
const validationSchema = yup.object({
  type: yup.string().oneOf(['income', 'expense']).required('Type is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be positive').required('Amount is required'),
  category: yup.string().required('Category is required'),
  description: yup.string().required('Description is required').min(3, 'Description must be at least 3 characters'),
  date: yup.string().required('Date is required'),
});

// Define the static category list
const categories = [
  "Rent", 
  "Electricity", 
  "Groceries", 
  "Personal Care", 
  "Health Insurance", 
  "Loan", 
  "Others"
];


// --- Main Component ---

const AddTransactionPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const navigate = useNavigate();

  // Setup react-hook-form
  const { 
    control, 
    handleSubmit, 
    reset, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: 'Others',
      description: '',
      date: new Date().toISOString().split('T')[0], 
    }
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setSelectedFile(e.target.files[0]);
    }
  };

  // Handle uploading a receipt file
  const handleReceiptUpload = async () => {
    if (!selectedFile) {
      setMessage({ type: 'error', content: 'Please select a file to upload.' });
      return;
    }
    setUploadLoading(true);
    setMessage({ type: '', content: '' });

    const formData = new FormData();
    formData.append('receipt', selectedFile);

    try {
      const res = await api.post('/api/transactions/upload-receipt', formData);
      const data = res.data.data;
      reset({
        type: 'expense',
        amount: Number(data.amount) || '',
        category: categories.includes(data.category) ? data.category : 'Others',
        description: data.description || '',
        date: data.date ? data.date.split('T')[0] : new Date().toISOString().split('T')[0],
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

  // Handle submission of the manual entry form
  const onSubmit = async (data) => {
    setMessage({ type: '', content: '' });
    try {
      await api.post('/api/transactions', data);
      setMessage({ type: 'success', content: 'Transaction created successfully!' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to create transaction.' });
    }
  };
    
  // --- Reusable Input Component for Form Fields ---
  const FormInput = ({ name, label, type = "text", children, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">{label}</label>
        <div className="mt-1">
            <Controller
                name={name}
                control={control}
                render={({ field }) => (
                    React.createElement(type === 'select' ? 'select' : type === 'textarea' ? 'textarea' : 'input', {
                        ...field,
                        ...props,
                        id: name,
                        type: type === 'select' || type === 'textarea' ? undefined : type,
                        rows: type === 'textarea' ? 3 : undefined,
                        className: `block w-full rounded-md shadow-sm sm:text-sm transition duration-150 ease-in-out ${
                            errors[name] 
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`
                    }, children)
                )}
            />
        </div>
        {errors[name] && <p className="mt-2 text-sm text-red-600">{errors[name].message}</p>}
    </div>
  );


  // --- Render ---
  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">
          Add New Transaction
        </h1>

        {/* Message Alerts */}
        {message.content && (
            <div className={`rounded-md p-4 mb-6 border ${
                message.type === 'success' 
                ? 'bg-green-50 border-green-400 text-green-800' 
                : 'bg-red-50 border-red-400 text-red-800'
            }`}>
                <p className="text-sm font-medium">{message.content}</p>
            </div>
        )}

        {/* Upload Receipt Section */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Add from Receipt
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div className="sm:col-span-2">
                <label htmlFor="file-upload" className="w-full cursor-pointer text-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
                    {selectedFile ? selectedFile.name : "Choose a file..."}
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
            </div>
            <button
              type="button"
              onClick={handleReceiptUpload}
              disabled={uploadLoading || !selectedFile}
              className="inline-flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
            >
              {uploadLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
              Upload
            </button>
          </div>
        </div>

        {/* Manual Entry Form */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            Manual Entry
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-6">
                
                <FormInput name="type" label="Type" type="select">
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                </FormInput>
                
                <FormInput name="amount" label="Amount" type="number" placeholder="0.00" />
                
                <FormInput name="category" label="Category" type="select">
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </FormInput>

                <FormInput name="date" label="Date" type="date" />
              
                <div className="sm:col-span-2">
                    <FormInput name="description" label="Description" type="textarea" placeholder="e.g. Weekly grocery shopping" />
                </div>
              
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        </>
                    ) : 'Save Transaction'}
                  </button>
                </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTransactionPage;
