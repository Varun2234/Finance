import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { shallow } from 'zustand/shallow'; // <-- 1. IMPORT shallow

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
  fontWeight: isActive ? '700' : '500',
  color: 'white',
  textDecoration: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  backgroundColor: isActive ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

const Navbar = () => {
  const navigate = useNavigate();

  // 2. USE shallow as the second argument to the hook.
  // This prevents re-renders if the selected state values haven't changed.
  const { user, token, logout } = useAuthStore(
    (state) => ({
      user: state.user,
      token: state.token,
      logout: state.logout,
    }),
    shallow
  );

  const isAuthenticated = !!token;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <FinanceIcon sx={{ mr: 1 }} />
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          MyFinance
        </Typography>

        {isAuthenticated && user ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 3 }}>
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
            <Typography sx={{ display: { xs: 'none', sm: 'block' }, mr: 1.5 }}>
              Hello, {user.username}
            </Typography>
            <Avatar sx={{ bgcolor: 'secondary.main', width: 36, height: 36, mr: 1.5 }}>
              <AccountCircle />
            </Avatar>
            <Tooltip title="Logout">
              <IconButton color="inherit" onClick={handleLogout} edge="end">
                <Logout />
              </IconButton>
            </Tooltip>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={NavLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={NavLink} to="/signup">
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
