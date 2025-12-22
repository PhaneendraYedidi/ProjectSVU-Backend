import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  bookmarks: mongoose.Types.ObjectId[];
  subscription: "free" | "premium";

  // Free practice gating
  dailyFreeFetchDate?: Date;
  dailyFreeFetchCount?: number;

  // Optional future use
  isActive: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    subscription: {
      type: String,
      enum: ["free", "premium"],
      default: "free"
    },

    dailyFreeFetchDate: Date,
    dailyFreeFetchCount: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
