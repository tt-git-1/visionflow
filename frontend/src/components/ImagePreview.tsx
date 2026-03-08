"use client";

import React, { useState, useEffect } from "react";

interface ImagePreviewProps {
  image: string | null;
  title?: string;
}

const b64ToBlobUrl = (base64: string): string => {
  if (!base64) {
    console.log("[Preview] b64ToBlobUrl: empty base64");
    return "";
  }
  
  const parts = base64.split(",");
  if (parts.length !== 2) {
    console.error("[Preview] b64ToBlobUrl: invalid format, parts:", parts.length);
    return "";
  }
  
  const mime = parts[0].replace(/data:/, "").replace(/;base64/, "");
  let b64Data = parts[1];
  
  try {
    // Add padding
    const padding = 4 - (b64Data.length % 4);
    if (padding !== 4) {
      b64Data += "=".repeat(padding);
    }
    
    console.log(`[Preview] b64ToBlobUrl: converting ${b64Data.length} chars, mime: ${mime}`);
    const binary = atob(b64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    console.log("[Preview] b64ToBlobUrl: success");
    return url;
  } catch (e) {
    console.error("[Preview] b64ToBlobUrl failed:", e, "base64 length:", b64Data.length);
    return "";
  }
};

export const ImagePreview: React.FC<ImagePreviewProps> = ({ image, title }) => {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (image) {
      setImageUrl(b64ToBlobUrl(image));
    } else {
      setImageUrl("");
    }
    
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [image]);

  if (!imageUrl) return null;

  return (
    <div className="absolute bottom-4 right-4 bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-700 p-3 max-w-sm">
      {title && <h3 className="font-bold text-sm text-gray-200 mb-2">{title}</h3>}
      <img
        src={imageUrl}
        alt="Preview"
        className="max-w-full max-h-64 object-contain rounded border border-gray-600"
      />
    </div>
  );
};
