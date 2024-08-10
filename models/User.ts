import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface UserDocument extends Document {
  username: string;
  name: string;
  email: string;
  password: string;
  resetOtp?: string;
  resetOtpExpires?: any;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const userSchema: Schema<UserDocument> = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre<UserDocument>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.matchPassword = async function (
  enteredPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model
const User: Model<UserDocument> = mongoose.model<UserDocument>(
  "User",
  userSchema
);

export default User;
