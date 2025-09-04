import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { Link, Error as ErrorIcon } from '@mui/icons-material';
import { urlService } from '../services/urlService';
import { logger } from '../services/loggingService';

const RedirectHandler: React.FC = () => {
  const { shortCode } = useParams<{ shortCode: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    const handleRedirect = async () => {
      if (!shortCode) {
        setError('Invalid short code');
        setLoading(false);
        return;
      }

      try {
        logger.info('Attempting redirect', { shortCode });
        
        // Get the source of the redirect
        const source = document.referrer ? new URL(document.referrer).hostname : 'direct';
        
        const originalUrl = await urlService.redirectToUrl(shortCode, source);
        
        // Start countdown
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              window.location.href = originalUrl;
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Redirect failed';
        setError(errorMessage);
        setLoading(false);
        logger.error('Redirect failed', { shortCode, error: errorMessage });
      }
    };

    handleRedirect();
  }, [shortCode]);

  if (loading) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', maxWidth: 400 }}>
          <CircularProgress size={48} sx={{ mb: 3 }} />
          <Typography variant="h6" gutterBottom>
            Processing Redirect...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please wait while we redirect you to your destination.
          </Typography>
        </Paper>
      </Box>
    );
  }

  if (error) {
    return (
      <Box 
        sx={{ 
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 3
        }}
      >
        <Paper elevation={2} sx={{ p: 6, textAlign: 'center', maxWidth: 500 }}>
          <ErrorIcon color="error" sx={{ fontSize: 64, mb: 3 }} />
          <Typography variant="h5" gutterBottom color="error">
            Redirect Failed
          </Typography>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button 
              variant="contained" 
              onClick={() => navigate('/')}
            >
              Go Home
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => navigate('/statistics')}
            >
              View Statistics
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Paper elevation={2} sx={{ p: 6, textAlign: 'center', maxWidth: 400 }}>
        <Link color="success" sx={{ fontSize: 64, mb: 3 }} />
        <Typography variant="h5" gutterBottom color="success.main">
          Redirecting in {countdown}s
        </Typography>
        <Typography variant="body1" color="text.secondary">
          You will be automatically redirected to your destination.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          If you are not redirected automatically, please check if the URL has expired.
        </Typography>
      </Paper>
    </Box>
  );
};

export default RedirectHandler;