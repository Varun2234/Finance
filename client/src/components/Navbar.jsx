import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

// MUI Components
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Tooltip,
} from '@mui/material';

// MUI Icons
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';
import FinanceIcon from '@mui/icons-material/MonetizationOn';

const navLinkStyle = ({ isActive }) => ({
  fontWeight: isActive ? '600' : '500',
  fontFamily: 'Inter, sans-serif',
  color: 'white',
  textDecoration: 'none',
  padding: '8px 16px',
  borderRadius: '12px',
  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    transform: 'translateY(-1px)',
  },
});

const Navbar = () => {
  const navigate = useNavigate();

  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);

  const isAuthenticated = token;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar 
      position="static" 
      sx={{ 
        background: 'linear-gradient(135deg, #8B5A96 0%, #9966CC 50%, #B19CD9 100%)',
        boxShadow: '0 4px 20px rgba(139, 90, 150, 0.3)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
        <FinanceIcon sx={{ mr: 2, fontSize: 32, color: '#00D4AA' }} />
        <Typography
          variant="h5"
          component="div"
          sx={{
            flexGrow: 1,
            fontFamily: 'Inter, sans-serif',
            fontWeight: 700,
            background: 'linear-gradient(45deg, #FFFFFF 30%, #00D4AA 90%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          Trellix
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 4, gap: 1 }}>
              <Button sx={navLinkStyle} component={NavLink} to="/">
                Home
              </Button>
              <Button sx={navLinkStyle} component={NavLink} to="/dashboard">
                Dashboard
              </Button>
              <Button sx={navLinkStyle} component={NavLink} to="/transactions">
                Transactions
              </Button>
              <Button sx={navLinkStyle} component={NavLink} to="/add-transaction">
                Add
              </Button>
              <Button sx={navLinkStyle} component={NavLink} to="/analytics">
                Analytics
              </Button>
            </Box>
            
            <Typography sx={{ 
              display: { xs: 'none', sm: 'block' }, 
              mr: 2,
              fontFamily: 'Inter, sans-serif',
              fontWeight: 500,
              color: 'rgba(255, 255, 255, 0.9)'
            }}>
              Hello, {user?.name || 'User'}
            </Typography>

            <Avatar sx={{ 
              bgcolor: '#00D4AA', 
              width: 40, 
              height: 40, 
              mr: 2,
              boxShadow: '0 2px 8px rgba(0, 212, 170, 0.3)'
            }}>
              <AccountCircle sx={{ color: 'white' }} />
            </Avatar>
            <Tooltip title="Logout">
              <IconButton 
                color="inherit" 
                onClick={handleLogout} 
                edge="end"
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    transform: 'scale(1.05)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button 
              color="inherit" 
              component={NavLink} 
              to="/login" 
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 500,
                px: 3,
                py: 1,
                borderRadius: '25px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Login
            </Button>
            <Button 
              variant="contained"
              component={NavLink} 
              to="/signup" 
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 600,
                px: 3,
                py: 1,
                borderRadius: '25px',
                bgcolor: '#00D4AA',
                color: 'white',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: '#00C49F',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 212, 170, 0.4)'
                }
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;