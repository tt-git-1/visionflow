"use client";

import React, { useState } from "react";

interface ControlsPanelProps {
  onExecute: () => void;
  onSave: () => void;
  onLoad: () => void;
  isExecuting?: boolean;
  onSelectModeToggle?: (enabled: boolean) => void;
  selectModeEnabled?: boolean;
  baseURL?: string;
  onBaseURLChange?: (url: string) => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  onExecute,
  onSave,
  onLoad,
  isExecuting,
  onSelectModeToggle,
  selectModeEnabled = false,
  baseURL = "http://localhost:1234/v1",
  onBaseURLChange,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [urlInput, setUrlInput] = useState(baseURL);

  return (
    <>
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-80 border border-gray-700">
            <h3 className="font-bold text-gray-200 mb-4">Chat Settings</h3>
            <label className="text-sm text-gray-400 block mb-2">Base URL</label>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 text-sm bg-gray-700 text-white"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onBaseURLChange?.(urlInput);
                  setShowSettings(false);
                }}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
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
          <button
            onClick={() => {
              setUrlInput(baseURL);
              setShowSettings(true);
            }}
            className="w-full px-4 py-2 rounded text-sm transition-colors shadow-md bg-blue-600 hover:bg-blue-700 text-white"
          >
            ⚙️ Chat Settings
          </button>
        </div>
      </div>
    </>
  );
};