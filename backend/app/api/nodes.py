from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Any
import base64
from PIL import Image, ImageFilter, ImageEnhance
import numpy as np
import cv2
import io

router = APIRouter(prefix="/api/nodes", tags=["nodes"])


class NodeExecution(BaseModel):
    node_type: str
    params: dict[str, Any]
    input_image_b64: str | None = None


def b64_to_image(b64_data: str) -> Image.Image:
    """Base64 文字列を PIL Image に変換"""
    if not b64_data:
        raise HTTPException(status_code=400, detail="Empty image data")

    # Data URI スキームから Base64 データのみを抽出
    if b64_data.startswith("data:image"):
        b64_data = b64_data.split(",")[1]

    try:
        # URL safe な Base64 を標準に変換
        b64_data = b64_data.replace("-", "+").replace("_", "/")
        # パディングの追加
        padding = 4 - len(b64_data) % 4
        if padding != 4:
            b64_data += "=" * padding

        image_bytes = base64.b64decode(b64_data)
        return Image.open(io.BytesIO(image_bytes))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")


def image_to_b64(img: Image.Image, format: str = "PNG") -> str:
    """PIL Image を Data URI 形式の Base64 文字列に変換"""
    buffer = io.BytesIO()
    img.save(buffer, format=format)
    b64_data = base64.b64encode(buffer.getvalue()).decode("utf-8")
    mime_type = "image/png" if format.upper() == "PNG" else f"image/{format.lower()}"
    return f"data:{mime_type};base64,{b64_data}"


@router.post("/execute")
async def execute_node(execution: NodeExecution):
    """ノードを実行して画像処理を行う"""

    if execution.node_type == "resize":
        return await handle_resize(execution)
    elif execution.node_type == "grayscale":
        return await handle_grayscale(execution)
    elif execution.node_type == "gaussian":
        return await handle_gaussian(execution)
    elif execution.node_type == "median":
        return await handle_median(execution)
    elif execution.node_type == "mean":
        return await handle_mean(execution)
    elif execution.node_type == "brightness":
        return await handle_brightness(execution)
    elif execution.node_type == "sobel":
        return await handle_sobel(execution)
    elif execution.node_type == "prewitt":
        return await handle_prewitt(execution)
    elif execution.node_type == "laplacian":
        return await handle_laplacian(execution)
    elif execution.node_type == "threshold":
        return await handle_threshold(execution)
    else:
        raise HTTPException(
            status_code=400, detail=f"Unknown node type: {execution.node_type}"
        )


async def handle_resize(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    width = execution.params.get("width", img.width)
    height = execution.params.get("height", img.height)

    resized = img.resize((width, height), Image.LANCZOS)
    return {"output_image_b64": image_to_b64(resized)}


async def handle_grayscale(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    gray = img.convert("L")
    return {"output_image_b64": image_to_b64(gray)}


async def handle_gaussian(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    kernel_size = execution.params.get("kernelSize", 5)
    radius = (kernel_size - 1) / 2
    blurred = img.filter(ImageFilter.GaussianBlur(radius=radius))
    return {"output_image_b64": image_to_b64(blurred)}


async def handle_median(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    kernel_size = execution.params.get("kernelSize", 5)

    # Convert to numpy array for median filter
    arr = np.array(img.convert("RGB"))

    # Apply median filter using scipy if available, otherwise use PIL's MedianFilter
    try:
        from scipy import ndimage

        result = ndimage.median_filter(arr, size=kernel_size)
        result_img = Image.fromarray(result.astype(np.uint8))
    except ImportError:
        # Fallback to PIL's MedianFilter (fixed kernel size)
        result_img = img.filter(ImageFilter.MedianFilter(size=kernel_size))

    return {"output_image_b64": image_to_b64(result_img)}


async def handle_mean(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    kernel_size = execution.params.get("kernelSize", 5)

    # Convert to numpy array for mean filter
    arr = np.array(img.convert("RGB"), dtype=np.float32)

    try:
        from scipy import ndimage

        result = ndimage.uniform_filter(arr, size=kernel_size)
        result_img = Image.fromarray(result.astype(np.uint8))
    except ImportError:
        # Fallback to PIL's blur (approximation)
        radius = kernel_size // 2
        result_img = img.filter(ImageFilter.BoxBlur(radius=radius))

    return {"output_image_b64": image_to_b64(result_img)}


async def handle_brightness(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    factor = execution.params.get("factor", 1.0)
    enhancer = ImageEnhance.Brightness(img)
    adjusted = enhancer.enhance(factor)
    return {"output_image_b64": image_to_b64(adjusted)}


async def handle_sobel(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    arr = np.array(img.convert("L"), dtype=np.uint8)

    direction = execution.params.get("direction", "magnitude")
    ksize = execution.params.get("kernelSize", 3)

    sobel_x = cv2.Sobel(arr, cv2.CV_16S, 1, 0, ksize=ksize)
    sobel_y = cv2.Sobel(arr, cv2.CV_16S, 0, 1, ksize=ksize)

    if direction == "horizontal":
        result = np.abs(sobel_x)
    elif direction == "vertical":
        result = np.abs(sobel_y)
    else:
        result = np.sqrt(
            sobel_x.astype(np.float64) ** 2 + sobel_y.astype(np.float64) ** 2
        )

    result = (result - result.min()) / (result.max() - result.min()) * 255
    result_img = Image.fromarray(result.astype(np.uint8))

    return {"output_image_b64": image_to_b64(result_img)}


async def handle_prewitt(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    arr = np.array(img.convert("L"), dtype=np.uint8)

    direction = execution.params.get("direction", "magnitude")

    prewitt_x = np.array([[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]], dtype=np.float32)
    prewitt_y = np.array([[-1, -1, -1], [0, 0, 0], [1, 1, 1]], dtype=np.float32)

    grad_x = cv2.filter2D(arr, cv2.CV_16S, prewitt_x)
    grad_y = cv2.filter2D(arr, cv2.CV_16S, prewitt_y)

    if direction == "horizontal":
        result = np.abs(grad_x)
    elif direction == "vertical":
        result = np.abs(grad_y)
    else:
        result = np.sqrt(
            grad_x.astype(np.float64) ** 2 + grad_y.astype(np.float64) ** 2
        )

    result = (result - result.min()) / (result.max() - result.min()) * 255
    result_img = Image.fromarray(result.astype(np.uint8))

    return {"output_image_b64": image_to_b64(result_img)}


async def handle_laplacian(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    arr = np.array(img.convert("L"), dtype=np.uint8)

    ksize = execution.params.get("kernelSize", 3)
    apply_threshold = execution.params.get("applyThreshold", False)
    threshold_value = execution.params.get("thresholdValue", 50)

    result = cv2.Laplacian(arr, cv2.CV_16S, ksize=ksize)
    result = np.abs(result)

    if apply_threshold:
        _, result = cv2.threshold(
            result.astype(np.float64), threshold_value, 255, cv2.THRESH_BINARY
        )

    result = (result - result.min()) / (result.max() - result.min()) * 255
    result_img = Image.fromarray(result.astype(np.uint8))

    return {"output_image_b64": image_to_b64(result_img)}


async def handle_threshold(execution: NodeExecution) -> dict:
    if not execution.input_image_b64:
        raise HTTPException(status_code=400, detail="No input image provided")

    img = b64_to_image(execution.input_image_b64)
    arr = np.array(img.convert("L"), dtype=np.uint8)

    mode = execution.params.get("mode", "otsu")
    threshold_value = execution.params.get("thresholdValue", 128)

    if mode == "otsu":
        _, result = cv2.threshold(arr, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    else:
        _, result = cv2.threshold(arr, threshold_value, 255, cv2.THRESH_BINARY)

    result_img = Image.fromarray(result.astype(np.uint8))

    return {"output_image_b64": image_to_b64(result_img)}
