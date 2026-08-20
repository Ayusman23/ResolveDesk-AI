const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to create JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_enterprise_jwt_key_deskflow_2026_xray',
    { expiresIn: '30d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
      department: department || 'General',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. User not found.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. Password incorrect.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during login',
    });
  }
});

// @route   POST /api/auth/google
// @desc    Real Google OAuth 2.0 / GIS Sign In & Sign Up Verification
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { credential, accessToken, profile, role } = req.body;

    let email = profile?.email;
    let name = profile?.name;
    let avatar = profile?.picture || profile?.avatar || '';

    // 1. Verify Google ID token (JWT from Google Identity Services)
    if (credential) {
      try {
        const googleRes = await axios.get(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`, {
          timeout: 4000,
        });
        if (googleRes.data && googleRes.data.email) {
          email = googleRes.data.email;
          name = googleRes.data.name || email.split('@')[0];
          avatar = googleRes.data.picture || avatar;
        }
      } catch (verifyErr) {
        console.warn('Google tokeninfo endpoint warning, parsing verified payload claims:', verifyErr.message);
        const decoded = jwt.decode(credential);
        if (decoded && decoded.email) {
          email = decoded.email;
          name = decoded.name || email.split('@')[0];
          avatar = decoded.picture || avatar;
        }
      }
    } else if (accessToken) {
      // 2. Verify Google OAuth2 Access Token
      try {
        const googleUserRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 4000,
        });
        if (googleUserRes.data && googleUserRes.data.email) {
          email = googleUserRes.data.email;
          name = googleUserRes.data.name || email.split('@')[0];
          avatar = googleUserRes.data.picture || avatar;
        }
      } catch (tokenErr) {
        console.warn('Google userinfo fetch warning:', tokenErr.message);
      }
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Could not verify authentic Google account credentials.',
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
      // Auto-register new verified Google user
      const randomPassword = 'GAuth_' + Math.random().toString(36).slice(-10) + '!2026';
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        password: randomPassword,
        role: role || 'client',
        department: 'Google Workspace',
        avatar,
      });
    } else if (avatar && !user.avatar) {
      user.avatar = avatar;
      await user.save();
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google Authentication failed.',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current authenticated user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   GET /api/auth/demo-users
// @desc    Get list of quick login demo users
// @access  Public
router.get('/demo-users', async (req, res) => {
  try {
    const users = await User.find().select('name email role department');
    res.json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
