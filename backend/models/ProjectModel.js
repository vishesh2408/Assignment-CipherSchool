import mongoose from 'mongoose';

// Schema for storing the entire project state
const ProjectSchema = new mongoose.Schema({
    // Unique identifier for the project instance
    projectId: {
        type: String,
        required: true,
        unique: true,
    },
    // ID of the user who owns the project (simulates Firebase auth user ID)
    userId: {
        type: String,
        required: true,
        // In a real setup, this would be indexed for fast lookups by user
    },
    // Stores the complete, stringified file tree and code content
    files: {
        type: String,
        required: true,
    },
    // Stores the project configuration (dependencies, Sandpack options)
    config: {
        type: String,
        default: '{}',
    },
    // Timestamp for last save
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    // We can simulate S3 asset storage by defining a link here (for future expansion)
    s3AssetsLink: {
        type: String,
        required: false,
    }
});

ProjectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

export default mongoose.model('Project', ProjectSchema);