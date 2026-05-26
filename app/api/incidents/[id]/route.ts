import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Incident from "@/models/Incident";
import Conversation from "@/models/Conversation";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  const incident = await Incident.findById(id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (incident.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const conversations = await Conversation.find({ incidentId: id }).sort({ timestamp: 1 });
  return NextResponse.json({ incident, conversations });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await connectToDatabase();

  const incident = await Incident.findById(id);
  if (!incident) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (incident.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Prevent re-opening resolved incidents
  if (incident.isResolved) {
    return NextResponse.json({ error: "Resolved incidents cannot be modified" }, { status: 400 });
  }

  const body = await req.json();
  const allowed = [
    "status", "isResolved", "resolutionMethod", "resolutionNotes",
    "feedbackRating", "feedbackText", "priority", "urgency", "impact",
  ];
  for (const key of allowed) {
    if (body[key] !== undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (incident as any)[key] = body[key];
    }
  }

  await incident.save();
  return NextResponse.json(incident);
}
