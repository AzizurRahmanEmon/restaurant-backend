import PortfolioModel from '../model/PortfolioModel.js';

// Create a new Portfolio item
export const createPortfolio = async (req, res) => {
    try {
        const newPortfolio = new PortfolioModel(req.body);
        await newPortfolio.save();
        res.status(201).json({ success: true, message: "Portfolio item created successfully", data: newPortfolio });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all Portfolio items
export const allPortfolioList = async (req, res) => {
    try {
        const portfolios = await PortfolioModel.find();
        res.status(200).json({ success: true, data: portfolios });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single Portfolio item by ID
export const updateSinglePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedPortfolio = await PortfolioModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPortfolio) {
            return res.status(404).json({ success: false, message: "Portfolio item not found" });
        }
        res.status(200).json({ success: true, message: "Portfolio item updated successfully", data: updatedPortfolio });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single Portfolio item by ID
export const deleteSinglePortfolio = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedPortfolio = await PortfolioModel.findByIdAndDelete(id);
        if (!deletedPortfolio) {
            return res.status(404).json({ success: false, message: "Portfolio item not found" });
        }
        res.status(200).json({ success: true, message: "Portfolio item deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};