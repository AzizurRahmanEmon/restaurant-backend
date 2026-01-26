import mongoose from "mongoose";

const SkillSchema = new mongoose.Schema(
  {
    img: { type: String, required: true },
    title: { type: String, required: true },
    mastery: { type: Number, required: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("skills", SkillSchema);
