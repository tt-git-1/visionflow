"use client";

import React, { useState, useRef, useEffect } from "react";

interface ImageDimensions {
  width: number;
  height: number;
}

interface ImageViewerProps {
  image: string | null;
  onClose: () => void;
  title?: string;
}

const b64ToBlobUrl = (base64: string): string => {
  if (!base64) return "";
  
  const parts = base64.split(",");
  if (parts.length !== 2) return "";
  
  const mime = parts[0].replace(/data:/, "").replace(/;base64/, "");
  let b64Data = parts[1];
  
  try {
    const padding = 4 - (b64Data.length % 4);
    if (padding !== 4) {
      b64Data += "=".repeat(padding);
    }
    
    const binary = atob(b64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error("Failed to convert base64 to blob:", e);
    return "";
  }
};

export const ImageViewer: React.FC<ImageViewerProps> = ({ image, onClose, title }) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageDimensions, setImageDimensions] = useState<ImageDimensions | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [image]);

  useEffect(() => {
    if (imgRef.current && imgRef.current.complete) {
      setImageDimensions({
        width: imgRef.current.naturalWidth,
        height: imgRef.current.naturalHeight,
      });
    }
  }, [image]);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.min(Math.max(prev * delta, 0.1), 5));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDownload = async () => {
    if (!image) return;
    
    try {
      const response = await fetch(image);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `processed-image-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to download image:", e);
    }
  };

  if (!image) return null;

  const imageUrl = b64ToBlobUrl(image);

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div 
        ref={containerRef}
        className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 max-w-full max-h-full flex flex-col"
        style={{ width: "90vw", height: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div>
            <h2 className="text-lg font-bold text-white">{title || "Image Viewer"}</h2>
            {imageDimensions && (
              <p className="text-sm text-gray-400 mt-1">{imageDimensions.width} x {imageDimensions.height} px</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-400">Zoom: {Math.round(scale * 100)}%</span>
            <button
              onClick={handleDownload}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              💾 Save
            </button>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Image display area */}
        <div 
          className="flex-1 overflow-hidden bg-gray-800 cursor-grab active:cursor-grabbing relative"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              transformOrigin: "center center",
              transition: isDragging ? "none" : "transform 0.1s ease-out",
            }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <img
              ref={imgRef}
              src={imageUrl}
              alt="Preview"
              className="max-w-none object-contain select-none"
              style={{ pointerEvents: "none" }}
              onLoad={() => {
                if (imgRef.current) {
                  setImageDimensions({
                    width: imgRef.current.naturalWidth,
                    height: imgRef.current.naturalHeight,
                  });
                }
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-700 text-center text-sm text-gray-400">
          Scroll to zoom | Drag to pan
        </div>
      </div>
    </div>
  );
};
