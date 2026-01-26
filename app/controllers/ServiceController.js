import ServiceModel from '../model/ServiceModel.js';

// Create a new Service
export const createService = async (req, res) => {
    try {
        const newService = new ServiceModel(req.body);
        await newService.save();
        res.status(201).json({ success: true, message: "Service created successfully", data: newService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Service
export const allServiceList = async (req, res) => {
    try {
        const services = await ServiceModel.find();
        res.status(200).json({ success: true, data: services });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Service by ID
export const updateSingleService = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedService = await ServiceModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, message: "Service updated successfully", data: updatedService });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Service by ID
export const deleteSingleService = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await ServiceModel.findByIdAndDelete(id);
        if (!deletedService) {
            return res.status(404).json({ success: false, message: "Service not found" });
        }
        res.status(200).json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
