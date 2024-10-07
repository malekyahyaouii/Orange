import React, { useState } from 'react';
import {
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

function AuthComponent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Pour afficher les erreurs

  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Envoyer les données au serveur pour authentification
      const response = await axios.post('http://localhost:3000/Login/login', {
        email,
        password,
      });

      // Si l'authentification réussit, redirige vers le tableau de bord
      navigate('/dashboard'); // Redirection vers la page de tableau de bord

    } catch (error) {
      // Afficher un message d'erreur détaillé si l'authentification échoue
      if (error.response) {
        // Le serveur a répondu avec un code d'état qui indique une erreur
        setError(`Erreur: ${error.response.data.msg || 'Mot de passe incorrect ou email non trouvé'}`);
      } else {
        // Le serveur n'a pas répondu ou une erreur de réseau s'est produite
        setError('Erreur de connexion');
      }
      console.error('Authentication error:', error.response ? error.response.data : error.message);
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
            Bienvenue !
          </Typography>

          {error && (
            <Typography color="error" sx={{ marginBottom: '20px', textAlign: 'center' }}>
              {error}
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
              autoFocus
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
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
                },
              }}
            />
            <FormControlLabel
              control={<Checkbox value="remember" color="primary" />}
              label="Se souvenir de moi"
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
              Connexion
            </Button>
            <Grid container>
              <Grid item xs>
                <Link href="/ForgotPassword" variant="body2" sx={{ color: theme.palette.secondary.main }}>
                  Mot de passe oublié ?
                </Link>
              </Grid>
              <Grid item>
                <Link href="/register" variant="body2" sx={{ color: theme.palette.secondary.main }}>
                  {"Pas de compte ? Inscrivez-vous"}
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default AuthComponent;
