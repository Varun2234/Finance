import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../services/api';

// MUI Components
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Avatar, 
  CircularProgress,
  Grid,
  Alert,
  Paper
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// Define the validation schema based on backend requirements
const validationSchema = yup.object({
  name: yup
    .string()
    .required('Username is required')
    .min(3, 'Username must be at least 3 characters'),
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters long'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password'), null], 'Passwords must match'),
});

const SignupPage = () => {
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data) => {
    setServerError('');
    setSuccess('');
    
    try {
      // Remove confirmPassword from the data sent to backend
      const { confirmPassword, ...registrationData } = data;
      
      const response = await api.post('/api/auth/register', registrationData);
      
      setSuccess('Registration successful! Redirecting to login...');
      
      // Redirect to login page after successful registration
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setServerError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          marginBottom: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ padding: 4, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
              MyFinance
            </Typography>
            <Typography component="h2" variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
              Create your account
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Controller
                    name="name"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        id="name"
                        label="Full Name"
                        autoComplete="name"
                        autoFocus
                        error={!!errors.name}
                        helperText={errors.name?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        autoComplete="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                        error={!!errors.password}
                        helperText={errors.password?.message}
                      />
                    )}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        required
                        fullWidth
                        name="confirmPassword"
                        label="Confirm Password"
                        type="password"
                        id="confirmPassword"
                        autoComplete="new-password"
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                      />
                    )}
                  />
                </Grid>
              </Grid>

              {/* Display Success Message */}
              {success && (
                <Alert severity="success" sx={{ mt: 3 }}>
                  {success}
                </Alert>
              )}

              {/* Display API/Server Errors */}
              {serverError && (
                <Alert severity="error" sx={{ mt: 3 }}>
                  {serverError}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ 
                  mt: 4, 
                  mb: 3, 
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {"Already have an account? Sign in"}
                    </Typography>
                  </Link>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SignupPage;