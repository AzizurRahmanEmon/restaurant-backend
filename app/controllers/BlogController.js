import BlogModel from '../model/BlogModel.js';

// Create a new blog
export const createBlog = async (req, res) => {
    try {
        const newBlog = new BlogModel(req.body);
        await newBlog.save();
        res.status(201).json({ success: true, message: "Blog created successfully", data: newBlog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all blogs
export const allBlogList = async (req, res) => {
    try {
        const blogs = await BlogModel.find();
        res.status(200).json({ success: true, data: blogs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a single blog by ID
export const updateSingleBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedBlog = await BlogModel.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        res.status(200).json({ success: true, message: "Blog updated successfully", data: updatedBlog });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete a single blog by ID
export const deleteSingleBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBlog = await BlogModel.findByIdAndDelete(id);
        if (!deletedBlog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        res.status(200).json({ success: true, message: "Blog deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
