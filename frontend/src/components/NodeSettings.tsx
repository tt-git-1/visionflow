"use client";

import React, { useState, useEffect } from "react";

interface NodeSettingsProps {
  nodeType: string;
  params: Record<string, any>;
  onSave: (params: Record<string, any>) => void;
  onClose: () => void;
}

export const NodeSettings: React.FC<NodeSettingsProps> = ({ 
  nodeType, 
  params, 
  onSave, 
  onClose 
}) => {
  const [localParams, setLocalParams] = useState(() => ({ ...params }));
  
  useEffect(() => {
    setLocalParams({ ...params });
  }, [params]);

  const handleSave = () => {
    onSave(localParams);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 shadow-xl">
        <h3 className="text-lg font-bold text-white mb-4 capitalize">{nodeType} Settings</h3>
        
        {nodeType === "resize" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Width</label>
              <input
                type="number"
                value={localParams.width || ""}
                onChange={(e) => setLocalParams({ ...localParams, width: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                placeholder="e.g., 800"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Height</label>
              <input
                type="number"
                value={localParams.height || ""}
                onChange={(e) => setLocalParams({ ...localParams, height: parseInt(e.target.value) || 0 })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
                placeholder="e.g., 600"
              />
            </div>
          </div>
        )}

        {nodeType === "brightness" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">
                Brightness Factor: {(localParams.factor || 1).toFixed(2)}x
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={localParams.factor || 1}
                onChange={(e) => setLocalParams({ ...localParams, factor: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>0x (Dark)</span>
                <span>1x (Normal)</span>
                <span>2x (Bright)</span>
              </div>
            </div>
          </div>
        )}

        {nodeType === "gaussian" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kernel Size: {localParams.kernelSize || 5}</label>
              <input
                type="range"
                min="3"
                max="21"
                step="2"
                value={localParams.kernelSize || 5}
                onChange={(e) => setLocalParams({ ...localParams, kernelSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3 (Light)</span>
                <span>21 (Strong)</span>
              </div>
            </div>
          </div>
        )}

        {nodeType === "median" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kernel Size: {localParams.kernelSize || 5}</label>
              <input
                type="range"
                min="3"
                max="15"
                step="2"
                value={localParams.kernelSize || 5}
                onChange={(e) => setLocalParams({ ...localParams, kernelSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3 (Light)</span>
                <span>15 (Strong)</span>
              </div>
            </div>
            <p className="text-xs text-gray-500">Good for removing salt-and-pepper noise while preserving edges.</p>
          </div>
        )}

        {nodeType === "mean" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kernel Size: {localParams.kernelSize || 5}</label>
              <input
                type="range"
                min="3"
                max="21"
                step="2"
                value={localParams.kernelSize || 5}
                onChange={(e) => setLocalParams({ ...localParams, kernelSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3 (Light)</span>
                <span>21 (Strong)</span>
              </div>
            </div>
          </div>
        )}

        {nodeType === "grayscale" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Converts the image to grayscale (black and white).</p>
          </div>
        )}

        {nodeType === "sobel" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Direction</label>
              <select
                value={localParams.direction || "magnitude"}
                onChange={(e) => setLocalParams({ ...localParams, direction: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="magnitude">Magnitude (Both)</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kernel Size: {localParams.kernelSize || 3}</label>
              <input
                type="range"
                min="3"
                max="7"
                step="2"
                value={localParams.kernelSize || 3}
                onChange={(e) => setLocalParams({ ...localParams, kernelSize: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>3 (Sharp)</span>
                <span>7 (Smooth)</span>
              </div>
            </div>
            <p className="text-sm text-gray-400">Detects edges by calculating the gradient of image intensity.</p>
          </div>
        )}

        {nodeType === "prewitt" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Direction</label>
              <select
                value={localParams.direction || "magnitude"}
                onChange={(e) => setLocalParams({ ...localParams, direction: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="magnitude">Magnitude (Both)</option>
                <option value="horizontal">Horizontal</option>
                <option value="vertical">Vertical</option>
              </select>
            </div>
            <p className="text-sm text-gray-400">Similar to Sobel but uses simpler kernels. Good for general edge detection.</p>
          </div>
        )}

        {nodeType === "laplacian" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Kernel Size: {localParams.kernelSize || 3}</label>
              <select
                value={localParams.kernelSize || 3}
                onChange={(e) => setLocalParams({ ...localParams, kernelSize: parseInt(e.target.value) })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value={3}>3x3 (Faster)</option>
                <option value={5}>5x5 (More detailed)</option>
              </select>
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={localParams.applyThreshold || false}
                  onChange={(e) => setLocalParams({ ...localParams, applyThreshold: e.target.checked })}
                  className="rounded"
                />
                Apply Threshold
              </label>
            </div>
            {localParams.applyThreshold && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Threshold Value: {localParams.thresholdValue || 50}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={localParams.thresholdValue || 50}
                  onChange={(e) => setLocalParams({ ...localParams, thresholdValue: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
            <p className="text-sm text-gray-400">Detects edges by finding zero crossings in the second derivative.</p>
          </div>
        )}

        {nodeType === "threshold" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-300 mb-1">Mode</label>
              <select
                value={localParams.mode || "otsu"}
                onChange={(e) => setLocalParams({ ...localParams, mode: e.target.value })}
                className="w-full bg-gray-700 text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none"
              >
                <option value="otsu">Otsu's Binarization</option>
                <option value="manual">Manual Threshold</option>
              </select>
            </div>
            {localParams.mode === "manual" && (
              <div>
                <label className="block text-sm text-gray-300 mb-1">Threshold Value: {localParams.thresholdValue || 128}</label>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={localParams.thresholdValue || 128}
                  onChange={(e) => setLocalParams({ ...localParams, thresholdValue: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}
            <p className="text-sm text-gray-400">Converts image to black and white using thresholding.</p>
          </div>
        )}

        {nodeType === "upload" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Click on the node to upload an image.</p>
          </div>
        )}

        {nodeType === "output" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Final output node. Displays the processed result.</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};
