import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/authStore'; // <-- Using your Zustand store
import api from '../services/api'; // Using your Axios instance

// MUI Components
import { 
  Container, 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Avatar, 
  CircularProgress,
  Grid
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// 1. Validation schema (checks required fields before API call)
// This matches your backend controller's requirements.
const validationSchema = yup.object({
  email: yup
    .string()
    .email('Must be a valid email')
    .required('Email is required'),
  password: yup
    .string()
    .required('Password is required'),
});

const LoginPage = () => {
  const [serverError, setServerError] = useState(''); // For errors from the API
  const navigate = useNavigate();
  
  // 2. Get the 'login' action from your Zustand store
  const login = useAuthStore((state) => state.login);

  // 3. Setup react-hook-form
  const { 
    control, 
    handleSubmit, 
    formState: { errors, isSubmitting } 
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // 4. OnSubmit handler receives validated data from react-hook-form
  const onSubmit = async (data) => {
    setServerError('');
    try {
      // Send validated data to your backend login route
      const res = await api.post('/api/auth/login', { 
        email: data.email, 
        password: data.password 
      });
      
      // Call the Zustand 'login' action, which saves the token/user
      login(res.data);
      
      // Redirect to the main dashboard
      navigate('/dashboard');

    } catch (err) {
      console.error(err);
      // Set the error message received from the backend (e.g., "Invalid credentials")
      setServerError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        
        {/* 5. Use handleSubmit from react-hook-form */}
        <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1 }}>
          
          {/* 6. Controller connects react-hook-form to the MUI TextField */}
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                autoComplete="email"
                autoFocus
                // Display validation errors from Yup
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />

          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                // Display validation errors from Yup
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />

          {/* Display API/Server Errors */}
          {serverError && (
            <Typography color="error" variant="body2" align="center" sx={{ mt: 2 }}>
              {serverError}
            </Typography>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={isSubmitting} // Disable button while API call is in progress
            sx={{ mt: 3, mb: 2 }}
          >
            {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>
          
          <Grid container justifyContent="flex-end">
            <Grid item>
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Typography variant="body2" color="primary">
                  {"Don't have an account? Sign Up"}
                </Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginPage;