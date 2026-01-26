import mongoose from 'mongoose';

const PricingSchema = new mongoose.Schema({
    iconSrc: { type: String, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    features: { type: [String], required: true },
    disabledFeatures: { type: [String]},
},{
    timestamps: true, versionKey: false
})

export default mongoose.model('pricing', PricingSchema);