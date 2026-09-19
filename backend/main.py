import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.api import router as api_router
from backend.database import db_manager

app = FastAPI(
    title="AI Personal Finance Coach API",
    description="FastAPI REST Backend for 24-Hour Hackathon AI Personal Finance Coach",
    version="1.0.0"
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    await db_manager.connect()

@app.get("/")
async def root():
    return {
        "status": "online",
        "app": "AI Personal Finance Coach Backend API",
        "version": "1.0.0",
        "docs_url": "/docs"
    }

app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
