import mongoose, { Schema, Document } from "mongoose";

export interface IOption {
  key: string;
  text: string;
}

export interface IQuestion extends Document {
  question: string;
  options: IOption[];
  correctAnswer: string;
  subject: string;
  tags: string[];
  explanation: string;
  difficulty: string;
  type: string;
  source: string;
  year: number;
  isActive: boolean;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    question: { type: String, required: true },

    options: [
      {
        key: String,
        text: String
      }
    ],

    correctAnswer: { type: String, required: true },

    subject: String,
    tags: [String],
    explanation: String,
    difficulty: String,
    type: String,
    source: String,
    year: Number,

    isActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>("Question", QuestionSchema);
