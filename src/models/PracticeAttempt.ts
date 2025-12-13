import mongoose, { Schema, Document } from "mongoose";

export interface IPracticeAttempt extends Document {
  userId: mongoose.Types.ObjectId;
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
    userId: Schema.Types.ObjectId,
    questionId: Schema.Types.ObjectId,
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
