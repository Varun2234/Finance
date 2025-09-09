import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import useAuthStore from '../store/authStore';
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

// Validation schema
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
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the 'login' action from Zustand store
  const login = useAuthStore((state) => state.login);

  // Get the return URL from location state
  const from = location.state?.from?.pathname || '/dashboard';

  // Setup react-hook-form
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

  const onSubmit = async (data) => {
    setServerError('');
    try {
      const res = await api.post('/api/auth/login', { 
        email: data.email, 
        password: data.password 
      });
      
      // Call the Zustand 'login' action, which saves the token/user
      login(res.data);
      
      // Redirect to the return URL or dashboard
      navigate(from, { replace: true });

    } catch (err) {
      console.error('Login error:', err);
      setServerError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
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
            <Avatar sx={{ m: 1, bgcolor: 'primary.main' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h3" gutterBottom sx={{ fontWeight: 700 }}>
              MyFinance
            </Typography>
            <Typography component="h2" variant="h5" sx={{ mb: 3, color: 'text.secondary' }}>
              Welcome back
            </Typography>
            
            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate sx={{ mt: 1, width: '100%' }}>
              
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
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{ mb: 2 }}
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
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{ mb: 2 }}
                  />
                )}
              />

              {/* Display API/Server Errors */}
              {serverError && (
                <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                  {serverError}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isSubmitting}
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
              </Button>
              
              <Grid container justifyContent="center">
                <Grid item>
                  <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <Typography variant="body2" color="primary" sx={{ fontWeight: 500 }}>
                      {"Don't have an account? Sign Up"}
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

export default LoginPage;