import EducationModel from '../model/EducationModel.js';

// Create a new Education entry
export const createEducation = async (req, res) => {
    try {
        const newEducation = new EducationModel(req.body);
        await newEducation.save();
        res.status(201).json({ success: true, message: "Education entry created successfully", data: newEducation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Education entries
export const allEducationList = async (req, res) => {
    try {
        const educations = await EducationModel.find();
        res.status(200).json({ success: true, data: educations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Education entry by ID
export const updateSingleEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedEducation = await EducationModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedEducation) {
            return res.status(404).json({ success: false, message: "Education entry not found" });
        }
        res.status(200).json({ success: true, message: "Education entry updated successfully", data: updatedEducation });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Education entry by ID
export const deleteSingleEducation = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEducation = await EducationModel.findByIdAndDelete(id);
        if (!deletedEducation) {
            return res.status(404).json({ success: false, message: "Education entry not found" });
        }
        res.status(200).json({ success: true, message: "Education entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};