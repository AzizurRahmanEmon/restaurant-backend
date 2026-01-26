import PricingModel from '../model/PricingModel.js';

// Create a new Pricing plan
export const createPricing = async (req, res) => {
    try {
        const newPricing = new PricingModel(req.body);
        await newPricing.save();
        res.status(201).json({ success: true, message: "Pricing plan created successfully", data: newPricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Pricing plans
export const allPricingList = async (req, res) => {
    try {
        const pricings = await PricingModel.find();
        res.status(200).json({ success: true, data: pricings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Pricing plan by ID
export const updateSinglePricing = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPricing = await PricingModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPricing) {
            return res.status(404).json({ success: false, message: "Pricing plan not found" });
        }
        res.status(200).json({ success: true, message: "Pricing plan updated successfully", data: updatedPricing });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Pricing plan by ID
export const deleteSinglePricing = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPricing = await PricingModel.findByIdAndDelete(id);
        if (!deletedPricing) {
            return res.status(404).json({ success: false, message: "Pricing plan not found" });
        }
        res.status(200).json({ success: true, message: "Pricing plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};