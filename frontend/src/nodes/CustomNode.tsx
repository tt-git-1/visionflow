"use client";

import React, { memo, useEffect, useState } from "react";
import { Handle, Position } from "@xyflow/react";
import type { NodeType, NodeData } from "../types/index";

interface CustomNodeProps {
  data: NodeData;
  id: string;
  selected?: boolean;
  onViewImage?: (image: string) => void;
  onUploadImage?: (nodeId: string, base64: string) => void;
  onOpenSettings?: (nodeId: string, nodeType: string, params: Record<string, any>) => void;
  onContextMenu?: (nodeId: string, x: number, y: number) => void;
}

const nodeStyles: Record<NodeType, { bg: string; labelColor: string }> = {
  upload: { bg: "#3b82f6", labelColor: "white" },
  resize: { bg: "#3b82f6", labelColor: "white" },
  grayscale: { bg: "#3b82f6", labelColor: "white" },
  threshold: { bg: "#3b82f6", labelColor: "white" },
  gaussian: { bg: "#3b82f6", labelColor: "white" },
  median: { bg: "#3b82f6", labelColor: "white" },
  mean: { bg: "#3b82f6", labelColor: "white" },
  sobel: { bg: "#3b82f6", labelColor: "white" },
  prewitt: { bg: "#3b82f6", labelColor: "white" },
  laplacian: { bg: "#3b82f6", labelColor: "white" },
  brightness: { bg: "#3b82f6", labelColor: "white" },
};

const b64ToBlobUrl = (base64: string): string => {
  if (!base64) {
    // console.log("b64ToBlobUrl: empty base64");
    return "";
  }
  
  const parts = base64.split(",");
  if (parts.length !== 2) {
    console.error("b64ToBlobUrl: invalid format, parts:", parts.length);
    return "";
  }
  
  const mime = parts[0].replace(/data:/, "").replace(/;base64/, "");
  let b64Data = parts[1];
  
  try {
    // パディングを追加
    const padding = 4 - (b64Data.length % 4);
    if (padding !== 4) {
      b64Data += "=".repeat(padding);
    }
    
    // console.log(`b64ToBlobUrl: converting ${b64Data.length} chars, mime: ${mime}`);
    const binary = atob(b64Data);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    // console.log("b64ToBlobUrl: success, created blob URL");
    return url;
  } catch (e) {
    console.error("b64ToBlobUrl failed:", e, "base64 length:", b64Data.length);
    return "";
  }
};

export const CustomNode = memo(({ data, id, selected, onViewImage, onUploadImage, onOpenSettings, onContextMenu }: CustomNodeProps) => {
  // console.log('CustomNode render:', id, 'selected:', selected);
  const defaultStyle = nodeStyles[data.nodeType] || nodeStyles.upload;
  const style = data.customColor ? { ...defaultStyle, bg: data.customColor } : defaultStyle;
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    if (data.outputImage) {
      setImageUrl(b64ToBlobUrl(data.outputImage));
    } else {
      setImageUrl("");
    }
    
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [data.outputImage, id]);

  const triggerFileUpload = () => {
    if (!onUploadImage) return;
    
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        onUploadImage(id, event.target?.result as string);
      };
      reader.readAsDataURL(file);
    };
    input.click();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Upload node without image: trigger file upload
    if (data.nodeType === "upload" && !data.outputImage) {
      triggerFileUpload();
    }
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (data.outputImage && onViewImage) {
      onViewImage(data.outputImage);
    }
  };

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onOpenSettings) {
      onOpenSettings(id, data.nodeType, data.params || {});
    }
  };

  const displayText = data.nodeType === "upload" && !data.outputImage 
    ? "+ Click to upload" 
    : data.label;

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onContextMenu) {
      onContextMenu(id, e.clientX, e.clientY);
    }
  };

  return (
    <div
      data-reactnodeid={id}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{
        backgroundColor: style.bg,
        color: style.labelColor,
        padding: "12px",
        borderRadius: "8px",
        minWidth: "160px",
        border: selected ? "3px solid #fbbf24" : "2px solid rgba(0,0,0,0.1)",
        boxShadow: selected 
          ? "0 0 15px rgba(251, 191, 36, 0.7), 0 0 30px rgba(251, 191, 36, 0.4)" 
          : "none",
        cursor: "pointer",
      }}
      className="hover:border-white/50 transition-colors"
    >
      <Handle
        type="target"
        position={Position.Top}
        id={`input-${id}`}
        style={{ background: "#555", width: 8, height: 8 }}
      />
      
      <div className="flex items-center justify-between gap-2">
        <div className="font-semibold text-sm">{displayText}</div>
        {data.nodeType === "upload" && data.outputImage ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              triggerFileUpload();
            }}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            🔄
          </button>
        ) : data.nodeType !== "upload" && (
          <button
            onClick={handleSettingsClick}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors"
          >
            ⚙️
          </button>
        )}
      </div>
      
      {imageUrl && (
        <img
          src={imageUrl}
          alt="Preview"
          onClick={handleImageClick}
          className={`w-full h-20 object-contain rounded mb-2 border border-white/30 ${data.nodeType === "upload" ? "cursor-pointer hover:border-white/60 transition-colors" : ""}`}
        />
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        id={`output-${id}`}
        style={{ background: "#555", width: 8, height: 8 }}
      />
    </div>
  );
});

CustomNode.displayName = "CustomNode";
