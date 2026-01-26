import mongoose from 'mongoose';

const PortfolioSchema = new mongoose.Schema({
    category: { type: String, required: true },
    imgSrc: { type: String, required: true },
    mainSrc: { type: String, required: true },
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('portfolios', PortfolioSchema);