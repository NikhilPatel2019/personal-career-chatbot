import logging
from typing import Optional

from langchain_openai import ChatOpenAI

logger = logging.getLogger(__name__)


class ModelFactory:
    _basic_model: Optional[ChatOpenAI] = None
    _advanced_model: Optional[ChatOpenAI] = None

    @classmethod
    def get_basic_model(cls, model_name: str = "gpt-4o-mini") -> ChatOpenAI:
        if cls._basic_model is None:
            logger.info(f"Initializing basic model: {model_name}")
            cls._basic_model = ChatOpenAI(model=model_name)
        return cls._basic_model

    @classmethod
    def get_advanced_model(cls, model_name: str = "gpt-4o") -> ChatOpenAI:
        if cls._advanced_model is None:
            logger.info(f"Initializing advanced model: {model_name}")
            cls._advanced_model = ChatOpenAI(model=model_name)
        return cls._advanced_model
