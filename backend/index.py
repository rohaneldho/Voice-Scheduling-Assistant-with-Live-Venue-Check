from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

class QueryRequest(BaseModel):
    message: str

@app.post("/chat")
async def receive_chat(query: QueryRequest):
    text = query.message
    print(f"Received query from frontend: {text}")

    # Example response
    response_text = f"Echo: {text}"
    return {"response": response_text}
