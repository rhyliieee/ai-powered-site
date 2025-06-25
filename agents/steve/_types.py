from pydantic import BaseModel, Field
from typing import Optional

class ChatInput(BaseModel):
    message: str = Field(..., description="The message to be sent to Steve Agent.")
    thread_id: Optional[str] = Field(default="thread-1", description="The thread ID for the conversation.")