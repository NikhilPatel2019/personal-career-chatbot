import logging
from typing import Any, Dict, List

from langchain.agents import create_agent

from config import SYSTEM_PROMPT, BASIC_MODEL_NAME
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
            return response_content

        except Exception as e:
            logger.error(f"Error processing message: {str(e)}", exc_info=True)
            raise
