import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIncidentDocument extends Document {
  incidentId?: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  tileType?: string;
  fileName: string;
  extractedText: string;
  createdAt: Date;
}

const IncidentDocumentSchema = new Schema<IIncidentDocument>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident" },
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    tileType: { type: String },
    fileName: { type: String, required: true },
    extractedText: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

IncidentDocumentSchema.index({ incidentId: 1 });
IncidentDocumentSchema.index({ userId: 1, tileType: 1 });
IncidentDocumentSchema.index({ extractedText: "text" });

const IncidentDocument: Model<IIncidentDocument> =
  mongoose.models.IncidentDocument ||
  mongoose.model<IIncidentDocument>("IncidentDocument", IncidentDocumentSchema);

export default IncidentDocument;
