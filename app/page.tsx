"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import DeviceTile from "@/components/DeviceTile";
import ChatInterface from "@/components/ChatInterface";

const DEVICE_TILES = [
  { label: "VDI", icon: "🖥️" },
  { label: "Printer", icon: "🖨️" },
  { label: "Network", icon: "🌐" },
  { label: "Laptop", icon: "💻" },
  { label: "Phone", icon: "📞" },
  { label: "Software", icon: "⚙️" },
  { label: "Email", icon: "📧" },
  { label: "Security", icon: "🔒" },
];

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incidentId, setIncidentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [creating, setCreating] = useState(false);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-screen">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  async function createIncident(description: string): Promise<string> {
    setCreating(true);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setIncidentId(data._id);
      return data._id;
    } catch {
      toast.error("Failed to create incident");
      throw new Error("Failed");
    } finally {
      setCreating(false);
    }
  }

  function handleTileSelect(label: string) {
    handleTileChat(label);
  }

  async function handleTileChat(label: string) {
    const text = `I need help with my ${label}`;
    let activeId = incidentId;

    try {
      if (!activeId) {
        activeId = await createIncident(text);
      }

      const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ incidentId: activeId, message: text }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed");
        return;
      }
      const aiMsg: Message = { role: "assistant", content: data.response, timestamp: new Date() };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      toast.error("Failed to start conversation");
    }
  }

  function handleNewMessage(
    userMsg: Message,
    aiMsg: Message,
    updatedIncident?: { status: string }
  ) {
    setMessages((prev) => [...prev, userMsg, aiMsg]);
    if (updatedIncident?.status === "escalated") {
      toast("Your issue has been escalated to a human agent.", { icon: "⚠️" });
    }
  }

  function handleFileUploaded(fileName: string) {
    toast.success(`${fileName} uploaded`);
  }

  return (
    <div className="flex flex-col h-screen" data-testid="home-page">
      <Toaster position="top-right" />
      <Navbar username={session?.user?.name} />

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Left panel: device tiles */}
        <aside
          className="w-72 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-4"
          data-testid="device-tiles-panel"
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3" data-testid="device-tiles-heading">
            Select Device Type
          </h2>
          {creating && (
            <p className="text-xs text-blue-600 mb-2" data-testid="creating-incident-indicator">
              Creating incident...
            </p>
          )}
          <div className="grid grid-cols-2 gap-3" data-testid="device-tile-grid">
            {DEVICE_TILES.map((tile) => (
              <DeviceTile
                key={tile.label}
                label={tile.label}
                icon={tile.icon}
                incidentId={incidentId}
                onSelect={handleTileSelect}
                onFileUploaded={handleFileUploaded}
              />
            ))}
          </div>

          {incidentId && (
            <div className="mt-4 p-3 bg-blue-50 rounded-xl" data-testid="incident-id-display">
              <p className="text-xs text-blue-700 font-medium">Active Incident</p>
              <p className="text-xs text-blue-600 font-mono truncate" data-testid="incident-id-value">
                {incidentId}
              </p>
            </div>
          )}
        </aside>

        {/* Right panel: chat */}
        <main className="flex-1 flex flex-col overflow-hidden" data-testid="chat-panel">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <h1 className="text-lg font-semibold text-gray-800" data-testid="chat-panel-heading">
              Support Chat
            </h1>
            {incidentId && (
              <p className="text-xs text-gray-400" data-testid="chat-incident-reference">
                Incident #{incidentId}
              </p>
            )}
          </div>
          <ChatInterface
            incidentId={incidentId}
            messages={messages}
            onNewMessage={handleNewMessage}
            onCreateIncident={createIncident}
            disabled={false}
          />
        </main>
      </div>
    </div>
  );
}
