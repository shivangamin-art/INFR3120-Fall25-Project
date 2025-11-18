const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

app.use(cors());
app.use(express.json());

// Serve ALL static files (CSS, JS, images)
app.use(express.static(__dirname));

// MongoDB connection and routes...
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch(err => console.error('❌ MongoDB Error:', err.message));

const Car = mongoose.model('Car', new mongoose.Schema({
  model: { type: String, required: true },
  type: { type: String, required: true },
  year: { type: Number, required: true },
  dailyRate: { type: Number, required: true },
  status: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true }));

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AutoRent API running', timestamp: new Date().toISOString() });
});

app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚗 Server running on port ${PORT}`);
});
