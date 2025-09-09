import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';

// MUI Components
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  InputAdornment
} from '@mui/material';

// MUI Icons
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

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
      category: categories[0],
      description: '',
      date: new Date().toISOString().split('T')[0], 
    }
  });

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
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
      const { data } = await api.post('/api/transactions/upload-receipt', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Populate the form with data extracted from the receipt
      reset({
        type: 'expense', // Receipts are almost always expenses
        amount: data.extractedData.amount || '',
        category: categories.includes(data.extractedData.category) ? data.extractedData.category : categories[0],
        description: data.extractedData.description || '',
        date: data.extractedData.date || new Date().toISOString().split('T')[0],
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
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setMessage({ type: 'error', content: error.response?.data?.message || 'Failed to create transaction.' });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1" sx={{
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600
      }}>
        Add New Transaction
      </Typography>

      {/* Message Alerts */}
      {message.content && (
        <Alert severity={message.type} sx={{ mb: 3 }}>
          {message.content}
        </Alert>
      )}

      {/* Upload Receipt Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600
        }}>
          Add from Receipt
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={8}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500
              }}
            >
              {selectedFile ? selectedFile.name : "Choose a file..."}
              <input type="file" hidden onChange={handleFileChange} accept=".jpg,.jpeg,.png,.pdf" />
            </Button>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Button
              variant="contained"
              onClick={handleReceiptUpload}
              disabled={uploadLoading || !selectedFile}
              startIcon={uploadLoading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
              fullWidth
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500
              }}
            >
              Upload
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Manual Entry Form */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom sx={{
          fontFamily: 'Inter, sans-serif',
          fontWeight: 600
        }}>
          Manual Entry
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Type" fullWidth error={!!errors.type} helperText={errors.type?.message}>
                    <MenuItem value="expense">Expense</MenuItem>
                    <MenuItem value="income">Income</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField 
                    {...field} 
                    label="Amount" 
                    type="number"
                    fullWidth 
                    error={!!errors.amount} 
                    helperText={errors.amount?.message}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <TextField {...field} select label="Category" fullWidth error={!!errors.category} helperText={errors.category?.message}>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="date"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Description" fullWidth multiline rows={2} error={!!errors.description} helperText={errors.description?.message} />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Save Transaction'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default AddTransactionPage;