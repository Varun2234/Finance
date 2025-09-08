import React, { useEffect, useState } from "react";
import api from "../services/api"; // Your centralized Axios instance

// MUI Components
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";

// MUI Icons
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * A reusable component for the top summary cards.
 */
const StatCard = ({ title, value, icon, color }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
    <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56, mr: 2 }}>
      {icon}
    </Avatar>
    <Box>
      <Typography variant="subtitle2" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" component="div" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Card>
);

export default function Dashboard() {
  const [summary, setSummary] = useState({
    totalIncome: 0,
    totalExpense: 0,
    netIncome: 0,
    expenseCategories: {},
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        // This endpoint is defined in your transactionController.js [cite: varun2234/finance/Finance-7240244dece15617cb5fc14f90da48e7e82bdafe/server/controllers/transactionController.js]
        const res = await api.get("/api/transactions/summary");
        const data = res.data;

        // Extract totals from the "summary" array provided by the backend
        const totalIncome = data.summary?.find((s) => s._id === "income")?.total || 0;
        const totalExpense = data.summary?.find((s) => s._id === "expense")?.total || 0;

        // Convert the "categoryBreakdown" array into a more usable object
        const expenseCategories = data.categoryBreakdown?.reduce((acc, c) => {
          acc[c._id] = c.total;
          return acc;
        }, {}) || {};

        setSummary({
          totalIncome,
          totalExpense,
          netIncome: data.netIncome || 0,
          expenseCategories,
        });
      } catch (err) {
        console.error("Error fetching summary", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD", // You can change this to your preferred currency
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom component="h1">
        Dashboard
      </Typography>
      
      {/* Summary Cards */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <StatCard 
            title="Total Income"
            value={formatCurrency(summary.totalIncome)}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid  xs={12} md={4}>
          <StatCard 
            title="Total Expense"
            value={formatCurrency(summary.totalExpense)}
            icon={<TrendingDownIcon />}
            color="error"
          />
        </Grid>
        <Grid  xs={12} md={4}>
          <StatCard 
            title="Net Balance"
            value={formatCurrency(summary.netIncome)}
            icon={<AttachMoneyIcon />}
            color="info"
          />
        </Grid>
      </Grid>

      {/* Expense Categories Breakdown */}
      <Grid container spacing={3}>
        <Grid  xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Expense Breakdown
              </Typography>
              {loading ? (
                <Typography>Loading...</Typography>
              ) : Object.keys(summary.expenseCategories).length > 0 ? (
                <List disablePadding>
                  {Object.entries(summary.expenseCategories).map(
                    ([category, amount], index) => (
                      <React.Fragment key={category}>
                        <ListItem>
                          <ListItemText 
                            primary={category} 
                          />
                          <Typography variant="body1" fontWeight="medium">
                            {formatCurrency(amount)}
                          </Typography>
                        </ListItem>
                        {index < Object.keys(summary.expenseCategories).length - 1 && <Divider />}
                      </React.Fragment>
                    )
                  )}
                </List>
              ) : (
                <Typography color="text.secondary" sx={{ mt: 2 }}>
                  No expenses have been recorded yet.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
