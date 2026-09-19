from typing import List, Dict, Any

CATEGORIES = ["Rent", "Food", "Transport", "Shopping", "Entertainment", "Bills", "Other"]

def calculate_summary(income: float, expenses: List[Dict[str, Any]]) -> Dict[str, Any]:
    total_expenses = sum(exp.get("amount", 0) for exp in expenses)
    savings = income - total_expenses
    savings_rate = (savings / income * 100) if income > 0 else 0.0
    
    return {
        "income": round(income, 2),
        "total_expenses": round(total_expenses, 2),
        "savings": round(savings, 2),
        "savings_rate": round(max(0, savings_rate), 1)
    }

def calculate_category_spending(expenses: List[Dict[str, Any]]) -> Dict[str, float]:
    totals = {cat: 0.0 for cat in CATEGORIES}
    for exp in expenses:
        cat = exp.get("category", "Other")
        if cat in totals:
            totals[cat] += exp.get("amount", 0.0)
        else:
            totals["Other"] += exp.get("amount", 0.0)
    return {cat: round(amt, 2) for cat, amt in totals.items()}

def calculate_financial_health_score(income: float, expenses: List[Dict[str, Any]], budget: Dict[str, Any]) -> Dict[str, Any]:
    if income <= 0:
        return {
            "score": 0,
            "tier": "Needs Attention",
            "breakdown": {
                "savings_rate_score": 0,
                "budget_compliance_score": 0,
                "discretionary_control_score": 0,
                "emergency_fund_score": 0
            },
            "explanation": "No income recorded. Add your monthly income to compute your financial health score."
        }

    total_expenses = sum(exp.get("amount", 0) for exp in expenses)
    savings = income - total_expenses
    savings_rate = (savings / income) * 100

    category_totals = calculate_category_spending(expenses)
    discretionary = category_totals.get("Shopping", 0) + category_totals.get("Entertainment", 0) + category_totals.get("Other", 0)
    discretionary_pct = (discretionary / income) * 100

    total_budget = budget.get("total_budget", income * 0.8)
    budget_usage_pct = (total_expenses / total_budget * 100) if total_budget > 0 else 100

    # 1. Savings Rate Score (0 - 40 points)
    # Target: 20%+ savings rate = max points
    if savings_rate >= 30:
        savings_score = 40
    elif savings_rate >= 20:
        savings_score = 35
    elif savings_rate >= 10:
        savings_score = 25
    elif savings_rate >= 0:
        savings_score = 15
    else:
        savings_score = 0

    # 2. Budget Compliance Score (0 - 30 points)
    if budget_usage_pct <= 80:
        budget_score = 30
    elif budget_usage_pct <= 95:
        budget_score = 22
    elif budget_usage_pct <= 100:
        budget_score = 15
    else:
        budget_score = 5

    # 3. Discretionary Expense Control (0 - 20 points)
    if discretionary_pct <= 20:
        discretionary_score = 20
    elif discretionary_pct <= 30:
        discretionary_score = 15
    elif discretionary_pct <= 40:
        discretionary_score = 10
    else:
        discretionary_score = 5

    # 4. Emergency Cushion Factor (0 - 10 points)
    net_surplus = max(0, savings)
    if net_surplus >= (income * 0.25):
        emergency_score = 10
    elif net_surplus >= (income * 0.1):
        emergency_score = 7
    else:
        emergency_score = 3

    total_score = min(100, max(0, round(savings_score + budget_score + discretionary_score + emergency_score)))

    if total_score >= 80:
        tier = "Excellent Financial Health"
        explanation = "You have a strong savings rate and excellent spending control!"
    elif total_score >= 65:
        tier = "Good Standing"
        explanation = "Solid financial balance. Slight optimization in discretionary spending can boost your savings."
    elif total_score >= 50:
        tier = "Fair Balance"
        explanation = "You are living close to your income limit. Reduce non-essential spending to improve safety margin."
    else:
        tier = "Action Needed"
        explanation = "Expenses are high relative to income. Review discretionary spending and stick to category budgets."

    return {
        "score": total_score,
        "tier": tier,
        "explanation": explanation,
        "breakdown": {
            "savings_rate_score": savings_score,
            "budget_compliance_score": budget_score,
            "discretionary_control_score": discretionary_score,
            "emergency_fund_score": emergency_score
        },
        "is_educational_only": True
    }

def calculate_budget_analysis(expenses: List[Dict[str, Any]], budget_data: Dict[str, Any]) -> Dict[str, Any]:
    total_budget = budget_data.get("total_budget", 32000.0)
    category_budgets = budget_data.get("categories", {})
    actual_spending = calculate_category_spending(expenses)
    total_spent = sum(actual_spending.values())
    
    overall_usage_pct = (total_spent / total_budget * 100) if total_budget > 0 else 0
    remaining_budget = total_budget - total_spent

    category_status = []
    alerts = []

    for cat in CATEGORIES:
        limit = category_budgets.get(cat, 0.0)
        spent = actual_spending.get(cat, 0.0)
        pct = (spent / limit * 100) if limit > 0 else 0
        
        status = "normal"
        if spent > limit and limit > 0:
            status = "exceeded"
            alerts.append(f"Exceeded {cat} budget! Spent ₹{spent:,.0f} of ₹{limit:,.0f} ({pct:.0f}% used).")
        elif pct >= 90:
            status = "warning_high"
            alerts.append(f"{cat} budget is almost exhausted ({pct:.0f}% used).")
        elif pct >= 70:
            status = "warning_medium"
            alerts.append(f"{cat} spending has reached {pct:.0f}% of allocated limit.")

        category_status.append({
            "category": cat,
            "limit": limit,
            "spent": spent,
            "remaining": limit - spent,
            "percentage_used": round(pct, 1),
            "status": status
        })

    return {
        "total_budget": total_budget,
        "total_spent": total_spent,
        "remaining_budget": remaining_budget,
        "overall_usage_percentage": round(overall_usage_pct, 1),
        "category_details": category_status,
        "alerts": alerts
    }

def calculate_what_if_scenario(income: float, current_expenses: List[Dict[str, Any]], scenario_expenses: Dict[str, float]) -> Dict[str, Any]:
    current_category_totals = calculate_category_spending(current_expenses)
    current_total_spending = sum(current_category_totals.values())
    current_monthly_savings = max(0, income - current_total_spending)

    new_total_spending = sum(scenario_expenses.values())
    new_monthly_savings = max(0, income - new_total_spending)

    monthly_savings_change = new_monthly_savings - current_monthly_savings
    annual_savings_change = monthly_savings_change * 12
    potential_annual_savings = new_monthly_savings * 12

    return {
        "current_monthly_spending": round(current_total_spending, 2),
        "current_monthly_savings": round(current_monthly_savings, 2),
        "new_monthly_spending": round(new_total_spending, 2),
        "new_monthly_savings": round(new_monthly_savings, 2),
        "monthly_delta": round(monthly_savings_change, 2),
        "annual_delta": round(annual_savings_change, 2),
        "potential_annual_savings": round(potential_annual_savings, 2)
    }
