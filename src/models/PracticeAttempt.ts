import mongoose, { Schema, Document } from "mongoose";

export interface IPracticeAttempt extends Document {
  userId?: mongoose.Types.ObjectId;
  sessionId?: string;
  questionId: mongoose.Types.ObjectId;
  selectedOption: string;
  isCorrect: boolean;
  timeTaken: number;
  mode: string;
  topic?: string;
  year?: number;
}

const PracticeAttemptSchema = new Schema<IPracticeAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, required: false },
    sessionId: { type: String, required: false },
    questionId: { type: Schema.Types.ObjectId, required: true },
    selectedOption: String,
    isCorrect: Boolean,
    timeTaken: Number,
    mode: String,
    topic: String,
    year: Number
  },
  { timestamps: true }
);

export default mongoose.model<IPracticeAttempt>(
  "PracticeAttempt",
  PracticeAttemptSchema
);
