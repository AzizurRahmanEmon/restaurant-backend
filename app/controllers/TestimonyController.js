import TestimonyModel from '../model/TestimonyModel.js';

// Create a new Testimony
export const createTestimony = async (req, res) => {
    try {
        const newTestimony = new TestimonyModel(req.body);
        await newTestimony.save();
        res.status(201).json({ success: true, message: "Testimony created successfully", data: newTestimony });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Testimonies
export const allTestimonyList = async (req, res) => {
    try {
        const testimonies = await TestimonyModel.find();
        res.status(200).json({ success: true, data: testimonies });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Testimony by ID
export const updateSingleTestimony = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedTestimony = await TestimonyModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedTestimony) {
            return res.status(404).json({ success: false, message: "Testimony not found" });
        }
        res.status(200).json({ success: true, message: "Testimony updated successfully", data: updatedTestimony });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Testimony by ID
export const deleteSingleTestimony = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTestimony = await TestimonyModel.findByIdAndDelete(id);
        if (!deletedTestimony) {
            return res.status(404).json({ success: false, message: "Testimony not found" });
        }
        res.status(200).json({ success: true, message: "Testimony deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};