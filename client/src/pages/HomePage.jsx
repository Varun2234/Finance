import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  Button,
  Avatar,
  Chip,
  Paper,
  Fab
} from '@mui/material';
import {
  TrendingUp,
  Analytics,
  CloudUpload,
  Security,
  ArrowForward,
  Star,
  Speed,
  Visibility,
  AttachMoney,
  Dashboard as DashboardIcon,
  PlayArrow,
  GetApp
} from '@mui/icons-material';

const HomePage = () => {
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);

  const features = [
    { icon: <TrendingUp />, title: "Smart Expense Tracking", description: "AI-powered categorization automatically sorts your transactions." },
    { icon: <Analytics />, title: "Visual Analytics", description: "Beautiful charts and insights help you understand your spending patterns." },
    { icon: <CloudUpload />, title: "Receipt Scanning", description: "Snap a photo and our AI extracts details instantly." },
    { icon: <Security />, title: "Bank-Level Security", description: "Your financial data is protected with enterprise-grade encryption." }
  ];

  const benefits = [
    { icon: <Speed />, title: "Lightning Fast", subtitle: "Instant transaction processing" },
    { icon: <Visibility />, title: "Clear Insights", subtitle: "Understand your money flow" },
    { icon: <Star />, title: "5-Star Rated", subtitle: "Loved by thousands" },
    { icon: <AttachMoney />, title: "Save Money", subtitle: "Track and reduce expenses" }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const handleGetStarted = () => {
    if (token) navigate('/dashboard');
    else navigate('/signup');
  };

  // Colors
  const primaryBlue = "#0F1B2A";
  const secondaryBlue = "#2B4562";
  const accentTeal = "#00C9B1";
  const textDark = "#333333";
  const textLight = "#FFFFFF";
  const backgroundLight = "#F5F7FA";

  return (
    <Box sx={{ minHeight: '100vh', background: backgroundLight, overflow: 'hidden', position: 'relative', color: textDark }}>
      <Container maxWidth="lg">
        <motion.div initial="hidden" animate="visible" variants={containerVariants}>
          {/* Hero Section */}
          <Box sx={{ pt: 8, pb: 6, textAlign: 'center' }}>
            <motion.div variants={itemVariants}>
              <Typography variant="h2" sx={{ fontWeight: 900, mb: 3, color: primaryBlue }}>
                Take Control of Your <br /> Financial Future
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Typography variant="h5" sx={{ mb: 4, color: primaryBlue, maxWidth: '700px', mx: 'auto' }}>
                The smartest way to manage your money with AI-powered insights, beautiful analytics, and effortless expense tracking.
              </Typography>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    background: secondaryBlue,
                    color: textLight,
                    px: 4,
                    py: 2,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    borderRadius: 3,
                    '&:hover': { background: primaryBlue }
                  }}
                  endIcon={<ArrowForward />}
                >
                  {token ? 'Go to Dashboard' : 'Get Started Free'}
                </Button>

                {!token && (
                  <Button
                    variant="outlined"
                    size="large"
                    component={Link}
                    to="/login"
                    sx={{
                      px: 4,
                      py: 2,
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      borderRadius: 3,
                      borderColor: primaryBlue,
                      color: primaryBlue,
                      '&:hover': { background: 'rgba(43,69,98,0.1)' }
                    }}
                    startIcon={<PlayArrow />}
                  >
                    Sign In
                  </Button>
                )}
              </Box>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                {['✨ AI-Powered', '🚀 Fast', '🔒 Secure'].map((f, i) => (
                  <Chip key={i} label={f} sx={{ bgcolor: accentTeal, color: textLight, fontWeight: 600 }} />
                ))}
              </Box>
            </motion.div>
          </Box>

          {/* Benefits Section (2x2 grid) */}
          <motion.div variants={itemVariants}>
            <Grid container spacing={3} justifyContent="center" sx={{ mb: 8 }}>
              {benefits.map((b, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Card sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: secondaryBlue, color: textLight, borderRadius: 4 }}>
                    <Avatar sx={{ bgcolor: primaryBlue, color: accentTeal, mx: 'auto', mb: 2 }}>{b.icon}</Avatar>
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>{b.title}</Typography>
                    <Typography variant="body2">{b.subtitle}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants}>
            <Typography
              variant="h3"
              sx={{ textAlign: 'center', mb: 6, fontWeight: 800, color: primaryBlue }}
            >
              Powerful Features
            </Typography>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 3,
                justifyContent: 'center',
                mb: 8,
              }}
            >
              {features.map((f, i) => (
                <Box
                  key={i}
                  sx={{
                    flex: '1 1 45%',
                    minWidth: '300px',
                    display: 'flex',
                  }}
                >
                  <Card
                    sx={{
                      bgcolor: secondaryBlue,
                      color: textLight,
                      borderRadius: 4,
                      p: 4,
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                      <Avatar
                        sx={{ bgcolor: primaryBlue, color: accentTeal, mr: 3 }}
                      >
                        {f.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 700 }}>
                          {f.title}
                        </Typography>
                        <Typography>{f.description}</Typography>
                      </Box>
                    </Box>
                  </Card>
                </Box>
              ))}
            </Box>
          </motion.div>

          {/* Demo Section */}
          <motion.div variants={itemVariants}>
            <Paper sx={{ p: 6, mb: 8, bgcolor: secondaryBlue, color: textLight, borderRadius: 6, textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>See MyFinance in Action</Typography>
              <Typography variant="h6" sx={{ mb: 4 }}>Experience smart financial management with our dashboard</Typography>
              <Button variant="contained" size="large" onClick={handleGetStarted} sx={{ bgcolor: primaryBlue, color: accentTeal, px: 4, py: 2, fontWeight: 700, '&:hover': { bgcolor: '#0B1622' } }} startIcon={<DashboardIcon />}>
                {token ? 'Open Dashboard' : 'Try Demo'}
              </Button>
            </Paper>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <Grid container spacing={4} justifyContent="center" sx={{ mb: 6 }}>
              {[{ number: "50K+", label: "Transactions" }, { number: "1K+", label: "Users" }, { number: "99.8%", label: "Uptime" }, { number: "$2M+", label: "Managed" }]
                .map((s, i) => (
                  <Grid item xs={6} md={3} key={i}>
                    <Card sx={{ p: 4, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', bgcolor: secondaryBlue, color: textLight, borderRadius: 3 }}>
                      <Typography variant="h4" sx={{ fontWeight: 800 }}>{s.number}</Typography>
                      <Typography>{s.label}</Typography>
                    </Card>
                  </Grid>
              ))}
            </Grid>
          </motion.div>
        </motion.div>
      </Container>

      {/* Floating Action Button */}
      {!token && (
        <Fab onClick={handleGetStarted} sx={{ position: 'fixed', bottom: 32, right: 32, bgcolor: secondaryBlue, color: textLight, '&:hover': { bgcolor: primaryBlue } }}>
          <GetApp />
        </Fab>
      )}
    </Box>
  );
};

export default HomePage;
