from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
import os
import uuid
from PIL import Image
import io

router = APIRouter(prefix="/api/images", tags=["images"])

UPLOAD_DIR = "/tmp/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    file_id = str(uuid.uuid4())
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.{file.filename.split('.')[-1]}")

    contents = await file.read()
    with open(file_path, "wb") as f:
        f.write(contents)

    return {"id": file_id, "path": file_path}


@router.get("/preview/{image_id}")
async def preview_image(image_id: str):
    # 簡易実装：実際には画像 ID からファイルを探すロジックが必要
    return {"message": "Preview endpoint"}
