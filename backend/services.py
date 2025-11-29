import json
import logging
from typing import Dict, Generator, List, cast

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
            response_content = last_message.content

            logger.info("Message processed successfully")

            return cast(str, response_content)

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
            for chunk in agent.stream({"messages": messages}, stream_mode="values"):
                latest_message = chunk["messages"][-1]

                if hasattr(latest_message, "content") and latest_message.content:
                    print(f"Content: {latest_message.content}")
                    data = json.dumps({"content": latest_message.content})
                    yield f"data: {data}\n\n"

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            raise
