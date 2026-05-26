import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Incident from "@/models/Incident";
import Conversation from "@/models/Conversation";
import IncidentDocument from "@/models/IncidentDocument";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = "gemma4:31b-cloud";
const ESCALATION_KEYWORDS = [
  "cannot help", "unable to resolve", "escalate", "human agent",
  "beyond my capability", "contact support",
];

async function callOllama(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt, stream: false }),
      signal: controller.signal,
    });

    if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
    const data = await res.json();
    return data.response as string;
  } catch {
    return "The AI agent is currently unavailable. Please wait.";
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { incidentId, message } = await req.json();
  if (!incidentId || !message) {
    return NextResponse.json({ error: "incidentId and message required" }, { status: 400 });
  }

  await connectToDatabase();

  const incident = await Incident.findById(incidentId);
  if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  if (incident.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (incident.isResolved) {
    return NextResponse.json({ error: "Incident is resolved" }, { status: 400 });
  }

  // Persist user message
  await Conversation.create({ incidentId, role: "user", content: message, timestamp: new Date() });

  // Retrieve relevant document context (keyword-based)
  const words = message.split(/\s+/).filter((w: string) => w.length > 3);
  const regex = words.length ? new RegExp(words.slice(0, 5).join("|"), "i") : null;
  const docs = regex
    ? await IncidentDocument.find({ incidentId, extractedText: regex }).limit(3)
    : [];
  const context = docs.map((d) => d.extractedText.slice(0, 1000)).join("\n\n");

  // Retrieve conversation history
  const history = await Conversation.find({ incidentId }).sort({ timestamp: 1 }).limit(20);
  const historyText = history
    .map((h) => `${h.role === "user" ? "User" : "Agent"}: ${h.content}`)
    .join("\n");

  const prompt = [
    context ? `--- Relevant Documentation ---\n${context}\n---` : "",
    historyText ? `--- Conversation History ---\n${historyText}\n---` : "",
    `User: ${message}`,
    "Agent:",
  ]
    .filter(Boolean)
    .join("\n\n");

  const aiResponse = await callOllama(prompt);

  // Check for escalation signals
  const shouldEscalate =
    incident.status === "in_progress" &&
    ESCALATION_KEYWORDS.some((kw) => aiResponse.toLowerCase().includes(kw));

  if (shouldEscalate) {
    incident.status = "escalated";
    incident.priority = "High";
    incident.urgency = "High";
    incident.impact = "Med";
    await incident.save();
  }

  await Conversation.create({
    incidentId,
    role: "assistant",
    content: aiResponse,
    timestamp: new Date(),
  });

  return NextResponse.json({ response: aiResponse, incident });
}
