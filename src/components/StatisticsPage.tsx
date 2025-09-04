import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Button,
  Alert,
  Grid,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  ExpandMore,
  Analytics,
  Link,
  Schedule,
  LocationOn,
  Refresh,
  Delete
} from '@mui/icons-material';
import { ShortenedUrl } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../services/loggingService';

const StatisticsPage: React.FC = () => {
  const [urls, setUrls] = useState<ShortenedUrl[]>([]);

  const loadUrls = () => {
    const allUrls = urlService.getAllUrls();
    setUrls(allUrls);
    logger.info('Loaded URLs for statistics', { count: allUrls.length });
  };

  useEffect(() => {
    loadUrls();
  }, []);

  const handleDelete = (id: string) => {
    urlService.deleteUrl(id);
    loadUrls();
  };

  const getStatusChip = (url: ShortenedUrl) => {
    const isExpired = url.expiresAt < new Date();
    return (
      <Chip
        label={isExpired ? 'Expired' : 'Active'}
        color={isExpired ? 'error' : 'success'}
        size="small"
      />
    );
  };

  const totalUrls = urls.length;
  const activeUrls = urls.filter(url => url.expiresAt > new Date()).length;
  const totalClicks = urls.reduce((sum, url) => sum + url.clicks.length, 0);

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Analytics color="primary" />
          URL Statistics
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadUrls}
        >
          Refresh
        </Button>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main" sx={{ fontWeight: 700 }}>
                {totalUrls}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" sx={{ fontWeight: 700 }}>
                {activeUrls}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Active URLs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" sx={{ fontWeight: 700 }}>
                {totalClicks}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Total Clicks
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {urls.length === 0 ? (
        <Paper elevation={1} sx={{ p: 6, textAlign: 'center' }}>
          <Link sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No URLs found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Create some shortened URLs first to see statistics here.
          </Typography>
        </Paper>
      ) : (
        <Paper elevation={2} sx={{ overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              URL Details & Analytics
            </Typography>
          </Box>
          
          {urls.map((url) => (
            <Accordion key={url.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, fontFamily: 'monospace' }}>
                      /{url.shortCode}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {url.originalUrl}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip 
                      label={`${url.clicks.length} clicks`} 
                      size="small" 
                      color="primary"
                    />
                    {getStatusChip(url)}
                  </Box>
                </Box>
              </AccordionSummary>
              
              <AccordionDetails>
                <Grid container spacing={3}>
                  <Grid item xs={12} lg={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      URL Information
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Original URL</Typography>
                      <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                        {url.originalUrl}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">Shortened URL</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                          {window.location.origin}/{url.shortCode}
                        </Typography>
                        <Button 
                          size="small"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/${url.shortCode}`);
                            logger.info('Copied URL from statistics', { shortCode: url.shortCode });
                          }}
                        >
                          Copy
                        </Button>
                      </Box>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Created</Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Schedule fontSize="small" color="action" />
                          {url.createdAt.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">Expires</Typography>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                          <Schedule fontSize="small" color="action" />
                          {url.expiresAt.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Delete />}
                      onClick={() => handleDelete(url.id)}
                    >
                      Delete URL
                    </Button>
                  </Grid>

                  <Grid item xs={12} lg={6}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                      Click Analytics ({url.clicks.length} total clicks)
                    </Typography>
                    
                    {url.clicks.length === 0 ? (
                      <Alert severity="info">
                        No clicks recorded yet for this URL.
                      </Alert>
                    ) : (
                      <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Timestamp</TableCell>
                              <TableCell>Location</TableCell>
                              <TableCell>Source</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {url.clicks.slice().reverse().map((click, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <Typography variant="body2">
                                    {click.timestamp.toLocaleString()}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <LocationOn fontSize="small" color="action" />
                                    <Typography variant="body2">
                                      {click.location}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={click.source} 
                                    size="small" 
                                    variant="outlined"
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </Grid>
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default StatisticsPage;