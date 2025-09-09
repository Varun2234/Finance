import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

// Import MUI Theme and Baseline
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create a custom theme with the new fonts
const theme = createTheme({
  typography: {
    // Headings font - Inter
    h1: { fontFamily: 'Inter, sans-serif', fontWeight: 700 },
    h2: { fontFamily: 'Inter, sans-serif', fontWeight: 700 },
    h3: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    h4: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    h5: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    h6: { fontFamily: 'Inter, sans-serif', fontWeight: 600 },
    
    // Body text - keep Inter for readability
    body1: { fontFamily: 'Inter, sans-serif' },
    body2: { fontFamily: 'Inter, sans-serif' },
    
    // Data/numbers - JetBrains Mono for better alignment
    // You can use this class for financial data
    monospace: { 
      fontFamily: 'JetBrains Mono, monospace',
      fontWeight: 500,
      letterSpacing: '0.02em'
    }
  },
  // Add the monospace variant to the theme
  components: {
    MuiTypography: {
      variants: [
        {
          props: { variant: 'financial' },
          style: {
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 500,
            letterSpacing: '0.02em',
          },
        },
      ],
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>
);