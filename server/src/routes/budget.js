const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { calculateBudgetAnalysis } = require('../services/analysis');

// GET /api/budget
router.get('/', async (req, res) => {
  try {
    const expenses = await db.getExpenses();
    const budgetData = await db.getBudget();
    const analysis = calculateBudgetAnalysis(expenses, budgetData);
    res.json(analysis);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budget
router.post('/', async (req, res) => {
  try {
    const { total_budget, categories } = req.body;
    const saved = await db.setBudget({ total_budget, categories });
    const expenses = await db.getExpenses();
    const analysis = calculateBudgetAnalysis(expenses, saved);
    res.json({ budget: analysis, message: 'Budget updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
