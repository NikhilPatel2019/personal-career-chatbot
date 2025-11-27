import logging
from typing import Any, Dict

from langchain.agents.middleware import ModelRequest, ModelResponse, wrap_model_call

from config import ADVANCED_MODEL_NAME, MESSAGE_COUNT_THRESHOLD
from models import ModelFactory

logger = logging.getLogger(__name__)


@wrap_model_call
def dynamic_model_selection(request: ModelRequest, handler) -> ModelResponse:
    message_count = len(request.state.get("messages", []))
    logger.debug(f"Message count: {message_count}")

    if message_count > MESSAGE_COUNT_THRESHOLD:
        logger.info(
            f"Switching to advanced model (message count: {message_count} > {MESSAGE_COUNT_THRESHOLD})"
        )
        model = ModelFactory.get_advanced_model(ADVANCED_MODEL_NAME)
    else:
        model = ModelFactory.get_basic_model()

    return handler(request.override(model=model))
