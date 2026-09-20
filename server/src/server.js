const express = require('express');
const cors = require('cors');
require('dotenv').config();

const incomeRoutes = require('./routes/income');
const expensesRoutes = require('./routes/expenses');
const budgetRoutes = require('./routes/budget');
const savingsRoutes = require('./routes/savings');
const analysisRoutes = require('./routes/analysis');
const chatRoutes = require('./routes/chat');
const { calculateFinancialHealthScore } = require('./services/analysis');
const db = require('./services/database');

const app = express();
const PORT = process.env.PORT || 8000;

// Enable CORS & JSON parsing middleware
app.use(cors());
app.use(express.json());

// Root health check endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    app: 'AI Personal Finance Coach Express Backend API',
    version: '1.0.0',
    database_provider: db.useSupabase() ? 'Supabase PostgreSQL' : 'Resilient In-Memory Demo Store'
  });
});

// API Routes
app.use('/api/income', incomeRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/savings-goal', savingsRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api', chatRoutes);

// Additional route aliases for 100% frontend compatibility
app.post('/api/categorize', (req, res, next) => {
  req.url = '/categorize';
  expensesRoutes(req, res, next);
});

app.get('/api/financial-health', async (req, res) => {
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

// Start Express Server
const server = app.listen(PORT, () => {
  console.log(`🚀 AI Personal Finance Coach Express Backend running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use by another process. Please stop existing backend instances before restarting.`);
    process.exit(1);
  } else {
    console.error('❌ Express server error:', err);
  }
});

