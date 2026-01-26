import mongoose from 'mongoose';

const FaqSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('faq', FaqSchema);