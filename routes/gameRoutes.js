// routes/gameRoutes.js
const express = require('express');
const Game = require('../models/Game');
const router = express.Router();

// Create a new game
router.post('/new', async (req, res) => {
    try {
        const { userId, difficulty, puzzle, theme } = req.body;

        // Save new game to the database
        const game = new Game({
            userId,
            difficulty,
            puzzle,
            theme
        });

        await game.save();
        res.status(201).json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating game' });
    }
});

// Get game state by userId
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const game = await Game.findOne({ userId });
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching game' });
    }
});

// Update game moves
router.put('/:gameId/move', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { move } = req.body;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        game.userMoves.push(move); // Save the user's move
        await game.save();

        res.json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating game' });
    }
});

// Update game theme (Light/Dark mode)
router.put('/:gameId/theme', async (req, res) => {
    try {
        const { gameId } = req.params;
        const { theme } = req.body;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        game.theme = theme; // Update the theme
        await game.save();

        res.json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating theme' });
    }
});

// Mark game as completed
router.put('/:gameId/complete', async (req, res) => {
    try {
        const { gameId } = req.params;

        const game = await Game.findById(gameId);
        if (!game) {
            return res.status(404).json({ message: 'Game not found' });
        }

        game.completed = true;
        await game.save();

        res.json(game);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error completing game' });
    }
});

module.exports = router;
