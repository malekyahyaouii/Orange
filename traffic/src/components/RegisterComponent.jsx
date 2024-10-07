import React, { useState } from 'react';
import {
  Avatar,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Link,
  Grid,
  Box,
  Typography,
  Container,
  Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importer Axios
import image from 'assets/image.png';

function RegisterComponent() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(''); // Pour afficher les erreurs
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3000/Login/register', {
        name: `${firstName} ${lastName}`,
        email,
        password,
      });

      // Affichez le token ou les données reçues si nécessaire
      console.log('User registered successfully:', response.data);

      // Naviguez vers une autre page après l'inscription
      navigate('/'); // Changez '/' en la route souhaitée, par exemple '/dashboard'
    } catch (error) {
      setError('Erreur lors de l\'inscription. Veuillez réessayer.');
      console.error('Registration error:', error.response ? error.response.data : error.message);
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
          <Box
            component="img"
            src={image}
            alt="Orange Logo"
            sx={{
              width: '100px',
              marginBottom: '20px',
            }}
          />

          <Typography
            component="h2"
            variant="h4"
            sx={{ marginBottom: '20px', fontWeight: 'bold', textAlign: 'center' }}
          >
            Créer un compte
          </Typography>

          {error && (
            <Typography color="error" sx={{ marginBottom: '20px', textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstName"
                  required
                  fullWidth
                  id="firstName"
                  label="Prénom"
                  autoFocus
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastName"
                  label="Nom"
                  name="lastName"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                    },
                  }}
                />
              </Grid>
            </Grid>

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
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
              name="confirmPassword"
              label="Confirmer le mot de passe"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
            />

            <FormControlLabel
              control={<Checkbox value="acceptTerms" color="primary" />}
              label="J'accepte les termes et conditions"
              sx={{ marginBottom: theme.spacing(2) }}
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
              S'inscrire
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

export default RegisterComponent;
