from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import workflows, images, nodes

app = FastAPI(
    title="Image Processing Nocode API",
    description="Backend for node-based image processing workflow",
    version="0.1.0",
)

# CORS 設定（フロントエンドからのアクセス許可）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ルーターの登録
app.include_router(workflows.router)
app.include_router(images.router)
app.include_router(nodes.router)


@app.get("/")
def read_root():
    return {"message": "Image Processing API is running"}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
