import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { Link, Analytics } from '@mui/icons-material';

const Navigation: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <AppBar position="static" elevation={2}>
      <Toolbar>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link sx={{ mr: 2, fontSize: 28 }} />
          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
            URL Shortener
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            component={RouterLink}
            to="/"
            color="inherit"
            variant={location.pathname === '/' ? 'outlined' : 'text'}
            startIcon={!isMobile ? <Link /> : undefined}
            sx={{ 
              bgcolor: location.pathname === '/' ? 'rgba(255,255,255,0.1)' : 'transparent',
              minWidth: isMobile ? 'auto' : undefined
            }}
          >
            {isMobile ? 'Home' : 'Shorten'}
          </Button>
          <Button
            component={RouterLink}
            to="/statistics"
            color="inherit"
            variant={location.pathname === '/statistics' ? 'outlined' : 'text'}
            startIcon={!isMobile ? <Analytics /> : undefined}
            sx={{ 
              bgcolor: location.pathname === '/statistics' ? 'rgba(255,255,255,0.1)' : 'transparent',
              minWidth: isMobile ? 'auto' : undefined
            }}
          >
            {isMobile ? 'Stats' : 'Statistics'}
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;