import re
from typing import List, Dict, Any, Tuple

CATEGORY_KEYWORD_MAP = {
    "Rent": ["rent", "apartment", "pg", "house rent", "flat rent", "landlord", "maintenance"],
    "Food": ["food", "groceries", "grocery", "zomato", "swiggy", "supermarket", "restaurant", "cafe", "coffee", "dinner", "lunch", "breakfast", "blinkit", "zepto"],
    "Transport": ["uber", "ola", "metro", "cab", "taxi", "bus", "train", "flight", "petrol", "fuel", "diesel", "auto", "rapido"],
    "Shopping": ["amazon", "flipkart", "clothes", "zara", "h&m", "myntra", "meesho", "shopping", "shoes", "electronics", "gadget", "mall"],
    "Entertainment": ["netflix", "spotify", "prime", "movie", "cinema", "theatre", "gaming", "steam", "concert", "hotstar", "bookmyshow", "pub"],
    "Bills": ["electricity", "water", "wifi", "internet", "broadband", "mobile bill", "recharge", "gas", "utility", "insurance", "lic"]
}

RECURRING_KEYWORDS = ["rent", "netflix", "spotify", "subscription", "bill", "recharge", "electricity", "wifi", "broadband", "insurance", "monthly", "maintenance"]

def suggest_expense_category(description: str) -> Tuple[str, float, bool]:
    text = description.lower().strip()
    
    # Check recurring keyword match
    is_recurring = any(kw in text for kw in RECURRING_KEYWORDS)
    
    for category, keywords in CATEGORY_KEYWORD_MAP.items():
        for kw in keywords:
            if kw in text:
                return category, 0.95, is_recurring

    return "Other", 0.50, is_recurring

def detect_recurring_expenses(expenses: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    enhanced = []
    for exp in expenses:
        desc = exp.get("description", "").lower()
        is_rec = exp.get("is_recurring", False)
        
        if not is_rec:
            if any(kw in desc for kw in RECURRING_KEYWORDS) or exp.get("category") in ["Rent", "Bills"]:
                is_rec = True

        enhanced.append({
            **exp,
            "is_recurring": is_rec
        })
    return enhanced

def analyze_spending_patterns(income: float, current_expenses: List[Dict[str, Any]], previous_month_category_totals: Dict[str, float]) -> Dict[str, Any]:
    from backend.calculations import calculate_category_spending
    
    category_totals = calculate_category_spending(current_expenses)
    total_spending = sum(category_totals.values())
    
    # Highest & Lowest spending categories (excluding 0s)
    active_categories = {k: v for k, v in category_totals.items() if v > 0}
    
    if active_categories:
        highest_cat = max(active_categories.items(), key=lambda x: x[1])
        lowest_cat = min(active_categories.items(), key=lambda x: x[1])
    else:
        highest_cat = ("None", 0.0)
        lowest_cat = ("None", 0.0)

    # Unusual / High spending detection compared to normal / previous baseline
    unusual_alerts = []
    for cat, amt in category_totals.items():
        prev_amt = previous_month_category_totals.get(cat, 0.0)
        if prev_amt > 0:
            diff_pct = ((amt - prev_amt) / prev_amt) * 100
            if diff_pct >= 25 and amt >= 2000:
                unusual_alerts.append({
                    "category": cat,
                    "current_amount": amt,
                    "previous_amount": prev_amt,
                    "percentage_increase": round(diff_pct, 1),
                    "message": f"High Spending Alert: {cat} expenses are {diff_pct:.0f}% higher than your previous monthly average."
                })
        elif amt > (income * 0.15) and cat in ["Shopping", "Entertainment"]:
            unusual_alerts.append({
                "category": cat,
                "current_amount": amt,
                "previous_amount": 0,
                "percentage_increase": 100.0,
                "message": f"Discretionary Alert: {cat} spending takes up {amt/income*100:.1f}% of your monthly income."
            })

    return {
        "highest_spending_category": {"category": highest_cat[0], "amount": highest_cat[1]},
        "lowest_spending_category": {"category": lowest_cat[0], "amount": lowest_cat[1]},
        "total_monthly_spending": total_spending,
        "category_breakdown": category_totals,
        "unusual_spending_alerts": unusual_alerts
    }

def get_monthly_comparison(current_expenses: List[Dict[str, Any]], previous_month_totals: Dict[str, float]) -> Dict[str, Any]:
    from backend.calculations import calculate_category_spending
    
    current_totals = calculate_category_spending(current_expenses)
    current_grand_total = sum(current_totals.values())
    previous_grand_total = sum(previous_month_totals.values())

    diff_amount = current_grand_total - previous_grand_total
    pct_change = ((diff_amount / previous_grand_total) * 100) if previous_grand_total > 0 else 0.0

    category_changes = []
    for cat in current_totals.keys():
        curr = current_totals.get(cat, 0.0)
        prev = previous_month_totals.get(cat, 0.0)
        c_diff = curr - prev
        c_pct = ((c_diff / prev) * 100) if prev > 0 else (100.0 if curr > 0 else 0.0)
        category_changes.append({
            "category": cat,
            "current": curr,
            "previous": prev,
            "change_amount": c_diff,
            "change_percentage": round(c_pct, 1)
        })

    return {
        "current_month_total": current_grand_total,
        "previous_month_total": previous_grand_total,
        "total_change_amount": diff_amount,
        "total_percentage_change": round(pct_change, 1),
        "category_changes": category_changes
    }

def generate_ai_insights(income: float, expenses: List[Dict[str, Any]], budget: Dict[str, Any], goal: Dict[str, Any]) -> List[Dict[str, Any]]:
    from backend.calculations import calculate_category_spending
    
    total_expenses = sum(e.get("amount", 0) for e in expenses)
    savings = income - total_expenses
    savings_rate = (savings / income * 100) if income > 0 else 0
    cat_spending = calculate_category_spending(expenses)

    insights = []

    # 1. Calculated Fact: Savings Rate
    insights.append({
        "id": "ins-1",
        "type": "fact",
        "category": "Savings",
        "title": "Monthly Savings Rate",
        "text": f"Your current savings rate is {savings_rate:.1f}% (₹{savings:,.0f} saved out of ₹{income:,.0f} income).",
        "badge": "Calculated Metric",
        "badge_color": "bg-emerald-100 text-emerald-800 border-emerald-300"
    })

    # 2. High Discretionary Fact
    disc = cat_spending.get("Shopping", 0) + cat_spending.get("Entertainment", 0)
    if disc > 0:
        disc_pct = (disc / income * 100) if income > 0 else 0
        insights.append({
            "id": "ins-2",
            "type": "fact",
            "category": "Spending Pattern",
            "title": "Discretionary Spending",
            "text": f"Shopping and Entertainment total ₹{disc:,.0f} ({disc_pct:.1f}% of total income).",
            "badge": "Fact",
            "badge_color": "bg-blue-100 text-blue-800 border-blue-300"
        })

    # 3. AI Recommendation: Potential Savings
    if disc > 2000:
        potential_save = disc * 0.35
        insights.append({
            "id": "ins-3",
            "type": "recommendation",
            "category": "Optimization",
            "title": "Smart Cost Reduction",
            "text": f"You could potentially save up to ₹{potential_save:,.0f} per month by trimming non-essential Shopping & Dining expenses.",
            "badge": "AI Advice",
            "badge_color": "bg-indigo-100 text-indigo-800 border-indigo-300"
        })

    # 4. Savings Goal Projection
    target_amt = goal.get("target_amount", 50000.0)
    curr_savings = goal.get("current_savings", 15000.0)
    needed = target_amt - curr_savings
    if needed > 0 and savings > 0:
        months_needed = int(needed / savings) + 1
        insights.append({
            "id": "ins-4",
            "type": "recommendation",
            "category": "Goal Tracking",
            "title": "Goal Timeline Estimate",
            "text": f"At your current monthly savings rate (₹{savings:,.0f}/mo), you are on track to reach your ₹{target_amt:,.0f} goal in approx {months_needed} months.",
            "badge": "AI Projection",
            "badge_color": "bg-purple-100 text-purple-800 border-purple-300"
        })

    return insights

def generate_chat_response(message: str, income: float, expenses: List[Dict[str, Any]], budget: Dict[str, Any], goal: Dict[str, Any]) -> str:
    msg_lower = message.lower()
    from backend.calculations import calculate_category_spending
    
    cat_spending = calculate_category_spending(expenses)
    total_expenses = sum(cat_spending.values())
    savings = income - total_expenses
    savings_rate = (savings / income * 100) if income > 0 else 0

    if "save" in msg_lower or "10,000" in msg_lower or "10000" in msg_lower or "goal" in msg_lower:
        target = 10000
        diff = target - savings
        top_cats = sorted(cat_spending.items(), key=lambda x: x[1], reverse=True)
        top_disc = [c for c in top_cats if c[0] in ["Shopping", "Entertainment", "Food"]]
        
        if diff <= 0:
            return f"Great news! You are currently saving ₹{savings:,.0f} per month ({savings_rate:.1f}% rate), which already meets or exceeds your ₹10,000 target. To boost it further, focus on trimming {top_disc[0][0]} (currently ₹{top_disc[0][1]:,.0f})."
        else:
            suggestion = f"To reach a ₹{target:,.0f} monthly savings goal from your current ₹{savings:,.0f} savings, you need an extra ₹{diff:,.0f}.\n\n"
            suggestion += "Here is your customized action plan:\n"
            if top_disc:
                suggestion += f"1. Reduce {top_disc[0][0]} spending by 25% (saves approx ₹{top_disc[0][1]*0.25:,.0f}/mo).\n"
            if len(top_disc) > 1:
                suggestion += f"2. Limit {top_disc[1][0]} purchases by 20% (saves approx ₹{top_disc[1][1]*0.20:,.0f}/mo).\n"
            suggestion += "3. Set rigid category budget limits in the Budget & Savings tab to keep track of weekly limits."
            return suggestion

    elif "spend" in msg_lower or "most" in msg_lower or "highest" in msg_lower:
        top_cat = max(cat_spending.items(), key=lambda x: x[1]) if cat_spending else ("None", 0)
        pct = (top_cat[1] / income * 100) if income > 0 else 0
        return f"Your highest spending category is **{top_cat[0]}** at **₹{top_cat[1]:,.0f}**, accounting for **{pct:.1f}%** of your total income. Rent and Food are essential, but reviewing discretionary items like Shopping (₹{cat_spending.get('Shopping',0):,.0f}) will unlock significant savings."

    elif "reduce" in msg_lower or "cut" in msg_lower or "lower" in msg_lower:
        disc_total = cat_spending.get("Shopping", 0) + cat_spending.get("Entertainment", 0) + cat_spending.get("Other", 0)
        return f"Your discretionary expenses (Shopping, Entertainment & Other) total **₹{disc_total:,.0f}** per month. By setting a strict budget cap of 15% below current levels, you will instantly free up **₹{disc_total * 0.15:,.0f}** every month without compromising your lifestyle."

    elif "health" in msg_lower or "score" in msg_lower:
        from backend.calculations import calculate_financial_health_score
        health = calculate_financial_health_score(income, expenses, budget)
        return f"Your current Financial Health Score is **{health['score']}/100** ({health['tier']}). {health['explanation']}"

    else:
        return f"Based on your financial profile: Monthly Income is ₹{income:,.0f}, Total Expenses are ₹{total_expenses:,.0f}, giving you net savings of ₹{savings:,.0f} ({savings_rate:.1f}% savings rate). Ask me how to optimize specific categories or reach your savings targets!"
