import express from 'express';
import Project from '../models/ProjectModel.js';

const router = express.Router();

// Middleware to check for required headers (simulating authentication context)
const authMiddleware = (req, res, next) => {
    // In a real app, this would validate a JWT token and extract the real userId.
    // Here, we ensure projectId and userId are passed in the body.
    if (!req.body.userId) {
        return res.status(401).json({ message: 'Authentication context (userId) required.' });
    }
    next();
};

// @route   POST /api/projects/save
// @desc    Save or update a project
// @access  Public (Simulated Auth)
router.post('/save', authMiddleware, async (req, res) => {
    const { projectId, userId, files, config } = req.body;

    if (!projectId || !files) {
        return res.status(400).json({ message: 'Missing required fields: projectId, userId, files.' });
    }

    try {
        const updateFields = {
            userId,
            files: JSON.stringify(files), // Store complex object as string
            config: JSON.stringify(config), // Store config as string
            s3AssetsLink: `s3://${process.env.AWS_S3_BUCKET_NAME}/${userId}/${projectId}`, // Simulated link
        };

        const project = await Project.findOneAndUpdate(
            { projectId: projectId, userId: userId }, // Find by project ID and user ID
            { $set: updateFields },
            { upsert: true, new: true } // Create if not found, return updated document
        );

        res.status(200).json({
            message: 'Project saved successfully',
            project: { projectId: project.projectId, updatedAt: project.updatedAt }
        });
    } catch (err) {
        console.error('Error saving project:', err);
        res.status(500).json({ message: 'Server error while saving project.' });
    }
});

// @route   POST /api/projects/load
// @desc    Load a specific project
// @access  Public (Simulated Auth)
router.post('/load', authMiddleware, async (req, res) => {
    const { projectId, userId } = req.body;

    if (!projectId) {
        return res.status(400).json({ message: 'Missing required field: projectId.' });
    }

    try {
        const project = await Project.findOne({ projectId: projectId, userId: userId });

        if (!project) {
            return res.status(404).json({ message: 'Project not found.' });
        }

        res.status(200).json({
            projectId: project.projectId,
            files: JSON.parse(project.files), // Parse back to object for client
            config: JSON.parse(project.config), // Parse back to object for client
            updatedAt: project.updatedAt,
        });
    } catch (err) {
        console.error('Error loading project:', err);
        res.status(500).json({ message: 'Server error while loading project.' });
    }
});

// @route   POST /api/projects/list
// @desc    List all projects for a user
// @access  Public (Simulated Auth)
router.post('/list', authMiddleware, async (req, res) => {
    const { userId } = req.body;

    try {
        const projects = await Project.find({ userId: userId }, 'projectId updatedAt')
            .sort({ updatedAt: -1 }); // Sort by most recent

        res.status(200).json(projects.map(p => ({
            projectId: p.projectId,
            updatedAt: p.updatedAt,
        })));
    } catch (err) {
        console.error('Error listing projects:', err);
        res.status(500).json({ message: 'Server error while listing projects.' });
    }
});

// @route   POST /api/projects/delete
// @desc    Delete a specific project
// @access  Public (Simulated Auth)
router.post('/delete', authMiddleware, async (req, res) => {
    const { projectId, userId } = req.body;

    if (!projectId) {
        return res.status(400).json({ message: 'Missing required field: projectId.' });
    }

    try {
        const result = await Project.deleteOne({ projectId: projectId, userId: userId });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: 'Project not found or not owned by user.' });
        }

        res.status(200).json({ message: 'Project deleted successfully.' });
    } catch (err) {
        console.error('Error deleting project:', err);
        res.status(500).json({ message: 'Server error while deleting project.' });
    }
});

export default router;