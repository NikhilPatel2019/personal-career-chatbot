"""Career Chatbot API - Main application entry point.

This module contains the FastAPI application for the career chatbot service.
"""

import logging
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from dotenv import load_dotenv
from pydantic import BaseModel, Field

from services import ChatAgentService

# Load environment variables
load_dotenv(override=True)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize service
chat_service = ChatAgentService()


class ChatPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
    response: str


# Initialize FastAPI app
app = FastAPI(
    title="Career Chatbot API",
    description="AI-powered career assistant chatbot",
    version="1.0.0",
)


@app.get("/", tags=["Health"])
def root() -> Dict[str, str]:
    return {"message": "Career Chatbot API is running"}


@app.post("/chat", response_model=ChatResponse, tags=["Chat"])
def chat(payload: ChatPayload) -> ChatResponse:
    try:
        logger.info(f"Received chat message: {payload.message[:50]}...")
        response_text = chat_service.process_message(payload.message)
        return ChatResponse(response=response_text)

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        logger.error(f"Unexpected error in chat endpoint: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your message. Please try again.",
        )