import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
    timespan: { type: String, required: true },
    position: { type: String, required: true },
    company: { type: String, required: true },
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('experience', ExperienceSchema);