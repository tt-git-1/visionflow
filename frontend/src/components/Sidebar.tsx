"use client";

import React from "react";

interface SidebarProps {
  onAddNode: (type: string, label: string) => void;
}

const createDraggableNode = (node: { type: string; label: string; color: string }) => ({
  ...node,
  draggable: true,
  onDragStart: (event: React.DragEvent) => {
    event.dataTransfer.setData("application/reactflowNodeType", node.type);
    event.dataTransfer.setData("application/reactflowNodeLabel", node.label);
    event.dataTransfer.effectAllowed = "move";
  },
});

const nodeTypes = [
  { type: "upload", label: "Upload Image", color: "#3b82f6" },
  { type: "resize", label: "Resize", color: "#3b82f6" },
  { type: "grayscale", label: "Grayscale", color: "#3b82f6" },
  { type: "threshold", label: "Threshold", color: "#3b82f6" },
  { type: "gaussian", label: "Gaussian Blur", color: "#3b82f6" },
  { type: "median", label: "Median Filter", color: "#3b82f6" },
  { type: "mean", label: "Mean Filter", color: "#3b82f6" },
  { type: "sobel", label: "Sobel Edge", color: "#3b82f6" },
  { type: "prewitt", label: "Prewitt Edge", color: "#3b82f6" },
  { type: "laplacian", label: "Laplacian Edge", color: "#3b82f6" },
  { type: "brightness", label: "Brightness", color: "#3b82f6" },
].map(createDraggableNode);

export const Sidebar: React.FC<SidebarProps> = ({ onAddNode }) => {
  return (
    <div className="absolute top-4 left-4 w-48 bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-700">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-bold text-sm text-gray-200">Add Node</h3>
      </div>
      <div className="p-2 space-y-1">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            draggable
            onDragStart={node.onDragStart}
            onClick={() => onAddNode(node.type, node.label)}
            style={{ backgroundColor: node.color }}
            className="w-full text-white px-3 py-2 rounded text-sm hover:opacity-90 transition-opacity shadow-md cursor-grab active:cursor-grabbing"
          >
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
};
