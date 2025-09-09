import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

import { Container, Grid, Card, CardContent, Typography, Box, Avatar, Divider } from "@mui/material";
import { TrendingUp, TrendingDown, AttachMoney } from '@mui/icons-material';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, mb: 2, bgcolor: `background.paper`, boxShadow: 3, '&:hover': { transform: 'scale(1.05)', transition: '0.3s' }}}>
      <Avatar sx={{ bgcolor: color, width: 56, height: 56, mr: 2 }}>
        <Icon />
      </Avatar>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>{title}</Typography>
        <Typography variant="h5" component="div" fontWeight="bold" sx={{ fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.02em' }}>{value}</Typography>
      </Box>
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

  return (
  <Box sx={{ bgcolor: '#C1EEFF', minHeight: '100vh', py: 4 }}>
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
          <StatCard title="Total Income" value={formatCurrency(summary.totalIncome)} icon={TrendingUp} color="#4caf50" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Total Expense" value={formatCurrency(summary.totalExpense)} icon={TrendingDown} color="#f44336" />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard title="Net Balance" value={formatCurrency(summary.netIncome)} icon={AttachMoney} color="#2196f3" />
        </Grid>
      </Grid>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
          <CardContent>
            <Typography variant="h6" component="h2" gutterBottom sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600 }}>Expense Breakdown</Typography>
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
          </CardContent>
        </Card>
      </motion.div>
    </Container>
    </Box>
  );
}