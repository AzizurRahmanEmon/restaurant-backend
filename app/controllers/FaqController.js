import FaqModel from '../model/FaqModel.js';

// Create a new FAQ
export const createFaq = async (req, res) => {
    try {
        const newFaq = new FaqModel(req.body);
        await newFaq.save();
        res.status(201).json({ success: true, message: "FAQ created successfully", data: newFaq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all FAQs
export const allFaqList = async (req, res) => {
    try {
        const faqs = await FaqModel.find();
        res.status(200).json({ success: true, data: faqs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single FAQ by ID
export const updateSingleFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedFaq = await FaqModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedFaq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }
        res.status(200).json({ success: true, message: "FAQ updated successfully", data: updatedFaq });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single FAQ by ID
export const deleteSingleFaq = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFaq = await FaqModel.findByIdAndDelete(id);
        if (!deletedFaq) {
            return res.status(404).json({ success: false, message: "FAQ not found" });
        }
        res.status(200).json({ success: true, message: "FAQ deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};