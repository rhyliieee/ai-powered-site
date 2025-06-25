from pathlib import Path
from dotenv import load_dotenv
import os

# Load Environment Variables
load_dotenv()

PROMPTS_PATH = Path("agents/steve/prompts.yaml")
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
MISTRAL_API_KEY = os.getenv("MISTRAL_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

MISTRAL_MODEL_NAME = "mistral-medium-latest"
GEMINI_2POINT5_MODEL = "gemini-2.5-flash-preview-05-20"
GEMINI_2POINT0_MODEL = "gemini-2.0-flash"
DEEPSEEK_MODEL_NAME = "deepseek/deepseek-chat-v3-0324:free"
OPENROUTER_BASE_URL= "https://openrouter.ai/api/v1"

STEVE_AGENT_API_KEYS = {
    os.getenv("RHYLE_API_KEY"): "rhyliieee",
    os.getenv("JOMAR_API_KEY"): "jomar"
}