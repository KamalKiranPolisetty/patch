import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Incident from "@/models/Incident";
import IncidentDocument from "@/models/IncidentDocument";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const incidentId = formData.get("incidentId") as string | null;

  if (!file || !incidentId) {
    return NextResponse.json({ error: "file and incidentId are required" }, { status: 400 });
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
  }

  await connectToDatabase();

  const incident = await Incident.findById(incidentId);
  if (!incident) return NextResponse.json({ error: "Incident not found" }, { status: 404 });
  if (incident.userId.toString() !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let extractedText = "";

  try {
    const uint8 = new Uint8Array(buffer);
    const loadingTask = pdfjsLib.getDocument({ data: uint8, useWorkerFetch: false });
    const pdf = await loadingTask.promise;
    const parts: string[] = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      parts.push(content.items.map((item) => ("str" in item ? item.str : "")).join(" "));
    }
    extractedText = parts.join("\n");
  } catch {
    extractedText = "";
  }

  const doc = await IncidentDocument.create({
    incidentId,
    fileName: file.name,
    extractedText,
    createdAt: new Date(),
  });

  return NextResponse.json({ message: "File uploaded successfully", documentId: doc._id }, { status: 201 });
}
