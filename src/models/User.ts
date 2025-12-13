import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  phone: string;
  email: string;
  bookmarks: mongoose.Types.ObjectId[];
  subscription: string;
}

const UserSchema = new Schema<IUser>({
  name: String,
  phone: String,
  email: String,
  bookmarks: [{ type: Schema.Types.ObjectId, ref: "Question" }],
  subscription: { type: String, default: "free" }
});

export default mongoose.model<IUser>("User", UserSchema);
