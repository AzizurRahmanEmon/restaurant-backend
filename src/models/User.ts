import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Interface for API Key
interface IApiKey {
  key: string;
  name: string;
  isActive: boolean;
  createdAt: Date;
  lastUsedAt?: Date;
}

// Interface for User
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "admin" | "staff";
  apiKeys: IApiKey[];
  resetPasswordToken?: string;
  resetPasswordExpire?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// API Key Schema
const ApiKeySchema = new Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
  },
});

// User Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?\d{10,15}$/, "Please provide a valid phone number"],
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "admin",
    },
    apiKeys: [ApiKeySchema],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function () {
  // Only hash if password is modified
  if (!this.isModified("password")) {
    return;
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    console.log(error);
  }
});

// Method to compare passwords
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUser>("User", UserSchema);
