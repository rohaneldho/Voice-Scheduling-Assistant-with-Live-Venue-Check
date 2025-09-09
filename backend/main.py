from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import logging
from openai import OpenAI
from query import implement_rag 

# Load environment variables
load_dotenv()
api_key = os.getenv("OPENROUTER_API_KEY")

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# OpenAI client (OpenRouter)
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
async def health_check():
    return {"status": "ok"}

@app.post("/chat")
async def chat(request: ChatRequest):
    if not request.message:
        return JSONResponse(status_code=400, content={"error": "Missing 'message' in request body."})

    try:
        logger.info("Sending request to OpenRouter API...")
        context=implement_rag(request.message)
        content=f'''
        You are an intelligent Scheduling Assistant. 
Your role is to help the user organize and manage meetings, deadlines, and important events. 
- Respect priorities such as work vs. personal tasks.
- Always verify against the references provided below before finalizing an answer.

Context / Constraints
- Use the location given by the user.
- Meetings should be scheduled between [WORK HOURS, e.g., 9:00–18:00 IST] unless otherwise specified.
- If a conflict arises, suggest the **next available slot**.

References
The following references contain the user’s availability, existing commitments, or office timings:
{context}

You are an intelligent Scheduling Assistant. 
Your ONLY possible responses are:
- "YES"
- "NO"

Do not output anything else, not even punctuation or explanations. 
Output must be exactly one of these two tokens.

Final Query
Based on the above context and references, answer the following query:
{request.message}

'''
        completion = client.chat.completions.create(
            model="deepseek/deepseek-r1-0528:free",
            messages=[
                {"role": "user", "content": content}
            ]
        )

        answer = completion.choices[0].message.content
        logger.info("Response generation complete.")

    except Exception as e:
        logger.exception(f"Error connecting to OpenRouter: {e}")
        return JSONResponse(
            status_code=500,
            content={"response": "Error connecting to language model."}
        )

    return {"response": answer}
