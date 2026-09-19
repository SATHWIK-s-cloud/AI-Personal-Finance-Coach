import os
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
DATABASE_NAME = os.getenv("DATABASE_NAME", "personal_finance_db")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Fallback In-Memory / Structured Store for 100% demo uptime
INITIAL_DEMO_STATE = {
    "income": 40000.0,
    "expenses": [
        {"id": "exp-1", "description": "Apartment Rent", "amount": 10000.0, "category": "Rent", "date": "2026-09-01", "is_recurring": True},
        {"id": "exp-2", "description": "Groceries & Vegetables", "amount": 5000.0, "category": "Food", "date": "2026-09-03", "is_recurring": False},
        {"id": "exp-3", "description": "Monthly Metro Pass", "amount": 3000.0, "category": "Transport", "date": "2026-09-02", "is_recurring": True},
        {"id": "exp-4", "description": "Amazon Clothing & Gadgets", "amount": 5000.0, "category": "Shopping", "date": "2026-09-05", "is_recurring": False},
        {"id": "exp-5", "description": "Movie & Dining Out", "amount": 2000.0, "category": "Entertainment", "date": "2026-09-08", "is_recurring": False},
        {"id": "exp-6", "description": "Electricity & Water Bill", "amount": 3000.0, "category": "Bills", "date": "2026-09-04", "is_recurring": True},
        {"id": "exp-7", "description": "Netflix Subscription", "amount": 500.0, "category": "Entertainment", "date": "2026-09-01", "is_recurring": True},
        {"id": "exp-8", "description": "Mobile Prepaid Recharge", "amount": 1500.0, "category": "Bills", "date": "2026-09-06", "is_recurring": True}
    ],
    "previous_month_expenses": {
        "Rent": 10000.0,
        "Food": 4500.0,
        "Transport": 2800.0,
        "Shopping": 3500.0,
        "Entertainment": 1800.0,
        "Bills": 2700.0,
        "Other": 1000.0
    },
    "budget": {
        "total_budget": 32000.0,
        "categories": {
            "Rent": 10000.0,
            "Food": 6000.0,
            "Transport": 3500.0,
            "Shopping": 4000.0,
            "Entertainment": 2500.0,
            "Bills": 4000.0,
            "Other": 2000.0
        }
    },
    "savings_goal": {
        "target_amount": 50000.0,
        "target_date": "2027-03-31",
        "current_savings": 15000.0
    }
}

class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.client = None
        self.db = None
        self.in_memory_data = dict(INITIAL_DEMO_STATE)
        
    async def connect(self):
        try:
            import motor.motor_asyncio
            self.client = motor.motor_asyncio.AsyncIOMotorClient(MONGODB_URL, serverSelectionTimeoutMS=1000)
            # Ping database to test connection
            await self.client.admin.command('ping')
            self.db = self.client[DATABASE_NAME]
            self.use_mongo = True
            logger.info("Connected to MongoDB successfully!")
        except Exception as e:
            logger.warning(f"MongoDB connection unavailable ({e}). Using resilient In-Memory Store.")
            self.use_mongo = False

    async def get_income(self) -> float:
        if self.use_mongo:
            doc = await self.db.income.find_one({"_id": "current_income"})
            if doc:
                return doc.get("amount", 40000.0)
        return self.in_memory_data["income"]

    async def set_income(self, amount: float):
        if self.use_mongo:
            await self.db.income.update_one({"_id": "current_income"}, {"$set": {"amount": amount}}, upsert=True)
        self.in_memory_data["income"] = amount
        return amount

    async def get_expenses(self) -> List[Dict[str, Any]]:
        if self.use_mongo:
            cursor = self.db.expenses.find({})
            expenses = await cursor.to_list(length=500)
            for item in expenses:
                if "_id" in item:
                    item["id"] = str(item["_id"])
                    del item["_id"]
            return expenses
        return self.in_memory_data["expenses"]

    async def add_expense(self, expense_data: Dict[str, Any]) -> Dict[str, Any]:
        if self.use_mongo:
            result = await self.db.expenses.insert_one(expense_data)
            expense_data["id"] = str(result.inserted_id)
            return expense_data
        
        if "id" not in expense_data or not expense_data["id"]:
            import uuid
            expense_data["id"] = f"exp-{uuid.uuid4().hex[:6]}"
        self.in_memory_data["expenses"].append(expense_data)
        return expense_data

    async def update_expense(self, expense_id: str, update_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        if self.use_mongo:
            from bson import ObjectId
            try:
                query_id = ObjectId(expense_id)
            except Exception:
                query_id = expense_id
            await self.db.expenses.update_one({"_id": query_id}, {"$set": update_data})
            updated = await self.db.expenses.find_one({"_id": query_id})
            if updated:
                updated["id"] = str(updated["_id"])
                del updated["_id"]
                return updated
            return None

        for idx, exp in enumerate(self.in_memory_data["expenses"]):
            if exp["id"] == expense_id:
                exp.update({k: v for k, v in update_data.items() if v is not None})
                self.in_memory_data["expenses"][idx] = exp
                return exp
        return None

    async def delete_expense(self, expense_id: str) -> bool:
        if self.use_mongo:
            from bson import ObjectId
            try:
                query_id = ObjectId(expense_id)
            except Exception:
                query_id = expense_id
            res = await self.db.expenses.delete_one({"_id": query_id})
            return res.deleted_count > 0

        initial_len = len(self.in_memory_data["expenses"])
        self.in_memory_data["expenses"] = [exp for exp in self.in_memory_data["expenses"] if exp["id"] != expense_id]
        return len(self.in_memory_data["expenses"]) < initial_len

    async def get_budget(self) -> Dict[str, Any]:
        if self.use_mongo:
            doc = await self.db.budget.find_one({"_id": "current_budget"})
            if doc:
                del doc["_id"]
                return doc
        return self.in_memory_data["budget"]

    async def set_budget(self, budget_data: Dict[str, Any]):
        if self.use_mongo:
            await self.db.budget.update_one({"_id": "current_budget"}, {"$set": budget_data}, upsert=True)
        self.in_memory_data["budget"] = budget_data
        return budget_data

    async def get_savings_goal(self) -> Dict[str, Any]:
        if self.use_mongo:
            doc = await self.db.savings_goal.find_one({"_id": "current_savings_goal"})
            if doc:
                del doc["_id"]
                return doc
        return self.in_memory_data["savings_goal"]

    async def set_savings_goal(self, goal_data: Dict[str, Any]):
        if self.use_mongo:
            await self.db.savings_goal.update_one({"_id": "current_savings_goal"}, {"$set": goal_data}, upsert=True)
        self.in_memory_data["savings_goal"] = goal_data
        return goal_data

    async def reset_demo_data(self):
        import copy
        self.in_memory_data = copy.deepcopy(INITIAL_DEMO_STATE)
        if self.use_mongo:
            await self.db.income.drop()
            await self.db.expenses.drop()
            await self.db.budget.drop()
            await self.db.savings_goal.drop()
            # Insert initial demo state
            await self.db.income.insert_one({"_id": "current_income", "amount": INITIAL_DEMO_STATE["income"]})
            await self.db.expenses.insert_many(INITIAL_DEMO_STATE["expenses"])
            await self.db.budget.insert_one({"_id": "current_budget", **INITIAL_DEMO_STATE["budget"]})
            await self.db.savings_goal.insert_one({"_id": "current_savings_goal", **INITIAL_DEMO_STATE["savings_goal"]})
        return True

db_manager = DatabaseManager()
