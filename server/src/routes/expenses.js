const express = require('express');
const router = express.Router();
const db = require('../services/database');
const { suggestExpenseCategory, detectRecurringExpenses } = require('../services/ai');

// GET /api/expenses
router.get('/', async (req, res) => {
  try {
    const rawExpenses = await db.getExpenses();
    const expenses = detectRecurringExpenses(rawExpenses);
    res.json({ expenses, count: expenses.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses
router.post('/', async (req, res) => {
  try {
    let { description, amount, category, date, is_recurring } = req.body;
    amount = Number(amount);
    if (!description || isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Description and positive amount are required.' });
    }

    if (!category || category === 'Other') {
      const suggested = suggestExpenseCategory(description);
      if (suggested.category !== 'Other') category = suggested.category;
      if (suggested.is_recurring) is_recurring = true;
    }

    if (!date) {
      date = new Date().toISOString().split('T')[0];
    }

    const newExpense = await db.addExpense({
      description,
      amount,
      category: category || 'Other',
      date,
      is_recurring: Boolean(is_recurring)
    });

    res.json({ expense: newExpense, message: 'Expense added successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/expenses/:expense_id
router.put('/:expense_id', async (req, res) => {
  try {
    const { expense_id } = req.params;
    const updated = await db.updateExpense(expense_id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ expense: updated, message: 'Expense updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/expenses/:expense_id
router.delete('/:expense_id', async (req, res) => {
  try {
    const { expense_id } = req.params;
    const success = await db.deleteExpense(expense_id);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    res.json({ message: 'Expense deleted successfully', id: expense_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/expenses/categorize (or /api/categorize)
router.post('/categorize', async (req, res) => {
  try {
    const { description } = req.body;
    const suggested = suggestExpenseCategory(description || '');
    res.json({
      description: description || '',
      suggested_category: suggested.category,
      confidence: suggested.confidence,
      is_recurring: suggested.is_recurring
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
