import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUserDocument extends Document {
  email: string;
  password: string;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUserDocument>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods.comparePassword = function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password);
};

export const User = mongoose.model<IUserDocument>("User", UserSchema);