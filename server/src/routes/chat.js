const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { calculateWhatIfScenario } = require('../services/analysis');
const { generateChatResponse } = require('../services/ai');

// POST /api/chat
router.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    const income = await db.getIncome();
    const expenses = await db.getExpenses();
    const budget = await db.getBudget();
    const goal = await db.getSavingsGoal();

    const reply = generateChatResponse(message, income, expenses, budget, goal);
    res.json({ message, reply });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/what-if
router.post('/what-if', async (req, res) => {
  try {
    const scenarioExpenses = req.body.expenses || {};
    const income = await db.getIncome();
    const expenses = await db.getExpenses();

    const simulation = calculateWhatIfScenario(income, expenses, scenarioExpenses);
    res.json(simulation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reset-demo
router.post('/reset-demo', async (req, res) => {
  try {
    await db.resetDemoData();
    res.json({ message: 'Demo financial state reset to original sample values' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
