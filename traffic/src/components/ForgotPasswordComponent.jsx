import React, { useState } from 'react';
import axios from 'axios';
import {
  Button,
  TextField,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

function ForgotPasswordComponent() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/Login/reset-password', {
        email,
        newPassword,
        confirmNewPassword,
      });

      if (response.status === 200) {
        setSuccess('Mot de passe réinitialisé avec succès.');
        navigate('/'); 
      } else {
        setError('Erreur lors de la réinitialisation du mot de passe.');
      }
    } catch (error) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', error.response ? error.response.data : error.message);
      setError(error.response?.data?.message || 'Erreur lors de la réinitialisation du mot de passe.');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper
        elevation={6}
        sx={{
          padding: theme.spacing(3),
          marginTop: theme.spacing(8),
          borderRadius: '12px',
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h2"
            variant="h4"
            sx={{ marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}
          >
            Réinitialiser le mot de passe
          </Typography>

          {error && (
            <Typography color="error" sx={{ marginBottom: '20px', textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {success && (
            <Typography color="success" sx={{ marginBottom: '20px', textAlign: 'center' }}>
              {success}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse e-mail"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="newPassword"
              label="Nouveau mot de passe"
              type="password"
              id="newPassword"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmNewPassword"
              label="Confirmer le nouveau mot de passe"
              type="password"
              id="confirmNewPassword"
              autoComplete="new-password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                padding: theme.spacing(1.5),
                mt: 3,
                mb: 2,
                borderRadius: '8px',
                backgroundColor: theme.palette.secondary.main,
                '&:hover': {
                  backgroundColor: theme.palette.secondary.light,
                },
              }}
            >
              Réinitialiser le mot de passe
            </Button>

            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/" variant="body2" sx={{ color: theme.palette.secondary.main }}>
                  Vous avez déjà un compte ? Connexion
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPasswordComponent;
