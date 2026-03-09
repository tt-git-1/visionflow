"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import OpenAI from "openai";
import "../styles/chat-panel.css";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatPanelProps {
  baseURL?: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ baseURL = "http://localhost:1234/v1" }) => {
  const clientRef = useRef<OpenAI | null>(null);
  const [height, setHeight] = useState(300);
  const [width, setWidth] = useState(800);
  const [position, setPosition] = useState({ x: 0, y: 0});
  const startYRef = useRef<number>(0);
  const startXRef = useRef<number>(0);
  const startHeightTopRef = useRef<number>(0);
  const startHeightBottomRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);
  const startPositionRef = useRef({ x: 0, y: 0});
  const isDraggingRef = useRef(false);

  const handleMouseDownTop = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightTopRef.current = height;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startYRef.current - moveEvent.clientY;
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeightTopRef.current + delta));
      setHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [height]);

  const handleMouseDownBottom = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    startYRef.current = e.clientY;
    startHeightBottomRef.current = height;
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startYRef.current;
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeightBottomRef.current + delta));
      setHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [height]);

  const handleMouseDownLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    startPositionRef.current = position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(400, startWidthRef.current - delta);
      setWidth(newWidth);
      setPosition({ ...startPositionRef.current, x: startPositionRef.current.x + delta });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width, position]);

  const handleMouseDownRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startWidthRef.current = width;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startXRef.current;
      const newWidth = Math.max(400, startWidthRef.current + delta);
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width]);

  // Corner resize handlers
  const handleMouseDownTopLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightTopRef.current = height;
    startPositionRef.current = position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current; // 右に移動で正
      const deltaY = moveEvent.clientY - startYRef.current; // 下に移動で正
      const newWidth = Math.max(400, startWidthRef.current - deltaX); // 左に移動で増加
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeightTopRef.current - deltaY));
      setWidth(newWidth);
      setHeight(newHeight);
      setPosition({ x: startPositionRef.current.x + deltaX, y: startPositionRef.current.y + deltaY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width, height, position]);

  const handleMouseDownTopRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightTopRef.current = height;
    startPositionRef.current = position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current; // 右に移動で正
      const deltaY = moveEvent.clientY - startYRef.current; // 下に移動で正
      const newWidth = Math.max(400, startWidthRef.current + deltaX); // 右に移動で増加
      const newHeight = Math.max(
        100,
        Math.min(window.innerHeight * 0.8, startHeightTopRef.current - deltaY)
      );
      setWidth(newWidth);
      setHeight(newHeight);
      setPosition({ x: startPositionRef.current.x, y: startPositionRef.current.y + deltaY });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width, height, position]);

  const handleMouseDownBottomLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightBottomRef.current = height;
    startPositionRef.current = position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current; // 右に移動で正
      const deltaY = moveEvent.clientY - startYRef.current; // 下に移動で正
      const newWidth = Math.max(400, startWidthRef.current - deltaX); // 左に移動で増加
      const newHeight = Math.max(
        100,
        Math.min(window.innerHeight * 0.8, startHeightBottomRef.current + deltaY)
      );
      setWidth(newWidth);
      setHeight(newHeight);
      setPosition({ x: startPositionRef.current.x + deltaX, y: startPositionRef.current.y });
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width, height, position]);
  
  const handleMouseDownBottomRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startWidthRef.current = width;
    startHeightBottomRef.current = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startXRef.current; // 右に移動で正
      const deltaY = moveEvent.clientY - startYRef.current; // 下に移動で正
      const newWidth = Math.max(400, startWidthRef.current + deltaX); // 右に移動で増加
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeightBottomRef.current + deltaY));
      setWidth(newWidth);
      setHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [width, height]);

  // Panel drag handler
  const handleMouseDownDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startYRef.current = e.clientY;
    startPositionRef.current = position;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - startXRef.current;
      const deltaY = moveEvent.clientY - startYRef.current;
      setPosition({
        x: startPositionRef.current.x + deltaX,
        y: startPositionRef.current.y + deltaY
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [position]);

  // Handler for message/input areas - only drag if clicking on background
  const handleMouseDownArea = useCallback((e: React.MouseEvent) => {
    // Only allow dragging if clicking directly on this element (not its children)
    if (e.target !== e.currentTarget) {
      return;
    }
    handleMouseDownDrag(e);
  }, [handleMouseDownDrag]);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isComposingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    clientRef.current = new OpenAI({
      baseURL,
      apiKey: "",
      dangerouslyAllowBrowser: true,
    });
    
    // Set initial width and position based on screen size
    const initialWidth = Math.min(800, window.innerWidth - 64);
    setWidth(initialWidth);
    setPosition({
      x: (window.innerWidth - initialWidth) / 2,
      y: window.innerHeight - 320
    });
  }, [baseURL]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    if (!clientRef.current) return;

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
    
    try {
      const stream = await clientRef.current.chat.completions.create({
        model: "",
        messages: [
              { role: "system", content: "あなたはvisionflowというノードベースの画像処理webアプリのAIアシスタントです。画像処理に詳しいので、その知識を活かして親切にユーザーの助けになれば良いです。回答はなるべく簡潔にして下さい。また、ここでの会話で不適切な質問や会話をしてきたらお断りを入れるようにしてください。" },
              ...messages,
              { role: "user", content: input },
            ],
        stream: true,
      });

      let assistantMessage = "";

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          assistantMessage += content;
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "assistant",
              content: assistantMessage,
            };
            return updated;
          });
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Error occurred. Please check your connection." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !isComposingRef.current) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className = "absolute glass-panel flex flex-col rounded-2xl overflow-hidden"
      style={{
        height: `${height}px`,
        width: `${width}px`,
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex:9999
      }}
    >

      {/* Corner resize handles */}
      <div
        className="absolute top-0 left-0 w-3 h-3 cursor-nw-resize hover:bg-blue-400/50 transition-colors z-10"
        onMouseDown={handleMouseDownTopLeft}
      />
      <div
        className="absolute top-0 right-0 w-3 h-3 cursor-ne-resize hover:bg-blue-400/50 transition-colors z-10"
        onMouseDown={handleMouseDownTopRight}
      />
      <div
        className="absolute bottom-0 left-0 w-3 h-3 cursor-sw-resize hover:bg-blue-400/50 transition-colors z-10"
        onMouseDown={handleMouseDownBottomLeft}
      />
      <div
        className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize hover:bg-blue-400/50 transition-colors z-10"
        onMouseDown={handleMouseDownBottomRight}
      />

      { /* Top resize handle */}
      <div
        className="absolute top-0 left-3 h-1 cursor-ns-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={handleMouseDownTop}
      />

      {/* Drag handle bar */}
      <div
        className="h-7 flex items-center justify-center cursor-move hover:bg-white/5 transition-colors border-b border-white/10"
        onMouseDown={handleMouseDownDrag}
      >
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
          <div className="w-1 h-1 rounded-full bg-white/30"></div>
        </div>
      </div>

      {/* Left resize handle */}
      <div
        className="absolute top-3 bottom-3 left-0 w-1 cursor-ew-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={handleMouseDownLeft}
        />
      {/* Right resize handle */}
      <div
        className="absolute top-3 bottom-3 right-0 w-1 cursor-ew-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={handleMouseDownRight}
        />

      {/* Chat messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" onMouseDown={handleMouseDownArea}>
        {messages.length === 0 && (
          <p className="text-white/50 text-center text-sm">Ask me anything about your workflow...</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex ${msg.role == "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={`glass-message max-w-[70%] ${msg.role === "user" ? "text-right" : "text-left"}`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-white/10" onMouseDown={handleMouseDownArea}>
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => (isComposingRef.current = true)}
            onCompositionEnd={() => (isComposingRef.current = false)}
            placeholder="Type a message..."
            disabled={isLoading}
            rows={1}
            // className="flex-1 px-4 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-transparent text-white placeholder:text-white/50 resize-none"
            className="glass-input flex-1 resize-none"
            />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            // className="px-4 py-2 bg-blue-500/70 text-white rounded-lg hover:bg-blue-600/70 disabled:bg-white/20 text-sm transition-colors border border-white/30"
            className="glass-button disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>

      {/* Bottom resize handle */}
      <div
        // className="w-full h-2 cursor-ns-resize hover:bg-white/30 transition-colors"
        className="absolute bottom-0 left-3 right-3 h-1 cursor-ns-resize hover:bg-blue-400/30 transition-colors z-10"
        onMouseDown={handleMouseDownBottom}
      />
  </div>
  );
};