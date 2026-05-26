"use client";

import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  incidentId: string | null;
  messages: Message[];
  onNewMessage: (userMsg: Message, aiMsg: Message, updatedIncident?: { status: string }) => void;
  onCreateIncident: (description: string) => Promise<string>;
  disabled?: boolean;
}

export default function ChatInterface({
  incidentId,
  messages,
  onNewMessage,
  onCreateIncident,
  disabled = false,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = input.trim();
    if (!text || sending || disabled) return;

    setInput("");
    setSending(true);

    try {
      let activeIncidentId = incidentId;
      if (!activeIncidentId) {
        activeIncidentId = await onCreateIncident(text);
      }

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: activeIncidentId, message: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to send message");
        return;
      }

      const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
      const aiMsg: Message = { role: "assistant", content: data.response, timestamp: new Date() };
      onNewMessage(userMsg, aiMsg, data.incident);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex flex-col h-full" data-testid="chat-interface">
      {/* Message history */}
      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        data-testid="chat-messages"
      >
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm mt-8" data-testid="chat-empty-state">
            Select a device tile or type a message to start
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            data-testid={`chat-message-${msg.role}`}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start" data-testid="chat-typing-indicator">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-2.5 shadow-sm">
              <span className="inline-flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div
        className="border-t border-gray-200 bg-white px-4 py-3 flex gap-3 items-end"
        data-testid="chat-input-area"
      >
        {disabled ? (
          <p className="text-sm text-gray-400 w-full text-center py-1" data-testid="chat-disabled-message">
            This incident has been resolved. Chat is disabled.
          </p>
        ) : (
          <>
            <textarea
              data-testid="chat-text-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your support request..."
              rows={1}
              className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 max-h-32"
            />
            <button
              data-testid="chat-send-btn"
              onClick={handleSend}
              disabled={sending || !input.trim()}
              className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
            >
              Send
            </button>
          </>
        )}
      </div>
    </div>
  );
}
