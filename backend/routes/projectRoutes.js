import express from 'express';
import Project from '../models/ProjectModel.js';

const router = express.Router();


const authMiddleware = (req, res, next) => {
    
    if (!req.body.userId) {
        return res.status(401).json({ message: 'Authentication context (userId) required.' });
    }
    next();
};


router.post('/save', authMiddleware, async (req, res) => {
    const { projectId, userId, files, config } = req.body;

    if (!projectId || !files) {
        return res.status(400).json({ message: 'Missing required fields: projectId, userId, files.' });
    }

    try {
        const updateFields = {
            userId,
            files: JSON.stringify(files), 
            config: JSON.stringify(config), 
            s3AssetsLink: `s3://${process.env.AWS_S3_BUCKET_NAME}/${userId}/${projectId}`,
        };

        const project = await Project.findOneAndUpdate(
            { projectId: projectId, userId: userId }, 
            { $set: updateFields },
            { upsert: true, new: true } 
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
            files: JSON.parse(project.files), 
            config: JSON.parse(project.config), 
            updatedAt: project.updatedAt,
        });
    } catch (err) {
        console.error('Error loading project:', err);
        res.status(500).json({ message: 'Server error while loading project.' });
    }
});


router.post('/list', authMiddleware, async (req, res) => {
    const { userId } = req.body;

    try {
        const projects = await Project.find({ userId: userId }, 'projectId updatedAt')
            .sort({ updatedAt: -1 }); 

        res.status(200).json(projects.map(p => ({
            projectId: p.projectId,
            updatedAt: p.updatedAt,
        })));
    } catch (err) {
        console.error('Error listing projects:', err);
        res.status(500).json({ message: 'Server error while listing projects.' });
    }
});


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