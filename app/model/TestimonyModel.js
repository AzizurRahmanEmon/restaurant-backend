import mongoose from 'mongoose';

const TestimonySchema = new mongoose.Schema({
    testimonial: { type: String, required: true },
    imgSrc: { type: String, required: true },
    name: { type: String, required: true },
    label: { type: String, required: true },
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('testimonies', TestimonySchema);