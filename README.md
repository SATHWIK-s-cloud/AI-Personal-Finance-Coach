# 🚀 AI Personal Finance Coach

A 24-Hour Hackathon Full-Stack Application integrating Expense & Income Tracking, AI/ML Spending Pattern Analysis, Budget & Savings Goal Planning, Visual Recharts Analytics, What-If Savings Simulator, and an Interactive AI Finance Chatbot into one single fintech dashboard.

---

## 🏗️ Architecture & Modules

The application combines 4 team member modules into one seamless user experience:

1. **Member 1 — Expense & Income Module**
   - Income editor and total display.
   - Expense transaction manager with description, amount, category, date, and recurring flag.
   - Transaction History table with search, filter, inline editing, and deletion modal confirmation.

2. **Member 2 — AI/ML & Analysis Engine**
   - Automatic expense categorization based on text descriptions.
   - Recurring expense detection.
   - Spending pattern analysis (highest/lowest spending categories, unusual spending alerts).
   - Monthly spending comparison (current vs. previous month).

3. **Member 3 — Budget & Savings Module**
   - Monthly total budget & category-wise budget limits.
   - Dynamic budget usage alerts (70% warning, 90% high usage, Exceeded alert).
   - Savings Goal tracker with target amount, target date, suggested monthly savings calculation (`Income - Budget`), and progress bar.

4. **Member 4 — Frontend, Visualizations & AI Coach**
   - Fintech Dashboard with Summary Cards & Financial Health Score ring (educational rating 0–100).
   - Interactive Recharts visualizations (Category Donut, Budget vs. Actual, Monthly Comparison).
   - AI Insights card with clear distinction between **Calculated Facts** and **AI Recommendations**.
   - Interactive What-If Savings Simulator with expense sliders.
   - AI Finance Chatbot assistant with context-aware responses.

---

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Recharts, Lucide Icons, JavaScript.
- **Backend**: Python, FastAPI, Pydantic, Uvicorn, REST APIs.
- **Database**: MongoDB (via Motor/PyMongo) with automatic failover to in-memory JSON state engine for 100% demo uptime guarantee.

---

## ⚡ Quickstart Guide

### 1. Start FastAPI Backend (Port 8000)

```bash
# Install Python dependencies
pip install -r backend/requirements.txt

# Start backend server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend REST API documentation is accessible at `http://127.0.0.1:8000/docs`.

### 2. Start React Frontend (Vite)

```bash
# Install npm packages
npm install

# Run frontend dev server
npm run dev
```

Open your browser to `http://localhost:5173`.

---

## 🎯 REST API Endpoints Summary

- `GET /api/income`, `POST /api/income`
- `GET /api/expenses`, `POST /api/expenses`, `PUT /api/expenses/{id}`, `DELETE /api/expenses/{id}`
- `POST /api/categorize`
- `GET /api/analysis`, `GET /api/analysis/recurring`, `GET /api/analysis/patterns`, `GET /api/analysis/monthly-comparison`
- `GET /api/budget`, `POST /api/budget`
- `GET /api/savings-goal`, `POST /api/savings-goal`
- `GET /api/financial-health`
- `POST /api/what-if`
- `POST /api/chat`
- `POST /api/reset-demo`

---

## 🌟 Demo Features

Click **"Reset Demo Data"** in the top header bar at any time to instantly restore the default hackathon sample numbers for live presentations.
