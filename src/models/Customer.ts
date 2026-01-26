import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  password?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  orderHistory: mongoose.Types.ObjectId[];
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword?(candidatePassword: string): Promise<boolean>;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      match: [/^\+?\d{10,15}$/, "Please provide a valid phone number"],
    },
    password: {
      type: String,
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    zipCode: {
      type: String,
      trim: true,
    },
    orderHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Order",
      },
    ],
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving (only if password is provided)
CustomerSchema.pre("save", async function () {
  if (!this.password || !this.isModified("password")) {
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
CustomerSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    if (!this.password) return false;
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<ICustomer>("Customer", CustomerSchema);
