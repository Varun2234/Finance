import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';

// --- Import all Page and Layout Components ---

// Your existing pages for authenticated users
import Dashboard from './pages/Dashboard.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import AddTransactionPage from './pages/AddTransactionPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';

// Public pages for login and registration
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/Signup.jsx';

// Shared layout components
import Navbar from './components/Navbar.jsx';

/**
 * A layout component for all authenticated pages.
 * It includes the Navbar at the top and provides a main content area
 * for the specific page being viewed (Dashboard, Transactions, etc.).
 */
function AppLayout() {
  return (
    <div>
      <Navbar />
      <main>
        {/* The <Outlet> is a placeholder that will be filled by the nested
            Route component that matches the current URL. */}
        <Outlet />
      </main>
    </div>
  );
}

/**
 * The main App component defines the entire application's routing structure.
 */
function App() {
  return (
    <Routes>
      {/* --- Main Application Routes (with Navbar) --- */}
      {/* All pages that should display the main navigation bar are nested here. */}
      <Route element={<AppLayout />}>
        {/* Default route for the application */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Your main application pages are now publicly accessible */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/add-transaction" element={<AddTransactionPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>

      {/* --- Standalone Public Routes (without Navbar) --- */}
      {/* These routes are for pages like login and signup that don't need the main nav bar. */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* --- Catch-all Route --- */}
      {/* If a user navigates to any other path, redirect them to the main dashboard. */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

