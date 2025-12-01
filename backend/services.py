import json
import logging
from typing import Any, Dict, Generator, List, Optional, cast

from config import BASIC_MODEL_NAME, SYSTEM_PROMPT
from langchain.agents import create_agent
from middleware import dynamic_model_selection
from models import ModelFactory

logger = logging.getLogger(__name__)


class ChatAgentService:
    def __init__(self, system_prompt: str = SYSTEM_PROMPT):
        self.system_prompt = system_prompt
        logger.info("ChatAgentService initialized")

    def _create_agent(self):
        basic_model = ModelFactory.get_basic_model(BASIC_MODEL_NAME)
        agent = create_agent(
            model=basic_model,
            middleware=[dynamic_model_selection],
        )
        return agent

    def _format_messages(self, user_message: str) -> List[Dict[str, str]]:
        return [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": user_message},
        ]

    def _format_messages_history(self, chat_history: List[Dict[str, str]]) -> List[Dict[str, str]]:
        messages = [{"role": "system", "content": self.system_prompt}]
        messages.extend(chat_history)
        return messages

    def process_message(self, user_message: str) -> str:
        if not user_message or not user_message.strip():
            raise ValueError("User message cannot be empty")

        try:
            agent = self._create_agent()
            messages = self._format_messages(user_message)

            logger.debug(f"Processing message from user: {user_message[:100]}...")
            result = agent.invoke({"messages": messages})

            if not result or "messages" not in result:
                raise ValueError("Invalid agent response structure")

            last_message = result["messages"][-1]
            # Extract content safely from either dict responses or message objects.
            if isinstance(last_message, dict):
                response_content_raw: Any = last_message.get("content")
            else:
                response_content_raw = getattr(last_message, "content", None)

            # Narrow type explicitly so mypy recognizes we're returning `str` rather than `Any`.
            if not isinstance(response_content_raw, str):
                raise ValueError("Invalid response content from agent; expected string")

            response_content: str = cast(str, response_content_raw)

            logger.info("Message processed successfully")

            return response_content

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            raise

    def process_message_in_stream(
        self, message_history: List[Dict[str, str]]
    ) -> Generator[str, None, None]:
        try:
            agent = self._create_agent()
            messages = self._format_messages_history(message_history)

            logger.debug(f"Processing {len(message_history)} messages from history...")

            def _get_message_role(msg) -> str:
                if isinstance(msg, dict):
                    role_val = (msg.get("role") or msg.get("type") or "").lower()
                    if role_val:
                        return role_val

                if hasattr(msg, "role") and getattr(msg, "role"):
                    return str(getattr(msg, "role")).lower()
                if hasattr(msg, "type") and getattr(msg, "type"):
                    return str(getattr(msg, "type")).lower()
                    return str(getattr(msg, "type")).lower()

                cls_name = msg.__class__.__name__.lower()
                if "human" in cls_name or "user" in cls_name:
                    return "user"
                if "system" in cls_name:
                    return "system"
                if "ai" in cls_name or "assistant" in cls_name:
                    return "assistant"
                return cls_name

            for chunk in agent.stream({"messages": messages}, stream_mode="values"):
                latest_message = chunk["messages"][-1]
                role = _get_message_role(latest_message)

                assistant_roles = {
                    "assistant",
                    "ai",
                    "ai_message",
                    "airesponse",
                    "assistantmessage",
                }
                if role not in assistant_roles:
                    continue

                content: Optional[str] = None
                if isinstance(latest_message, dict):
                    maybe_content: Any = latest_message.get("content")
                elif hasattr(latest_message, "content"):
                    maybe_content = getattr(latest_message, "content")
                else:
                    maybe_content = None

                if isinstance(maybe_content, str):
                    content = maybe_content

                if content:
                    logger.debug(f"Content: {content}")
                    data = json.dumps({"role": role, "content": content})
                    yield f"data: {data}\n\n"

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            raise
