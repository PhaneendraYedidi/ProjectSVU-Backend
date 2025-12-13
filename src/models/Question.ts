import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
  key: string;
  text: string;
}

export interface IQuestion extends Document {
  subject: string;
  topic: string;
  year: number;
  questionText: string;
  options: IOption[];
  correctOption: string;
  explanation: string;
  difficulty: string;
  isActive: boolean;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    subject: String,
    topic: String,
    year: Number,
    questionText: String,
    options: [{ key: String, text: String }],
    correctOption: String,
    explanation: String,
    difficulty: String,
    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
