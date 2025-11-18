const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB error:', err);
    process.exit(1);
  });

const Car = mongoose.model('Car', new mongoose.Schema({
  model: { type: String, required: true },
  type: { type: String, required: true },
  year: { type: Number, required: true },
  dailyRate: { type: Number, required: true },
  status: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true }));

// Routes
app.get('/api/cars', async (req, res) => {
  try {
    const cars = await Car.find().sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/available', async (req, res) => {
  try {
    const cars = await Car.find({ status: 'Available' }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/cars/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const car = await Car.findById(req.params.id);
    car ? res.json(car) : res.status(404).json({ message: 'Car not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/cars', async (req, res) => {
  try {
    const car = new Car(req.body);
    const savedCar = await car.save();
    res.status(201).json(savedCar);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.put('/api/cars/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    car ? res.json(car) : res.status(404).json({ message: 'Car not found' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/cars/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid ID' });
    }
    const car = await Car.findByIdAndDelete(req.params.id);
    car ? res.json({ message: 'Car deleted', deletedCar: car }) : res.status(404).json({ message: 'Car not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AutoRent API running', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
