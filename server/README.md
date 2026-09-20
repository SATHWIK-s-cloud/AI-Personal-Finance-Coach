# AI Personal Finance Coach - Express Backend API

High-performance Node.js + Express.js backend for the AI Personal Finance Coach application integrated with Supabase PostgreSQL.

## Architecture

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: Supabase PostgreSQL (with resilient in-memory store for local/offline demo mode)
- **Environment**: dotenv

## Folder Structure

```
server/
├── src/
│   ├── server.js            # Express app entry point & middleware
│   ├── routes/
│   │   ├── income.js        # Income endpoints
│   │   ├── expenses.js      # Expense CRUD & auto-categorization
│   │   ├── budget.js        # Budget tracking endpoints
│   │   ├── savings.js       # Savings goal endpoints
│   │   ├── analysis.js      # Financial health & analysis endpoints
│   │   └── chat.js          # AI Coach chat & simulator endpoints
│   ├── services/
│   │   ├── database.js      # Supabase PostgreSQL client & data layer
│   │   ├── analysis.js      # Math & financial health scoring algorithms
│   │   └── ai.js            # Categorization & AI Coach engine
│   └── utils/
│       └── helpers.js       # Rounding & array helpers
├── package.json             # Node.js dependencies
├── .env                     # Environment variables
└── README.md                # Server documentation
```

## Setup & Running

1. **Navigate to the server directory**:
   ```bash
   cd server
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Update `.env` with your Supabase credentials:
   ```env
   PORT=8000
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-or-service-key
   ```

4. **Start the Server**:
   ```bash
   npm start
   ```
   Or for development mode with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoint Reference

- `GET /api/income` - Get monthly income
- `POST /api/income` - Update monthly income
- `GET /api/expenses` - Get expenses list
- `POST /api/expenses` - Add new expense
- `PUT /api/expenses/:expense_id` - Update expense
- `DELETE /api/expenses/:expense_id` - Delete expense
- `POST /api/categorize` - Predict expense category
- `GET /api/budget` - Get budget & category limits
- `POST /api/budget` - Update budget limits
- `GET /api/savings-goal` - Get savings progress
- `POST /api/savings-goal` - Update savings target
- `GET /api/analysis` - Aggregated financial analysis
- `GET /api/analysis/recurring` - Recurring expenses breakdown
- `GET /api/analysis/patterns` - Spending pattern insights
- `GET /api/analysis/monthly-comparison` - Month-over-month comparison
- `GET /api/analysis/financial-health` - Financial Health Score (0-100)
- `GET /api/financial-health` - Financial Health Score alias
- `POST /api/chat` - AI Finance Coach chat
- `POST /api/what-if` - What-if scenario simulator
- `POST /api/reset-demo` - Reset financial state to default demo data
