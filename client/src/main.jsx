import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// AuthProvider is no longer needed!
import App from './App.jsx';
// import './index.css';

// Import MUI Theme and Baseline
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a basic default theme
const theme = createTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        {/* We removed the AuthProvider wrapper. Zustand doesn't need it. */}
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);