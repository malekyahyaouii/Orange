import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if the user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Create a new user instance
    user = new User({
      name,
      email,
      password,
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      'yourJWTSecret', // Replace with your own secret key
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Login user and verify password
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Check if the password is correct
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    // Generate a JWT token
    const payload = {
      user: {
        id: user.id,
      },
    };

    jwt.sign(
      payload,
      'yourJWTSecret', // Replace with your own secret key
      { expiresIn: '1h' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Route pour réinitialiser le mot de passe

router.post('/reset-password', async (req, res) => {
  const { email, newPassword, confirmNewPassword } = req.body;

  // Vérifier que les champs sont fournis
  if (!email || !newPassword || !confirmNewPassword) {
    return res.status(400).json({ message: 'Tous les champs sont requis.' });
  }

  // Vérifier que les mots de passe correspondent
  if (newPassword !== confirmNewPassword) {
    return res.status(400).json({ message: 'Les mots de passe ne correspondent pas.' });
  }

  try {
    // Trouver l'utilisateur
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }

    // Hacher le nouveau mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe dans la base de données
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur du serveur.' });
  }
});

export default router;
