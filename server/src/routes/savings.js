const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { calculateSummary } = require('../services/analysis');

// GET /api/savings-goal
router.get('/', async (req, res) => {
  try {
    const income = await db.getIncome();
    const expenses = await db.getExpenses();
    const budget = await db.getBudget();
    const goal = await db.getSavingsGoal();

    const summary = calculateSummary(income, expenses);
    const total_budget = Number(budget.total_budget) || 32000;
    const suggested_monthly_savings = Math.max(0, income - total_budget);

    const target_amt = Number(goal.target_amount) || 50000;
    const curr_savings = Number(goal.current_savings) || 15000;
    const progress_pct = target_amt > 0 ? (curr_savings / target_amt) * 100 : 0;

    res.json({
      target_amount: target_amt,
      target_date: goal.target_date || '2027-03-31',
      current_savings: curr_savings,
      progress_percentage: Math.round(Math.min(100, progress_pct) * 10) / 10,
      suggested_monthly_savings: Math.round(suggested_monthly_savings * 100) / 100,
      current_actual_monthly_savings: summary.savings
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/savings-goal
router.post('/', async (req, res) => {
  try {
    const saved = await db.setSavingsGoal(req.body);
    res.json({ savings_goal: saved, message: 'Savings goal updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
