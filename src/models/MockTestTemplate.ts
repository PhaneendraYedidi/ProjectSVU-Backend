import { Schema, model, Document, Types } from "mongoose";

export interface IMockTestTemplate extends Document {
    title: string;
    description?: string;
    questions: Types.ObjectId[];
    duration: number; // in minutes
    totalMarks: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const mockTestTemplateSchema = new Schema<IMockTestTemplate>(
    {
        title: { type: String, required: true },
        description: String,
        questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        duration: { type: Number, default: 60 },
        totalMarks: { type: Number, default: 0 },
        isActive: { type: Boolean, default: true }
    },
    { timestamps: true }
);

export const MockTestTemplate = model<IMockTestTemplate>(
    "MockTestTemplate",
    mockTestTemplateSchema
);
