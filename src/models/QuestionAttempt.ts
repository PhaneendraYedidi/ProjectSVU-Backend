import mongoose, { Schema, Document } from "mongoose";

export interface IQuestionAttempt extends Document {
  userId?: mongoose.Types.ObjectId;     // optional for guest/mock
  sessionId?: string;                   // used for mock tests
  questionId: mongoose.Types.ObjectId;

  selectedOption: string;
  isCorrect: boolean;

  timeTaken: number;                    // seconds
  mode: "practice" | "mock";
  topic?: string;
  year?: number;

  createdAt: Date;
}const QuestionAttemptSchema = new Schema<IQuestionAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    sessionId: { type: String, index: true },

    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: true,
      index: true
    },

    selectedOption: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },

    timeTaken: { type: Number, required: true },
    mode: {
      type: String,
      enum: ["practice", "mock"],
      required: true,
      index: true
    },

    topic: String,
    year: Number
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IQuestionAttempt>(
  "QuestionAttempt",
  QuestionAttemptSchema
);

