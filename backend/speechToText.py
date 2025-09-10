from fastapi import APIRouter, UploadFile, File
import logging
import whisper
import tempfile
import shutil
import os
os.environ["PATH"] += os.pathsep + r"C:\ffmpeg\bin"


router = APIRouter()
logger = logging.getLogger(__name__)

model = whisper.load_model("base")

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    logger.info(f"Received file: {file.filename}, content_type={file.content_type}")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".m4a") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    result = model.transcribe(tmp_path)
    text = result.get("text", "").strip()

    logger.info(f"Transcription: {text}")

    return {"status": "success", "message": f"{text}"}
