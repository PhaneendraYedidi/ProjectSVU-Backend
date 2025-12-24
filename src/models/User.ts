import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;

  bookmarks: mongoose.Types.ObjectId[];

  subscription: "free" | "premium";
  subscriptionStart?: Date;
  subscriptionEnd?: Date;

  // Free usage gating
  dailyFreeFetchDate?: Date;
  dailyFreeFetchCount: number;

  isActive: boolean;

  referralCode: string;
  referredBy?: mongoose.Types.ObjectId;
  referralEarnings: number;
  referralCount: number;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },

    phone: {
      type: String,
      unique: true,
      sparse: true
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      index: true
    },

    password: { type: String, required: true },

    bookmarks: [
      { type: Schema.Types.ObjectId, ref: "Question" }
    ],

    subscription: {
      type: String,
      enum: ["free", "premium"],
      default: "free",
      index: true
    },

    subscriptionStart: Date,
    subscriptionEnd: Date,

    dailyFreeFetchDate: Date,
    dailyFreeFetchCount: {
      type: Number,
      default: 0
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true
    },

    referralCode: {
      type: String,
      unique: true,
      required: true,
      index: true
    },

    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    referralEarnings: {
      type: Number,
      default: 0
    },

    referralCount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
