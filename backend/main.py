from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from .chain import generate_code
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GenerateRequest(BaseModel):
    columns: list[str]
    question: str

class GenerateResponse(BaseModel):
    code: str

@app.post("/generate", response_model=GenerateResponse)
async def generate(request: GenerateRequest):
    try:
        code = generate_code(request.columns, request.question)
        return GenerateResponse(code=code)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "CSV Chat API is running"}
