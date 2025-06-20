const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    puzzle: { type: String, required: true },
    userMoves: { type: Array, default: [] }, // Stores user inputs
    theme: { type: String, enum: ['light', 'dark'], default: 'light' },
    completed: { type: Boolean, default: false },
    timeTaken: { type: Number, default: 0 } // ⏱️ Time in seconds
}, { timestamps: true });

module.exports = mongoose.model('Game', gameSchema);
