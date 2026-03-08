"use client";

import React from "react";

interface ContextMenuProps {
  x: number;
  y: number;
  onChangeColor: (color: string) => void;
  onClose: () => void;
}

const colors = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#ef4444", // red
  "#a855f7", // purple
  "#f59e0b", // amber
  "#ec4899", // pink
  "#14b8a6", // teal
  "#8b5cf6", // violet
  "#06b6d4", // cyan
  "#84cc16", // lime
];

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onChangeColor,
  onClose,
}) => {
  return (
    <>
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
        onContextMenu={(e) => e.preventDefault()}
      />
      <div
        className="absolute z-50 bg-gray-800 rounded-lg shadow-xl border border-gray-700 p-2"
        style={{ left: x, top: y }}
      >
        <div className="text-xs text-gray-300 mb-2 px-1">Node Color</div>
        <div className="grid grid-cols-5 gap-1">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => {
                onChangeColor(color);
                onClose();
              }}
              className="w-6 h-6 rounded border border-gray-600 hover:border-white transition-colors"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </>
  );
};