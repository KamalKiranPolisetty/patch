"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/Navbar";
import ChatInterface from "@/components/ChatInterface";
import IncidentTimeline from "@/components/IncidentTimeline";
import FeedbackModal from "@/components/FeedbackModal";

interface Incident {
  _id: string;
  description: string;
  status: string;
  isResolved: boolean;
  createdAt: string;
  priority?: string;
  urgency?: string;
  impact?: string;
  resolutionType?: string;
  resolutionMethod?: string;
  resolvedBy?: string;
  feedbackRating?: number;
}

interface ConversationMsg {
  _id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export default function IncidentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, status } = useSession();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [conversations, setConversations] = useState<ConversationMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const fetchIncident = useCallback(async () => {
    const res = await fetch(`/api/incidents/${id}`);
    if (res.status === 404 || res.status === 403) {
      setNotFound(true);
      setLoading(false);
      return;
    }
    const data = await res.json();
    setIncident(data.incident);
    setConversations(data.conversations);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    if (status !== "authenticated") return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchIncident();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Poll for status updates every 5 seconds when not resolved
  useEffect(() => {
    if (!incident || incident.isResolved) return;
    const interval = setInterval(fetchIncident, 5000);
    return () => clearInterval(interval);
  }, [incident, fetchIncident]);

  function handleNewMessage(
    userMsg: { role: "user" | "assistant"; content: string; timestamp: Date },
    aiMsg: { role: "user" | "assistant"; content: string; timestamp: Date },
    updatedIncident?: { status: string }
  ) {
    setConversations((prev) => [
      ...prev,
      { _id: Date.now().toString(), role: "user", content: userMsg.content, timestamp: userMsg.timestamp.toISOString() },
      { _id: (Date.now() + 1).toString(), role: "assistant", content: aiMsg.content, timestamp: aiMsg.timestamp.toISOString() },
    ]);
    if (updatedIncident && incident) {
      setIncident({ ...incident, status: updatedIncident.status });
      if (updatedIncident.status === "escalated") {
        toast("Issue escalated to a human agent.", { icon: "⚠️" });
      }
    }
  }

  async function createIncident(): Promise<string> {
    return id; // already have the incident
  }

  function handleFeedbackClose(resolved: boolean) {
    setShowFeedback(false);
    if (resolved && incident) {
      setIncident({ ...incident, status: "resolved", isResolved: true });
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="incident-detail-loading">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="incident-not-found">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-300 mb-4">404</h1>
          <p className="text-gray-500">Incident not found or access denied.</p>
          <button
            onClick={() => router.push("/incidents")}
            className="mt-4 text-blue-600 hover:underline"
            data-testid="incident-not-found-back-btn"
          >
            Back to Incidents
          </button>
        </div>
      </div>
    );
  }

  if (!incident) return null;

  const chatMessages = conversations.map((c) => ({
    role: c.role,
    content: c.content,
    timestamp: new Date(c.timestamp),
  }));

  const isResolved = incident.isResolved || incident.status === "resolved";

  return (
    <div className="flex flex-col h-screen" data-testid="incident-detail-page">
      <Toaster position="top-right" />
      <Navbar username={session?.user?.name} />

      {showFeedback && (
        <FeedbackModal incidentId={id} onClose={handleFeedbackClose} />
      )}

      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Left panel: incident details */}
        <aside
          className="w-80 shrink-0 border-r border-gray-200 bg-white overflow-y-auto p-5"
          data-testid="incident-details-panel"
        >
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4" data-testid="incident-details-heading">
            Incident Details
          </h2>

          {/* Timeline */}
          <div className="mb-6" data-testid="incident-timeline-section">
            <IncidentTimeline status={incident.status} />
          </div>

          {/* Details table */}
          <table className="w-full text-sm" data-testid="incident-details-table">
            <tbody className="divide-y divide-gray-100">
              <tr data-testid="incident-detail-id">
                <td className="py-2 pr-3 text-gray-500 font-medium">ID</td>
                <td className="py-2 font-mono text-xs text-gray-700 break-all">{incident._id}</td>
              </tr>
              <tr data-testid="incident-detail-status">
                <td className="py-2 pr-3 text-gray-500 font-medium">Status</td>
                <td className="py-2 text-gray-700 capitalize">{incident.status.replace("_", " ")}</td>
              </tr>
              <tr data-testid="incident-detail-priority">
                <td className="py-2 pr-3 text-gray-500 font-medium">Priority</td>
                <td className="py-2 text-gray-700">{incident.priority || "—"}</td>
              </tr>
              <tr data-testid="incident-detail-urgency">
                <td className="py-2 pr-3 text-gray-500 font-medium">Urgency</td>
                <td className="py-2 text-gray-700">{incident.urgency || "—"}</td>
              </tr>
              <tr data-testid="incident-detail-impact">
                <td className="py-2 pr-3 text-gray-500 font-medium">Impact</td>
                <td className="py-2 text-gray-700">{incident.impact || "—"}</td>
              </tr>
              <tr data-testid="incident-detail-created">
                <td className="py-2 pr-3 text-gray-500 font-medium">Created</td>
                <td className="py-2 text-gray-700">{new Date(incident.createdAt).toLocaleString()}</td>
              </tr>
              <tr data-testid="incident-detail-resolution-state">
                <td className="py-2 pr-3 text-gray-500 font-medium">Resolution State</td>
                <td className="py-2 text-gray-700">
                  {isResolved ? "Resolved" : incident.status === "escalated" ? "Awaiting Agent" : "In Progress"}
                </td>
              </tr>
              {isResolved && (
                <tr data-testid="incident-detail-resolved-by">
                  <td className="py-2 pr-3 text-gray-500 font-medium">Resolved By</td>
                  <td className="py-2 text-gray-700">{incident.resolvedBy || incident.resolutionMethod || "—"}</td>
                </tr>
              )}
            </tbody>
          </table>

          {!isResolved && (
            <button
              data-testid="resolve-incident-btn"
              onClick={() => setShowFeedback(true)}
              className="mt-5 w-full bg-green-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
            >
              Mark as Resolved
            </button>
          )}

          {isResolved && (
            <div
              className="mt-5 bg-green-50 border border-green-200 rounded-lg p-3 text-center"
              data-testid="incident-resolved-badge"
            >
              <p className="text-green-700 text-sm font-semibold">✓ Resolved</p>
              {incident.feedbackRating && (
                <p className="text-green-600 text-xs mt-1">Rating: {incident.feedbackRating}/5</p>
              )}
            </div>
          )}
        </aside>

        {/* Right: chat */}
        <main className="flex-1 flex flex-col overflow-hidden" data-testid="incident-chat-panel">
          <div className="px-6 py-3 border-b border-gray-200 bg-white">
            <h1 className="text-lg font-semibold text-gray-800 truncate" data-testid="incident-chat-heading">
              {incident.description}
            </h1>
          </div>
          <ChatInterface
            incidentId={id}
            messages={chatMessages}
            onNewMessage={handleNewMessage}
            onCreateIncident={createIncident}
            disabled={isResolved}
          />
        </main>
      </div>
    </div>
  );
}
