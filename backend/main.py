import logging
import os
from typing import Dict

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from services import ChatAgentService

load_dotenv(override=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

chat_service = ChatAgentService()


class ChatPayload(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)


class StreamChatPayload(BaseModel):
    messages: list[Dict[str, str]] = Field(...)


class ChatResponse(BaseModel):
    response: str


app = FastAPI(
    title="Career Chatbot API",
    description="AI-powered career assistant chatbot",
    version="1.0.0",
)

origins_env = os.environ.get("ALLOWED_ORIGINS")
if origins_env:
    try:
        # allow the special value "*" to permit all origins
        if origins_env.strip() == "*":
            origins = ["*"]
        else:
            origins = [o.strip() for o in origins_env.split(",") if o.strip()]
    except Exception:
        origins = []
else:
    # sensible defaults for local development
    origins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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


@app.post("/chat/stream", tags=["Chat"])
def streamChat(payload: StreamChatPayload) -> StreamingResponse:
    try:
        message_history = payload.messages
        generator = chat_service.process_message_in_stream(message_history)
        return StreamingResponse(generator, media_type="text/event-stream")

    except ValueError as e:
        logger.warning(f"Validation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
