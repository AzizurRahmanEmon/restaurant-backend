import SkillModel from '../model/SkillModel.js';

// Create a new Skill
export const createSkill = async (req, res) => {
    try {
        const newSkill = new SkillModel(req.body);
        await newSkill.save();
        res.status(201).json({ success: true, message: "Skill created successfully", data: newSkill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Skills
export const allSkillList = async (req, res) => {
    try {
        const skills = await SkillModel.find();
        res.status(200).json({ success: true, data: skills });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Skill by ID
export const updateSingleSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedSkill = await SkillModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedSkill) {
            return res.status(404).json({ success: false, message: "Skill not found" });
        }
        res.status(200).json({ success: true, message: "Skill updated successfully", data: updatedSkill });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Skill by ID
export const deleteSingleSkill = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedSkill = await SkillModel.findByIdAndDelete(id);
        if (!deletedSkill) {
            return res.status(404).json({ success: false, message: "Skill not found" });
        }
        res.status(200).json({ success: true, message: "Skill deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};