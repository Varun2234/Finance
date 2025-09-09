import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

import { Container, Grid, Card, Typography, Box, Divider } from "@mui/material";

const StatCard = ({ title, value, bgcolor, textColor }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card 
      sx={{ 
        p: 2, 
        mb: 2, 
        bgcolor: bgcolor, 
        boxShadow: 3, 
        borderRadius: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', color: textColor, mb: 1 }}>
        {title}
      </Typography>
      <Typography 
        variant="h4" 
        component="div" 
        fontWeight="bold" 
        sx={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em', color: textColor }}
      >
        {value}
      </Typography>
    </Card>
  </motion.div>
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
        const res = await api.get("/api/transactions/summary");
        const data = res.data;

        const totalIncome = data.summary?.find((s) => s._id === "income")?.total || 0;
        const totalExpense = data.summary?.find((s) => s._id === "expense")?.total || 0;
        const expenseCategories = data.categoryBreakdown
          ?.filter(c => c._id && c._id.trim() !== "")
          ?.reduce((acc, c) => {
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
      currency: "USD",
    }).format(amount);
  };

  const netBalanceColor = summary.netIncome >= 0 ? '#4caf50' : '#f44336';

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      py: 4, 
      px: 2,
      backgroundImage: 'linear-gradient(to bottom right, #A78BFA, #E5E7EB)'
    }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Typography
            variant="h4"
            gutterBottom
            component="h1"
            sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}
          >
            Dashboard
          </Typography>
        </motion.div>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total Income" 
              value={formatCurrency(summary.totalIncome)} 
              bgcolor="#4caf50" 
              textColor="white" 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total Expenses" 
              value={formatCurrency(summary.totalExpense)} 
              bgcolor="#f44336" 
              textColor="white" 
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard 
              title="Total Balance" 
              value={formatCurrency(summary.netIncome)} 
              bgcolor={netBalanceColor} 
              textColor="white" 
            />
          </Grid>
        </Grid>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <Card sx={{ 
            boxShadow: 3, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            p: 2
          }}>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>
              Expense Breakdown
            </Typography>
            {loading ? (
              <Typography sx={{ fontFamily: 'Inter, sans-serif', color: 'text.secondary' }}>Loading...</Typography>
            ) : Object.keys(summary.expenseCategories).length > 0 ? (
              summary.expenseCategories && Object.entries(summary.expenseCategories)
                .sort(([,a], [,b]) => b - a)
                .map(([category, amount], index, array) => (
                  <React.Fragment key={category}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5 }}>
                      <Typography sx={{ fontFamily: 'Inter, sans-serif', color: 'text.primary' }}>{category}</Typography>
                      <Typography sx={{ fontFamily: 'JetBrains Mono, monospace', color: 'text.primary', fontWeight: 500 }}>{formatCurrency(amount)}</Typography>
                    </Box>
                    {index < array.length - 1 && <Divider />}
                  </React.Fragment>
                ))
            ) : (
              <Typography color="text.secondary" sx={{ mt: 2, fontFamily: 'Inter, sans-serif' }}>No expenses recorded yet.</Typography>
            )}
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
}