import mongoose, { Schema, Document } from "mongoose";

export interface IAdmin extends Document {
  email: string;
  password: string;
}

const AdminSchema = new Schema<IAdmin>({
  email: { type: String, unique: true },
  password: String
});

export default mongoose.model<IAdmin>("Admin", AdminSchema);
