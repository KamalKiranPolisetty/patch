import mongoose, { Schema, Document, Model } from "mongoose";

export type ConversationRole = "user" | "assistant";

export interface IConversation extends Document {
  incidentId: mongoose.Types.ObjectId;
  role: ConversationRole;
  content: string;
  timestamp: Date;
}

const ConversationSchema = new Schema<IConversation>(
  {
    incidentId: { type: Schema.Types.ObjectId, ref: "Incident", required: true },
    role: { type: String, enum: ["user", "assistant"], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

ConversationSchema.index({ incidentId: 1, timestamp: 1 });

const Conversation: Model<IConversation> =
  mongoose.models.Conversation ||
  mongoose.model<IConversation>("Conversation", ConversationSchema);

export default Conversation;
