import ExperienceModel from '../model/ExperienceModel.js';

// Create a new Experience entry
export const createExperience = async (req, res) => {
    try {
        const newExperience = new ExperienceModel(req.body);
        await newExperience.save();
        res.status(201).json({ success: true, message: "Experience entry created successfully", data: newExperience });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Experience entries
export const allExperienceList = async (req, res) => {
    try {
        const experiences = await ExperienceModel.find();
        res.status(200).json({ success: true, data: experiences });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Experience entry by ID
export const updateSingleExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedExperience = await ExperienceModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedExperience) {
            return res.status(404).json({ success: false, message: "Experience entry not found" });
        }
        res.status(200).json({ success: true, message: "Experience entry updated successfully", data: updatedExperience });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Experience entry by ID
export const deleteSingleExperience = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedExperience = await ExperienceModel.findByIdAndDelete(id);
        if (!deletedExperience) {
            return res.status(404).json({ success: false, message: "Experience entry not found" });
        }
        res.status(200).json({ success: true, message: "Experience entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};