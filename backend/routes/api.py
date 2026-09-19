from fastapi import APIRouter, HTTPException, Path
from typing import Dict, Any, List
from backend.models import (
    IncomeUpdate, ExpenseCreate, ExpenseUpdate, ExpenseItem,
    BudgetUpdate, SavingsGoalItem, CategorizeRequest,
    WhatIfRequest, ChatRequest
)
from backend.database import db_manager
from backend.calculations import (
    calculate_summary, calculate_category_spending,
    calculate_financial_health_score, calculate_budget_analysis,
    calculate_what_if_scenario
)
from backend.services.ai_service import (
    suggest_expense_category, detect_recurring_expenses,
    analyze_spending_patterns, get_monthly_comparison,
    generate_ai_insights, generate_chat_response
)

router = APIRouter()

# ----------------- INCOME ENDPOINTS -----------------
@router.get("/income")
async def get_income():
    amount = await db_manager.get_income()
    return {"income": amount}

@router.post("/income")
async def set_income(payload: IncomeUpdate):
    amount = await db_manager.set_income(payload.amount)
    return {"income": amount, "message": "Income updated successfully"}

# ----------------- EXPENSE ENDPOINTS -----------------
@router.get("/expenses")
async def get_expenses():
    expenses = await db_manager.get_expenses()
    enhanced_expenses = detect_recurring_expenses(expenses)
    return {"expenses": enhanced_expenses, "count": len(enhanced_expenses)}

@router.post("/expenses")
async def add_expense(payload: ExpenseCreate):
    # Auto categorization if category is blank or generic
    category = payload.category
    is_recurring = payload.is_recurring
    
    if not category or category == "Other":
        s_cat, _, s_rec = suggest_expense_category(payload.description)
        if s_cat != "Other":
            category = s_cat
        if s_rec:
            is_recurring = True

    date_str = payload.date
    if not date_str:
        from datetime import date
        date_str = date.today().isoformat()

    expense_dict = {
        "description": payload.description,
        "amount": payload.amount,
        "category": category,
        "date": date_str,
        "is_recurring": is_recurring
    }
    
    new_expense = await db_manager.add_expense(expense_dict)
    return {"expense": new_expense, "message": "Expense added successfully"}

@router.put("/expenses/{expense_id}")
async def update_expense(expense_id: str, payload: ExpenseUpdate):
    update_data = payload.dict(exclude_unset=True)
    updated = await db_manager.update_expense(expense_id, update_data)
    if not updated:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"expense": updated, "message": "Expense updated successfully"}

@router.delete("/expenses/{expense_id}")
async def delete_expense(expense_id: str):
    success = await db_manager.delete_expense(expense_id)
    if not success:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"message": "Expense deleted successfully", "id": expense_id}

# ----------------- CATEGORIZATION -----------------
@router.post("/categorize")
async def categorize_expense(payload: CategorizeRequest):
    cat, confidence, is_rec = suggest_expense_category(payload.description)
    return {
        "description": payload.description,
        "suggested_category": cat,
        "confidence": confidence,
        "is_recurring": is_rec
    }

# ----------------- ANALYSIS ENDPOINTS -----------------
@router.get("/analysis")
async def get_full_analysis():
    income = await db_manager.get_income()
    expenses = await db_manager.get_expenses()
    budget = await db_manager.get_budget()
    goal = await db_manager.get_savings_goal()
    prev_totals = db_manager.in_memory_data.get("previous_month_expenses", {})

    summary = calculate_summary(income, expenses)
    patterns = analyze_spending_patterns(income, expenses, prev_totals)
    monthly_comp = get_monthly_comparison(expenses, prev_totals)
    insights = generate_ai_insights(income, expenses, budget, goal)
    health = calculate_financial_health_score(income, expenses, budget)

    return {
        "summary": summary,
        "patterns": patterns,
        "monthly_comparison": monthly_comp,
        "insights": insights,
        "financial_health": health
    }

@router.get("/analysis/recurring")
async def get_recurring_analysis():
    expenses = await db_manager.get_expenses()
    enhanced = detect_recurring_expenses(expenses)
    recurring_items = [e for e in enhanced if e.get("is_recurring")]
    recurring_total = sum(e.get("amount", 0) for e in recurring_items)
    
    return {
        "recurring_expenses": recurring_items,
        "total_recurring_amount": recurring_total,
        "count": len(recurring_items)
    }

@router.get("/analysis/patterns")
async def get_patterns_analysis():
    income = await db_manager.get_income()
    expenses = await db_manager.get_expenses()
    prev_totals = db_manager.in_memory_data.get("previous_month_expenses", {})
    return analyze_spending_patterns(income, expenses, prev_totals)

@router.get("/analysis/monthly-comparison")
async def get_monthly_comparison_endpoint():
    expenses = await db_manager.get_expenses()
    prev_totals = db_manager.in_memory_data.get("previous_month_expenses", {})
    return get_monthly_comparison(expenses, prev_totals)

# ----------------- BUDGET ENDPOINTS -----------------
@router.get("/budget")
async def get_budget():
    expenses = await db_manager.get_expenses()
    budget_data = await db_manager.get_budget()
    analysis = calculate_budget_analysis(expenses, budget_data)
    return analysis

@router.post("/budget")
async def set_budget(payload: BudgetUpdate):
    data = payload.dict()
    saved = await db_manager.set_budget(data)
    expenses = await db_manager.get_expenses()
    analysis = calculate_budget_analysis(expenses, saved)
    return {"budget": analysis, "message": "Budget updated successfully"}

# ----------------- SAVINGS GOAL ENDPOINTS -----------------
@router.get("/savings-goal")
async def get_savings_goal():
    income = await db_manager.get_income()
    expenses = await db_manager.get_expenses()
    budget = await db_manager.get_budget()
    goal = await db_manager.get_savings_goal()

    summary = calculate_summary(income, expenses)
    total_budget = budget.get("total_budget", 32000.0)
    suggested_monthly_savings = max(0, income - total_budget)

    target_amt = goal.get("target_amount", 50000.0)
    curr_savings = goal.get("current_savings", 15000.0)
    progress_pct = (curr_savings / target_amt * 100) if target_amt > 0 else 0

    return {
        "target_amount": target_amt,
        "target_date": goal.get("target_date", "2027-03-31"),
        "current_savings": curr_savings,
        "progress_percentage": round(min(100, progress_pct), 1),
        "suggested_monthly_savings": round(suggested_monthly_savings, 2),
        "current_actual_monthly_savings": summary["savings"]
    }

@router.post("/savings-goal")
async def set_savings_goal(payload: SavingsGoalItem):
    goal_dict = payload.dict()
    saved = await db_manager.set_savings_goal(goal_dict)
    return {"savings_goal": saved, "message": "Savings goal updated successfully"}

# ----------------- FINANCIAL HEALTH -----------------
@router.get("/financial-health")
async def get_financial_health():
    income = await db_manager.get_income()
    expenses = await db_manager.get_expenses()
    budget = await db_manager.get_budget()
    return calculate_financial_health_score(income, expenses, budget)

# ----------------- WHAT-IF SIMULATOR -----------------
@router.post("/what-if")
async def run_what_if_simulation(payload: WhatIfRequest):
    income = await db_manager.get_income()
    expenses = await db_manager.get_expenses()
    res = calculate_what_if_scenario(income, expenses, payload.expenses)
    return res

# ----------------- AI CHAT -----------------
@router.post("/chat")
async def chat_with_ai(payload: ChatRequest):
    income = await db_manager.get_income()
    expenses = await db_manager.get_expenses()
    budget = await db_manager.get_budget()
    goal = await db_manager.get_savings_goal()

    reply = generate_chat_response(payload.message, income, expenses, budget, goal)
    return {
        "message": payload.message,
        "reply": reply
    }

# ----------------- RESET DEMO DATA -----------------
@router.post("/reset-demo")
async def reset_demo_data():
    await db_manager.reset_demo_data()
    return {"message": "Demo financial state reset to original sample values"}
