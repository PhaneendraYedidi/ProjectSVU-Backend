import mongoose, { Schema, Document } from "mongoose";

export interface IChallenge extends Document {
    creator: mongoose.Schema.Types.ObjectId;
    joiner?: mongoose.Schema.Types.ObjectId;
    code: string;
    questions: mongoose.Schema.Types.ObjectId[];
    status: "WAITING" | "ACTIVE" | "COMPLETED";
    scores?: {
        creator: number;
        joiner: number;
    };
    createdAt: Date;
}

const ChallengeSchema = new Schema<IChallenge>(
    {
        creator: { type: Schema.Types.ObjectId, ref: "User", required: true },
        joiner: { type: Schema.Types.ObjectId, ref: "User" },
        code: { type: String, required: true, unique: true },
        questions: [{ type: Schema.Types.ObjectId, ref: "Question" }],
        status: {
            type: String,
            enum: ["WAITING", "ACTIVE", "COMPLETED"],
            default: "WAITING"
        },
        scores: {
            creator: { type: Number, default: 0 },
            joiner: { type: Number, default: 0 }
        }
    },
    { timestamps: true }
);

export default mongoose.model<IChallenge>("Challenge", ChallengeSchema);
