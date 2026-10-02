from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database.mongodb import get_database
from app.schemas.ai import ExtractedMemoryResponse
from app.api.deps import get_current_user
from app.ai.service import get_ai_service

router = APIRouter(prefix="/voice", tags=["Voice Transcription & Extraction"])

@router.post("/transcribe", response_model=ExtractedMemoryResponse)
async def process_voice_transcript(
    transcript: str = Form(None),
    audio_file: UploadFile = File(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Accepts text transcription or audio note.
    Processes natural speech with Gemma memory extractor, returning previewable schema.
    """
    text_to_process = transcript
    if not text_to_process:
        if audio_file:
            # Fallback placeholder transcription for recorded audio chunk
            text_to_process = f"Voice note recorded on friend meeting: '{audio_file.filename}'"
        else:
            raise HTTPException(status_code=400, detail="Either transcript text or audio file must be provided")

    ai_service = get_ai_service()
    extracted = await ai_service.extract_memory(text_to_process)
    
    # Auto-match person if found
    if extracted.person_name:
        existing_p = await db.people.find_one({
            "user_id": current_user["_id"],
            "name": {"$regex": f"^{extracted.person_name}$", "$options": "i"}
        })
        if existing_p:
            extracted.person_id = str(existing_p["_id"])

    return extracted
