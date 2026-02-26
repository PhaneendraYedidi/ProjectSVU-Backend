import { Schema, model, Types, Document } from "mongoose";

export interface IMockTest extends Document {
  user: Types.ObjectId;
  templateId?: Types.ObjectId;
  questions: Types.ObjectId[];
  answers: Record<string, string>; // questionId -> chosen option
  score?: number;
  total?: number;
  startedAt: Date;
  submittedAt?: Date;
  status: "IN_PROGRESS" | "SUBMITTED";
}

const mockTestSchema = new Schema<IMockTest>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    templateId: { type: Schema.Types.ObjectId, ref: "MockTestTemplate" },
    questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    answers: { type: Object, default: {} },
    score: Number,
    total: Number,
    startedAt: { type: Date, default: Date.now },
    submittedAt: Date,
    status: {
      type: String,
      enum: ["IN_PROGRESS", "SUBMITTED"],
      default: "IN_PROGRESS"
    }
  },
  { timestamps: true }
);

export const MockTest = model<IMockTest>("MockTest", mockTestSchema);
