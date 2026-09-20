const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { calculateSummary, calculateFinancialHealthScore } = require('../services/analysis');
const {
  detectRecurringExpenses,
  analyzeSpendingPatterns,
  getMonthlyComparison,
  generateAIInsights
} = require('../services/ai');

// GET /api/analysis
router.get('/', async (req, res) => {
  try {
    const income = await db.getIncome();
    const expenses = await db.getExpenses();
    const budget = await db.getBudget();
    const goal = await db.getSavingsGoal();
    const prevTotals = db.getPreviousMonthTotals();

    const summary = calculateSummary(income, expenses);
    const patterns = analyzeSpendingPatterns(income, expenses, prevTotals);
    const monthly_comparison = getMonthlyComparison(expenses, prevTotals);
    const insights = generateAIInsights(income, expenses, budget, goal);
    const financial_health = calculateFinancialHealthScore(income, expenses, budget);

    res.json({
      summary,
      patterns,
      monthly_comparison,
      insights,
      financial_health
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/recurring
router.get('/recurring', async (req, res) => {
  try {
    const expenses = await db.getExpenses();
    const enhanced = detectRecurringExpenses(expenses);
    const recurring_items = enhanced.filter(e => e.is_recurring);
    const recurring_total = recurring_items.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

    res.json({
      recurring_expenses: recurring_items,
      total_recurring_amount: Math.round(recurring_total * 100) / 100,
      count: recurring_items.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/patterns
router.get('/patterns', async (req, res) => {
  try {
    const income = await db.getIncome();
    const expenses = await db.getExpenses();
    const prevTotals = db.getPreviousMonthTotals();
    const patterns = analyzeSpendingPatterns(income, expenses, prevTotals);
    res.json(patterns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/monthly-comparison
router.get('/monthly-comparison', async (req, res) => {
  try {
    const expenses = await db.getExpenses();
    const prevTotals = db.getPreviousMonthTotals();
    const comp = getMonthlyComparison(expenses, prevTotals);
    res.json(comp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/analysis/financial-health
router.get('/financial-health', async (req, res) => {
  try {
    const income = await db.getIncome();
    const expenses = await db.getExpenses();
    const budget = await db.getBudget();
    const health = calculateFinancialHealthScore(income, expenses, budget);
    res.json(health);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
