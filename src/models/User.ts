import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  password: string;
  bookmarks: mongoose.Types.ObjectId[];
  subscription: string;
}

const UserSchema = new Schema<IUser>(
  {
    name: String,
    phone: { type: String, unique: true },
    email: { type: String, unique: true },
    password: { type: String, required: true },
    bookmarks: [{ type: Schema.Types.ObjectId, ref: "Question" }],
    subscription: { type: String, default: "free" }
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", UserSchema);
