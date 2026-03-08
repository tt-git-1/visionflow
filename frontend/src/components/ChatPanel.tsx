"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import OpenAI from "openai";

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
  const startYRef = useRef<number>(0);
  const startHeightTopRef = useRef<number>(0);
  const startHeightBottomRef = useRef<number>(0);

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
      const newHeight = Math.max(100, Math.min(window.innerHeight * 0.8, startHeightBottomRef.current - delta));
      setHeight(newHeight);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  }, [height]);

  useEffect(() => {
    clientRef.current = new OpenAI({
      baseURL,
      apiKey: "",
      dangerouslyAllowBrowser: true,
    });
  }, [baseURL]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isComposingRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
    <div className="absolute bottom-0 left-0 right-0 bg-transparent flex flex-col z-20 select-none" style={{ height: `${height}px` }}>
      <div
        className="w-full h-2 cursor-ns-resize hover:bg-white/30 transition-colors"
        onMouseDown={handleMouseDownTop}
        title="Drag to resize (expand upward)"
      />
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 flex flex-col">
        {messages.length === 0 && (
          <p className="text-white/50 text-center text-sm">Ask me anything about your workflow...</p>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`max-w-[50%] p-3 rounded-2xl text-sm border border-white bg-transparent ${
              msg.role === "user" ? "ml-auto mr-4" : "mr-auto ml-4"
            }`}
          >
            {msg.content}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3">
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
            className="flex-1 px-4 py-2 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-transparent text-white placeholder:text-white/50 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="px-4 py-2 bg-blue-500/70 text-white rounded-lg hover:bg-blue-600/70 disabled:bg-white/20 text-sm transition-colors border border-white/30"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>

      <div
        className="w-full h-2 cursor-ns-resize hover:bg-white/30 transition-colors"
        onMouseDown={handleMouseDownBottom}
        title="Drag to resize (shrink downward)"
      />
    </div>
  );
};