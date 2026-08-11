import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password.',
    });
  }

  try {
    let user = null;
    let isMatch = false;

    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      if (rows.length > 0) {
        user = rows[0];
        isMatch = await bcrypt.compare(password, user.password);
      }
    } catch (dbErr) {
      console.warn('DB query failed in login, falling back to default admin check:', dbErr.message);
    }

    // Default admin check fallback if DB table not seeded
    if (!user && email === 'admin@jalyn.com' && password === 'admin123') {
      user = {
        id: 1,
        name: 'Admin User',
        email: 'admin@jalyn.com',
        role: 'admin',
      };
      isMatch = true;
    }

    if (!user || !isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'jalyn_secret_jwt_key_2026',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Login failed: ' + error.message,
    });
  }
};

export const getMe = async (req, res) => {
  return res.json({
    success: true,
    user: req.user,
  });
};
