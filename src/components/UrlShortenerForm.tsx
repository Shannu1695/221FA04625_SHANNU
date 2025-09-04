import React, { useState } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  Collapse,
  IconButton,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress
} from '@mui/material';
import { Add, Remove, Link, Timer, Code } from '@mui/icons-material';
import { UrlSubmission, ShortenedUrl } from '../types';
import { urlService } from '../services/urlService';
import { logger } from '../services/loggingService';

interface FormData {
  originalUrl: string;
  validityMinutes: string;
  customShortcode: string;
}

const UrlShortenerForm: React.FC = () => {
  const [forms, setForms] = useState<FormData[]>([{ originalUrl: '', validityMinutes: '', customShortcode: '' }]);
  const [results, setResults] = useState<ShortenedUrl[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const addForm = () => {
    if (forms.length < 5) {
      setForms([...forms, { originalUrl: '', validityMinutes: '', customShortcode: '' }]);
      logger.info('Added new URL form', { totalForms: forms.length + 1 });
    }
  };

  const removeForm = (index: number) => {
    const newForms = forms.filter((_, i) => i !== index);
    setForms(newForms);
    logger.info('Removed URL form', { index, remainingForms: newForms.length });
  };

  const updateForm = (index: number, field: keyof FormData, value: string) => {
    const newForms = forms.map((form, i) => 
      i === index ? { ...form, [field]: value } : form
    );
    setForms(newForms);
  };

  const validateForm = (form: FormData): string | null => {
    if (!form.originalUrl.trim()) {
      return 'URL is required';
    }

    try {
      new URL(form.originalUrl);
    } catch {
      return 'Invalid URL format';
    }

    if (form.validityMinutes && (isNaN(Number(form.validityMinutes)) || Number(form.validityMinutes) <= 0)) {
      return 'Validity must be a positive number';
    }

    if (form.customShortcode && !/^[a-zA-Z0-9]{3,10}$/.test(form.customShortcode)) {
      return 'Shortcode must be 3-10 alphanumeric characters';
    }

    return null;
  };

  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    
    logger.info('Starting URL shortening process', { formCount: forms.length });

    try {
      // Validate all forms
      const validForms = forms.filter(form => form.originalUrl.trim());
      if (validForms.length === 0) {
        throw new Error('At least one URL is required');
      }

      for (let i = 0; i < validForms.length; i++) {
        const validationError = validateForm(validForms[i]);
        if (validationError) {
          throw new Error(`Form ${i + 1}: ${validationError}`);
        }
      }

      // Convert to submissions
      const submissions: UrlSubmission[] = validForms.map(form => ({
        originalUrl: form.originalUrl.trim(),
        validityMinutes: form.validityMinutes ? Number(form.validityMinutes) : undefined,
        customShortcode: form.customShortcode.trim() || undefined
      }));

      // Create shortened URLs
      const newUrls = await urlService.createShortenedUrls(submissions);
      setResults(newUrls);
      
      // Reset forms
      setForms([{ originalUrl: '', validityMinutes: '', customShortcode: '' }]);
      
      logger.info('Successfully created shortened URLs', { count: newUrls.length });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      logger.error('URL shortening failed', { error: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 4, fontWeight: 600 }}>
        URL Shortener
      </Typography>

      <Paper elevation={2} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Link color="primary" />
          Shorten Your URLs
        </Typography>

        {forms.map((form, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                  URL #{index + 1}
                </Typography>
                {forms.length > 1 && (
                  <IconButton size="small" onClick={() => removeForm(index)} color="error">
                    <Remove />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Original URL"
                    placeholder="https://example.com"
                    value={form.originalUrl}
                    onChange={(e) => updateForm(index, 'originalUrl', e.target.value)}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Validity (minutes)"
                    placeholder="30"
                    value={form.validityMinutes}
                    onChange={(e) => updateForm(index, 'validityMinutes', e.target.value)}
                    variant="outlined"
                    size="small"
                    type="number"
                    InputProps={{
                      startAdornment: <Timer sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    placeholder="mylink"
                    value={form.customShortcode}
                    onChange={(e) => updateForm(index, 'customShortcode', e.target.value)}
                    variant="outlined"
                    size="small"
                    InputProps={{
                      startAdornment: <Code sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 3 }}>
          {forms.length < 5 && (
            <Button
              variant="outlined"
              startIcon={<Add />}
              onClick={addForm}
              size="large"
            >
              Add Another URL
            </Button>
          )}
          
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || forms.every(form => !form.originalUrl.trim())}
            size="large"
            sx={{ px: 4 }}
          >
            {loading ? <CircularProgress size={24} sx={{ mr: 1 }} /> : null}
            Shorten URLs
          </Button>
        </Box>

        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Collapse>
      </Paper>

      {results.length > 0 && (
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom sx={{ mb: 3, color: 'success.main' }}>
            ✅ URLs Successfully Shortened
          </Typography>

          <Grid container spacing={2}>
            {results.map((url, index) => (
              <Grid item xs={12} md={6} key={url.id}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Original URL
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          wordBreak: 'break-all',
                          fontSize: '0.875rem',
                          color: 'text.primary'
                        }}
                      >
                        {url.originalUrl}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Shortened URL
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            color: 'primary.main',
                            fontWeight: 500
                          }}
                        >
                          {window.location.origin}/{url.shortCode}
                        </Typography>
                        <Button 
                          size="small" 
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/${url.shortCode}`);
                            logger.info('Copied shortened URL to clipboard', { shortCode: url.shortCode });
                          }}
                        >
                          Copy
                        </Button>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip 
                        label={`Expires: ${url.expiresAt.toLocaleString()}`}
                        size="small" 
                        color="warning"
                        variant="outlined"
                      />
                      <Chip 
                        label={`Code: ${url.shortCode}`}
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default UrlShortenerForm;