import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, Box } from '@mui/material';
import Navigation from './components/Navigation';
import UrlShortenerForm from './components/UrlShortenerForm';
import StatisticsPage from './components/StatisticsPage';
import RedirectHandler from './components/RedirectHandler';
import { logger } from './services/loggingService';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
});

function App() {
  React.useEffect(() => {
    logger.info('URL Shortener application started');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <Navigation />
          <Routes>
            <Route path="/" element={<UrlShortenerForm />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/:shortCode" element={<RedirectHandler />} />
          </Routes>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;