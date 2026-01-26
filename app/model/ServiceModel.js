import mongoose from 'mongoose';

const ServiceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: String, required: true },
    imgSrc: { type: String, required: true },
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('service_2', ServiceSchema);