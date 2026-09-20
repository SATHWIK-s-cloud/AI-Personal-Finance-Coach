const express = require('express');
const router = express.Router();
const db = require('../services/database');

// GET /api/income
router.get('/', async (req, res) => {
  try {
    const income = await db.getIncome();
    res.json({ income });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/income
router.post('/', async (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Monthly income amount must be a positive number.' });
    }
    const updatedAmount = await db.setIncome(amount);
    res.json({ income: updatedAmount, message: 'Income updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
