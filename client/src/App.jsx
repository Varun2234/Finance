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

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/add-transaction" element={<AddTransactionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>
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