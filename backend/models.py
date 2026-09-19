from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import date, datetime

class IncomeUpdate(BaseModel):
    amount: float = Field(..., gt=0, description="Monthly income amount, must be positive")

class ExpenseItem(BaseModel):
    id: str
    description: str
    amount: float = Field(..., gt=0)
    category: str
    date: str
    is_recurring: Optional[bool] = False

class ExpenseCreate(BaseModel):
    description: str
    amount: float = Field(..., gt=0)
    category: str
    date: Optional[str] = None
    is_recurring: Optional[bool] = False

class ExpenseUpdate(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[str] = None
    is_recurring: Optional[bool] = None

class BudgetCategory(BaseModel):
    category: str
    limit: float

class BudgetUpdate(BaseModel):
    total_budget: float
    categories: Dict[str, float]

class SavingsGoalItem(BaseModel):
    target_amount: float
    target_date: str
    current_savings: float = 0.0

class CategorizeRequest(BaseModel):
    description: str

class CategorizeResponse(BaseModel):
    description: str
    suggested_category: str
    confidence: float
    is_recurring: bool

class WhatIfRequest(BaseModel):
    expenses: Dict[str, float]

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = []
