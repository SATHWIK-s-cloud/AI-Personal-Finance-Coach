# AI Personal Finance Coach 🚀

An intelligent, full-stack personal finance coach web application built with **React.js + Vite** on the frontend and **Node.js + Express.js + Supabase PostgreSQL** on the backend.

---

## 🏗️ Architecture & Technology Stack

### Tech Stack

- **Frontend**: React.js, Vite, JavaScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend**: Node.js, Express.js, CommonJS
- **Database**: Supabase PostgreSQL (with resilient in-memory fallback store)

```
                       +-----------------------------------+
                       |    React + Vite Client (Web)      |
                       |       (http://localhost:5173)      |
                       +-----------------+-----------------+
                                         |
                                         | REST API (HTTP)
                                         v
                       +-----------------------------------+
                       |       Node + Express Backend      |
                       |       (http://localhost:8000)     |
                       +-----------------+-----------------+
                                         |
                                         | Supabase SDK (@supabase/supabase-js)
                                         v
                       +-----------------------------------+
                       |       Supabase PostgreSQL DB      |
                       +-----------------------------------+
```

---

## 📁 Project Structure

```
AI-Personal-Finance-Coach/
│
├── client/
│   ├── public/              # Static web assets
│   ├── src/                 # React UI components & services
│   │   ├── components/      # UI components (Dashboard, Charts, Coach, etc.)
│   │   ├── services/        # API service layer (api.js)
│   │   ├── App.jsx          # Main App component
│   │   └── main.jsx         # App mounting point
│   ├── package.json         # Frontend dependencies & scripts
│   ├── vite.config.js       # Vite configuration
│   └── index.html           # HTML template
│
├── server/
│   ├── src/
│   │   ├── server.js        # Express application entry point & CORS
│   │   ├── routes/          # Express API route modules
│   │   │   ├── income.js    # /api/income endpoints
│   │   │   ├── expenses.js  # /api/expenses & /api/categorize endpoints
│   │   │   ├── budget.js    # /api/budget endpoints
│   │   │   ├── savings.js   # /api/savings-goal endpoints
│   │   │   ├── analysis.js  # /api/analysis & financial health endpoints
│   │   │   └── chat.js      # /api/chat, /api/what-if, /api/reset-demo endpoints
│   │   ├── services/        # Service layer
│   │   │   ├── database.js  # Supabase PostgreSQL client & data layer
│   │   │   ├── analysis.js  # Financial calculations & health scoring
│   │   │   └── ai.js        # AI categorization & coaching engine
│   │   └── utils/
│   │       └── helpers.js   # Number rounding & category utilities
│   ├── package.json         # Backend dependencies (express, @supabase/supabase-js)
│   ├── .env                 # Backend environment variables
│   └── README.md            # Backend-specific documentation
│
├── .gitignore               # Git ignore rules
└── README.md                # Project documentation
```

---

## ⚙️ Environment Variables

Configure `server/.env` with your Supabase credentials:

```env
PORT=8000
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_or_service_key
```

> **Note**: If `SUPABASE_URL` and `SUPABASE_KEY` are unconfigured, the Express backend automatically uses an in-memory demo store so the application runs 100% reliably out of the box.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a project at [Supabase.com](https://supabase.com).
2. Under **Project Settings > API**, copy your **Project URL** and **anon API key** into `server/.env`.
3. Required Database Tables & Columns:
   - **`income`**: `id` (TEXT, PRIMARY KEY), `amount` (NUMERIC)
   - **`expenses`**: `id` (TEXT, PRIMARY KEY), `description` (TEXT), `amount` (NUMERIC), `category` (TEXT), `date` (TEXT), `is_recurring` (BOOLEAN)
   - **`budget`**: `id` (TEXT, PRIMARY KEY), `total_budget` (NUMERIC), `categories` (JSONB)
   - **`savings_goal`**: `id` (TEXT, PRIMARY KEY), `target_amount` (NUMERIC), `target_date` (TEXT), `current_savings` (NUMERIC)

---

## 🚀 How to Run the Project

### 1. Frontend Setup & Launch

Open a terminal in the project root:

```bash
cd client
npm install
npm run dev
```

The frontend will run at `http://localhost:5173`.

---

### 2. Backend Setup & Launch

Open a separate terminal in the project root:

```bash
cd server
npm install
npm start
```

The Node.js Express server will run at `http://localhost:8000`.

---

## ✨ Features Preserved

- 📊 **Financial Dashboard**: Summary of monthly income, total expenses, savings rate, and net surplus.
- 💵 **Income & Expense Entry**: Easy transaction logging with auto-categorization powered by AI.
- 🏷️ **Category-Wise Expenses**: Breakdown across Rent, Food, Transport, Shopping, Entertainment, Bills, and Other.
- 📈 **Spending Charts**: Interactive charts powered by Recharts.
- 🎯 **Budget Monitoring**: Visual progress bars and proactive overspending alerts.
- 💰 **Savings Goals**: Milestone progress and suggested monthly targets.
- 🩺 **Financial Health Score**: Algorithmic rating (0-100) with detailed tier breakdown.
- 💡 **AI Insights**: Fact-based metrics and tailored financial recommendations.
- 🔮 **What-If Simulator**: Interactive scenario modeling for instant savings projections.
- 🤖 **AI Finance Coach**: Conversational chat interface for personalized financial guidance.
