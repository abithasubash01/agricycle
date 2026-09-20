const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');

const SALT_ROUNDS = 10;

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user) {
  if (!user) return null;
  const { password_hash, ...rest } = user;
  return rest;
}

/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, phone, location } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'name, email, password, and role are required',
        statusCode: 400
      });
    }

    if (!['farmer', 'buyer'].includes(role)) {
      return res.status(400).json({
        error: 'Invalid role',
        message: 'role must be "farmer" or "buyer"',
        statusCode: 400
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 6 characters',
        statusCode: 400
      });
    }

    const existingUser = await db.users.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'Email already registered',
        message: 'An account with this email address already exists',
        statusCode: 409
      });
    }

    const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await db.users.create({ name, email, password_hash, role, phone, location });

    const token = generateToken(user);

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'email and password are required',
        statusCode: 400
      });
    }

    const user = await db.users.findByEmail(email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'No account found with this email address',
        statusCode: 401
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Incorrect password',
        statusCode: 401
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: 'Login successful',
      token,
      user: safeUser(user)
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await db.users.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found', statusCode: 404 });
    }
    return res.status(200).json({ user: safeUser(user) });
  } catch (err) {
    console.error('Me error:', err);
    return res.status(500).json({ error: 'Server error', message: err.message });
  }
});

module.exports = router;
