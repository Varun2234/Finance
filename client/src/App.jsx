import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// Import all Page and Layout Components
import Dashboard from './pages/Dashboard.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AddTransactionPage from './pages/AddTransactionPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import HomePage from './pages/HomePage.jsx';
// Public pages for login and registration
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/Signup.jsx';

// Shared layout components
import Navbar from './components/Navbar.jsx';

// Protected route components
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute.jsx';

/**
 * A layout component for all authenticated pages.
 * It includes the Navbar at the top and provides a main content area
 * for the specific page being viewed (Dashboard, Transactions, etc.).
 */
function AppLayout() {
  return (
    <ProtectedRoute>
      <div>
        <Navbar />
        <main>
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}

/**
 * The main App component defines the entire application's routing structure.
 */
function App() {
  return (
    <Routes>
      {/* Main Application Routes (with Navbar and Authentication) */}
      <Route element={<AppLayout />}>
        {/* Default route for the application */}
        {/* <Route path="/" element={<Navigate to="/dashboard" replace />} />x */}
        <Route path="/" element={<HomePage />} />
        {/* Protected main application pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/add-transaction" element={<AddTransactionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* Standalone Public Routes (without Navbar) */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignupPage />
          </PublicRoute>
        } 
      />

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;