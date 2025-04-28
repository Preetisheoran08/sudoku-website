// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const gameRoutes = require('./routes/gameRoutes');

// Initialize app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb+srv://shivani23cse:rNBuM1xTUm0p59nt@cluster0.vcb2sgz.mongodb.net/sudoku-game', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.log('Error connecting to MongoDB:', err);
});

// Routes
app.use('/api/games', gameRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

