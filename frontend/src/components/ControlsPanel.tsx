"use client";

import React, { useState } from "react";

interface ControlsPanelProps {
  onExecute: () => void;
  onSave: () => void;
  onLoad: () => void;
  isExecuting?: boolean;
  onSelectModeToggle?: (enabled: boolean) => void;
  selectModeEnabled?: boolean;
  onSelectAll?: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  onExecute,
  onSave,
  onLoad,
  isExecuting,
  onSelectModeToggle,
  selectModeEnabled = false,
}) => {
  return (
    <div className="absolute top-4 right-4 bg-gray-800 rounded-lg shadow-xl z-10 border border-gray-700 p-3 w-50">
      <h3 className="font-bold text-sm text-gray-200 mb-3">Controls</h3>
      <div className="space-y-2">
        <button
          onClick={onExecute}
          disabled={isExecuting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm transition-colors shadow-md"
        >
          {isExecuting ? "Running..." : "Run Workflow"}
        </button>
        <button
          onClick={onSave}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors shadow-md"
        >
          Save
        </button>
        <button
          onClick={onLoad}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors shadow-md"
        >
          Load
        </button>
        {onSelectModeToggle && (
          <button
            onClick={() => onSelectModeToggle(!selectModeEnabled)}
            className={`w-full px-4 py-2 rounded text-sm transition-colors shadow-md ${
              selectModeEnabled 
                ? "bg-blue-600 text-white" 
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            🖱️ Select Mode {selectModeEnabled ? "(On)" : "(Off)"}
          </button>
        )}
      </div>
    </div>
  );
};
