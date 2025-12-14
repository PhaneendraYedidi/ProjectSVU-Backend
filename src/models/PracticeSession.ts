import mongoose, { Schema, Document } from "mongoose";

export interface IPracticeSession extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId: string;
  questionLimit: number;
  questionsServed: mongoose.Types.ObjectId[];
  isActive: boolean;
  createdAt: Date;
}

const PracticeSessionSchema = new Schema<IPracticeSession>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: false },
    sessionId: { type: String, unique: true },
    questionLimit: { type: Number, default: 5 },
    questionsServed: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IPracticeSession>(
  "PracticeSession",
  PracticeSessionSchema
);
