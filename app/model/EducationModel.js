import mongoose from 'mongoose';

const EducationSchema = new mongoose.Schema({
    timespan: { type: String, required: true },
    degree: { type: String, required: true },
    school: { type: String, required: true },
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('education', EducationSchema);