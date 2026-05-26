import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Incident from "@/models/Incident";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const incidents = await Incident.find({ userId: session.user.id }).sort({ createdAt: -1 });
  return NextResponse.json(incidents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { description } = await req.json();
  if (!description) return NextResponse.json({ error: "Description required" }, { status: 400 });

  await connectToDatabase();
  const incident = await Incident.create({
    userId: session.user.id,
    description,
    status: "in_progress",
    isResolved: false,
    createdAt: new Date(),
  });

  return NextResponse.json(incident, { status: 201 });
}
