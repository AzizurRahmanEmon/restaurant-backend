import mongoose from 'mongoose';

const BlogSchema = new mongoose.Schema({
    category: { type: String, required: true },
    date: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    imgSrc: { type: String, required: true },
    tags: { type: [String], required: true }
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('blogs_2', BlogSchema);