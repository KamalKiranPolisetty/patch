import mongoose, { Schema, Document, Model } from "mongoose";

export interface IIncidentDocument extends Document {
  incidentId: mongoose.Types.ObjectId;
  fileName: string;
  extractedText: string;
  createdAt: Date;
}

const IncidentDocumentSchema = new Schema<IIncidentDocument>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true },
    fileName: { type: String, required: true },
    extractedText: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

IncidentDocumentSchema.index({ incidentId: 1 });
IncidentDocumentSchema.index({ extractedText: "text" });

const IncidentDocument: Model<IIncidentDocument> =
  mongoose.models.IncidentDocument ||
  mongoose.model<IIncidentDocument>("IncidentDocument", IncidentDocumentSchema);

export default IncidentDocument;
