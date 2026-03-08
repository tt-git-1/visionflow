"use client";

import React, { useCallback, useState, useMemo, memo, useEffect } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Node,
  Edge,
  Controls,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { CustomNode } from "../src/nodes/CustomNode";
import { Sidebar } from "../src/components/Sidebar";
import { ControlsPanel } from "../src/components/ControlsPanel";
import { ImageViewer } from "../src/components/ImageViewer";
import { NodeSettings } from "../src/components/NodeSettings";
import { NodeType, NodeData } from "../src/types";
import { ContextMenu } from "../src/components/ContextMenu";

const initialNodes: Node<NodeData & Record<string, unknown>>[] = [];
const initialEdges: Edge[] = [];

export default function Home() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isExecuting, setIsExecuting] = useState(false);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [viewerImage, setViewerImage] = useState<string | null>(null);
  const [viewerTitle, setViewerTitle] = useState("");
  const [settingsNode, setSettingsNode] = useState<{
    id: string;
    type: string;
    params: Record<string, any>;
  } | null>(null);
  const [selectModeEnabled, setSelectModeEnabled] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    nodeId: string;
    x: number;
    y: number;
  } | null>(null);

  // console.log('nodes selected state:', nodes.filter(n => n.selected).map(n => n.id));

  const handleViewImage = useCallback((img: string, title: string) => {
    setViewerImage(img);
    setViewerTitle(title);
  }, []);

  const handleUploadToNode = useCallback((nodeId: string, base64: string) => {
    setNodes(nds => nds.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, outputImage: base64 } }
        : n
    ));
  }, [setNodes]);

  const handleOpenSettings = useCallback((nodeId: string, nodeType: string, params: Record<string, any>) => {
    setSettingsNode({ id: nodeId, type: nodeType, params });
  }, []);

  const handleNodeContextMenu = useCallback((nodeId: string, x: number, y: number) => {
    setContextMenu({ nodeId, x, y });
  }, []);

  const handleChangeNodeColor = useCallback((color: string) => {
    if (contextMenu) {
      setNodes(nds => nds.map(n =>
        n.id === contextMenu.nodeId
          ? { ...n, data: { ...n.data, customColor: color } }
          : n
      ));
    }
  }, [contextMenu, setNodes]);

  const handleSaveSettings = useCallback((nodeId: string, newParams: Record<string, any>) => {
    setNodes(nds => nds.map(n => 
      n.id === nodeId 
        ? { ...n, data: { ...n.data, params: newParams } }
        : n
    ));
    setSettingsNode(null);
  }, [setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const handleAddNode = (type: string, label: string, position?: { x: number; y: number }) => {
    const id = `${type}-${Date.now()}`;
    const newNode: Node<NodeData> = {
      id,
      type: "custom",
      position: position || { x: Math.random() * 200 + 50, y: Math.random() * 300 + 50 },
      data: {
        label,
        nodeType: type as NodeType,
        params: {},
      },
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      
      const type = event.dataTransfer.getData("application/reactflowNodeType");
      const label = event.dataTransfer.getData("application/reactflowNodeLabel");
      
      if (!type || !label) return;

      handleAddNode(type, label, { 
        x: window.innerWidth / 2, 
        y: window.innerHeight / 2 
      });
    },
    [handleAddNode]
  );

  const onDragOver = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
    },
    []
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Backspace" || e.key === "Delete") {
        if ((e.target as HTMLElement).tagName === "INPUT" || 
            (e.target as HTMLElement).tagName === "TEXTAREA") {
          return;
        }

        const selected = nodes.filter(n => n.selected);
        
        if (selected.length > 0) {
          e.preventDefault();
          const nodeIds = new Set(selected.map(n => n.id));
          setNodes(nds => nds.filter(n => !nodeIds.has(n.id)));
          setEdges(eds => eds.filter(ed => !nodeIds.has(ed.source) && !nodeIds.has(ed.target)));
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nodes, setNodes, setEdges]);

  const executeNode = async (nodeType: string, params: any, inputImage: string): Promise<string> => {
    // console.log(`Executing node: ${nodeType}`, { params, inputLength: inputImage?.length });
    
    const response = await fetch("http://localhost:8000/api/nodes/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        node_type: nodeType,
        params,
        input_image_b64: inputImage,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Node execution failed: ${nodeType}`, errorText);
      throw new Error(`Node execution failed: ${nodeType} - ${errorText}`);
    }

    const result = await response.json();
    // console.log(`Node ${nodeType} completed, output length:`, result.output_image_b64?.length);
    return result.output_image_b64;
  };

  const topologicalSort = (): Node<NodeData>[] => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();

    nodes.forEach((n) => {
      inDegree.set(n.id, 0);
      adjacency.set(n.id, []);
    });

    edges.forEach((e) => {
      if (adjacency.has(e.source)) {
        adjacency.get(e.source)?.push(e.target);
      }
      inDegree.set(e.target, (inDegree.get(e.target) || 0) + 1);
    });

    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) queue.push(id);
    });

    const result: Node<NodeData>[] = [];
    while (queue.length > 0) {
      const nodeId = queue.shift()!;
      result.push(nodeMap.get(nodeId)!);

      adjacency.get(nodeId)?.forEach((neighbor) => {
        inDegree.set(neighbor, (inDegree.get(neighbor) || 0) - 1);
        if (inDegree.get(neighbor) === 0) {
          queue.push(neighbor);
        }
      });
    }

    return result;
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setFinalImage(null);

    try {
      const sortedNodes = topologicalSort();
      const nodeResults = new Map<string, string>();

      for (const node of sortedNodes) {
        if (node.data.nodeType === "upload") {
          if (node.data.outputImage) {
            nodeResults.set(node.id, node.data.outputImage);
            setNodes((nds) =>
              nds.map((n) =>
                n.id === node.id ? { ...n, data: { ...n.data, outputImage: node.data.outputImage } } : n
              )
            );
          }
          continue;
        }

        const inputEdge = edges.find((e) => e.target === node.id);
        if (!inputEdge || !nodeResults.has(inputEdge.source)) {
          console.warn(`Skipping ${node.id}: no valid input`);
          continue;
        }

        const inputImage = nodeResults.get(inputEdge.source)!;
        
        // console.log(`Processing ${node.data.nodeType} node ${node.id}, input length:`, inputImage?.length);
        
        try {
          const outputImage = await executeNode(
            node.data.nodeType,
            node.data.params || {},
            inputImage
          );
          
          // console.log(`Got output for ${node.id}, length:`, outputImage?.length);
          
          nodeResults.set(node.id, outputImage);
          setNodes((nds) =>
            nds.map((n) =>
              n.id === node.id ? { ...n, data: { ...n.data, outputImage } } : n
            )
          );

          const nodeType = node.data.nodeType as string;
          if (nodeType !== "upload") {
            // console.log(`Setting final image, length:`, outputImage?.length);
            setFinalImage(outputImage);
          }
        } catch (error) {
          console.error(`Failed to execute node ${node.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Workflow execution failed:", error);
      alert("Failed to run workflow");
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = () => {
    const workflow = { nodes, edges };
    const json = JSON.stringify(workflow, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const { nodes: loadedNodes, edges: loadedEdges } = JSON.parse(event.target?.result as string);
          setNodes(loadedNodes);
          setEdges(loadedEdges);
        } catch (error) {
          console.error("Failed to load workflow:", error);
          alert("Failed to load workflow");
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen bg-gray-900">
        <ReactFlow
          nodes={nodes}
          onPaneClick={() => {
            if (selectModeEnabled) {
              setNodes(nds => nds.map(n => ({ ...n, selected: false })));
            }
          }}
          panOnDrag={selectModeEnabled ? false : true}
          selectionOnDrag={selectModeEnabled}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          nodeTypes={useMemo(() => ({
            custom: (props) => (
              <CustomNode 
                {...props} 
                data={{ ...props.data }}
                selected={selectModeEnabled ? props.selected : props.selected}
                onViewImage={(img: string) => handleViewImage(img, "Node Output")}
                onUploadImage={handleUploadToNode}
                onOpenSettings={handleOpenSettings}
                onContextMenu={handleNodeContextMenu}
              />
            ),
          }), [selectModeEnabled, handleViewImage, handleUploadToNode, handleOpenSettings, handleNodeContextMenu])}
          className="bg-gray-900"
          proOptions={{ hideAttribution: true }}
        >
      </ReactFlow>

      <Sidebar onAddNode={handleAddNode} />

      <ControlsPanel
        onExecute={handleExecute}
        onSave={handleSave}
        onLoad={handleLoad}
        isExecuting={isExecuting}
        onSelectModeToggle={setSelectModeEnabled}
        selectModeEnabled={selectModeEnabled}
      />

      {viewerImage && (
        <ImageViewer
          image={viewerImage}
          onClose={() => setViewerImage(null)}
          title={viewerTitle}
        />
      )}

      {settingsNode && (
        <NodeSettings
          nodeType={settingsNode.type}
          params={settingsNode.params}
          onSave={(newParams) => handleSaveSettings(settingsNode.id, newParams)}
          onClose={() => setSettingsNode(null)}
        />
      )}

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onChangeColor={handleChangeNodeColor}
          onClose={() => setContextMenu(null)}
        />
      )}
      </div>
    </ReactFlowProvider>
  );
}