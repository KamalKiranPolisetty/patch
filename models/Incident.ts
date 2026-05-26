import mongoose, { Schema, Document, Model } from "mongoose";

export type IncidentStatus = "opened" | "in_progress" | "escalated" | "resolved";
export type Priority = "Low" | "Med" | "High";
export type ResolutionType = "AI_AGENT" | "MANUAL";

export interface IIncident extends Document {
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  status: IncidentStatus;
  description: string;
  isResolved: boolean;
  resolutionType?: ResolutionType;
  resolutionMethod?: string;
  resolutionNotes?: string;
  resolvedBy?: string;
  feedbackRating?: number;
  feedbackText?: string;
  priority?: Priority;
  urgency?: Priority;
  impact?: Priority;
}

const IncidentSchema = new Schema<IIncident>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["opened", "in_progress", "escalated", "resolved"],
      default: "in_progress",
    },
    description: { type: String, required: true },
    isResolved: { type: Boolean, default: false },
    resolutionType: { type: String, enum: ["AI_AGENT", "MANUAL"] },
    resolutionMethod: { type: String },
    resolutionNotes: { type: String },
    resolvedBy: { type: String },
    feedbackRating: { type: Number },
    feedbackText: { type: String },
    priority: { type: String, enum: ["Low", "Med", "High"] },
    urgency: { type: String, enum: ["Low", "Med", "High"] },
    impact: { type: String, enum: ["Low", "Med", "High"] },
  },
  { timestamps: false }
);

const Incident: Model<IIncident> =
  mongoose.models.Incident ||
  mongoose.model<IIncident>("Incident", IncidentSchema);

export default Incident;
