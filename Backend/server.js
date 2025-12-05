// Backend/server.js

require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

// 🔑 Read env vars
const {
  MONGODB_URI,
  JWT_SECRET,
  GOOGLE_CLIENT_ID,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  FRONTEND_URL, // e.g. https://infr-3120-fall25-project-6brf.vercel.app
} = process.env;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is not set in environment variables');
  process.exit(1);
}
if (!GOOGLE_CLIENT_ID) {
  console.error('❌ GOOGLE_CLIENT_ID is not set in environment variables');
  process.exit(1);
}

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// ===== Middleware =====
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:5500',
      FRONTEND_URL,
    ].filter(Boolean),
    credentials: false,
  })
);
app.use(express.json());

// Serve static frontend (optional if you’re serving from backend locally)
app.use(express.static(path.join(__dirname, '../Frontend')));

// ===== MongoDB Connection =====
console.log('🚗 Starting AutoRent Server...');

mongoose
  .connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log('✅ MongoDB connected successfully'))
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
  });

// ===== Mongoose Models =====
const carSchema = new mongoose.Schema(
  {
    model: { type: String, required: true },
    type: { type: String, required: true },
    year: { type: Number, required: true },
    dailyRate: { type: Number, required: true },
    status: {
      type: String,
      required: true,
      enum: ['Available', 'Rented', 'Maintenance'],
    },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // may be '' for social-only accounts
  },
  { timestamps: true }
);

const Car = mongoose.model('Car', carSchema);
const User = mongoose.model('User', userSchema);

// ===== Auth Middleware (JWT) =====
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ message: 'Authorization header missing or invalid' });
  }

  const token = header.replace('Bearer ', '').trim();
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// ===== API ROUTES =====

// Health check
app.get('/api/health', async (req, res) => {
  const state = mongoose.connection.readyState;
  res.json({
    status: 'OK',
    server: 'AutoRent API is running',
    database: state === 1 ? 'MongoDB (connected)' : 'MongoDB (connecting)',
    timestamp: new Date().toISOString(),
  });
});

// ---------- Email/Password Auth ----------

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error('❌ Error in /api/auth/register:', err);
    return res
      .status(500)
      .json({ message: 'Error creating user', error: err.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res
        .status(400)
        .json({ message: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error('❌ Error in /api/auth/login:', err);
    return res
      .status(500)
      .json({ message: 'Error logging in', error: err.message });
  }
});

// ---------- Google Auth ----------

app.post('/api/auth/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password: '' });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({
      message: 'Google login successful',
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (err) {
    console.error('❌ Google login error:', err);
    res
      .status(500)
      .json({ message: 'Google login failed', error: err.message });
  }
});

// ---------- GitHub Auth (OAuth redirect flow) ----------

// Step 1: Redirect to GitHub
app.get('/api/auth/github', (req, res) => {
  const redirectUri = `${req.protocol}://${req.get(
    'host'
  )}/api/auth/github/callback`;

  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: 'user:email',
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

// Step 2: GitHub callback
app.get('/api/auth/github/callback', async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).send('Missing code');
    }

    const redirectUri = `${req.protocol}://${req.get(
      'host'
    )}/api/auth/github/callback`;

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      console.error('GitHub token error:', tokenData);
      return res.status(500).send('GitHub token exchange failed');
    }

    // Get user info
    const userRes = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
      },
    });
    const ghUser = await userRes.json();

    // Get primary email
    let email = ghUser.email;
    if (!email) {
      const emailRes = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const emails = await emailRes.json();
      const primary =
        emails.find((e) => e.primary && e.verified) || emails[0];
      email = primary ? primary.email : null;
    }

    if (!email) {
      return res.status(500).send('Could not retrieve email from GitHub');
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, password: '' });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Redirect back to frontend with token + email in query
    const redirectTo = `${FRONTEND_URL}/#!/login?githubToken=${encodeURIComponent(
      token
    )}&email=${encodeURIComponent(email)}`;

    res.redirect(redirectTo);
  } catch (err) {
    console.error('❌ GitHub auth error:', err);
    res.status(500).send('GitHub login failed');
  }
});

// ---------- Cars API ----------

// Get all cars
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    return res.json(cars);
  } catch (err) {
    console.error('❌ Error fetching cars:', err);
    return res.status(500).json({ error: 'Error fetching cars' });
  }
});

// Get available cars
app.get('/api/cars/available', async (req, res) => {
  try {
    const cars = await Car.find({ status: 'Available' }).sort({
      createdAt: -1,
    });
    return res.json(cars);
  } catch (err) {
    console.error('❌ Error fetching available cars:', err);
    return res.status(500).json({ error: 'Error fetching available cars' });
  }
});

// Get single car
app.get('/api/cars/:id', async (req, res) => {
  try {
    const car = await Car.findById(req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    return res.json(car);
  } catch (err) {
    console.error('❌ Error fetching car:', err);
    return res.status(500).json({ error: 'Error fetching car' });
  }
});

// Add new car (protected)
app.post('/api/cars', authMiddleware, async (req, res) => {
  try {
    const { model, type, year, dailyRate, status, description } = req.body;
    if (!model || !type || !year || !dailyRate || !status) {
      return res
        .status(400)
        .json({ error: 'Missing required car fields' });
    }

    const car = new Car({ model, type, year, dailyRate, status, description });
    const saved = await car.save();
    return res.status(201).json(saved);
  } catch (err) {
    console.error('❌ Error creating car:', err);
    return res.status(400).json({ error: err.message });
  }
});

// Update car (protected)
app.put('/api/cars/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Car.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Car not found' });
    return res.json(updated);
  } catch (err) {
    console.error('❌ Error updating car:', err);
    return res.status(400).json({ error: err.message });
  }
});

// Delete car (protected)
app.delete('/api/cars/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Car.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Car not found' });
    return res.json({ message: 'Car deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting car:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ===== Catch-all: (optional) serve Frontend SPA in local dev =====
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend', 'index.html'));
});

// ===== Start Server =====
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🎉 AutoRent server running on port ${PORT}`);
  console.log(`📍 API health: http://localhost:${PORT}/api/health`);
});
