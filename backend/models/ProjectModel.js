import mongoose from 'mongoose';


const ProjectSchema = new mongoose.Schema({
   
    projectId: {
        type: String,
        required: true,
        unique: true,
    },
    
    userId: {
        type: String,
        required: true,
        
    },
   
    files: {
        type: String,
        required: true,
    },
    
    config: {
        type: String,
        default: '{}',
    },
   
    updatedAt: {
        type: Date,
        default: Date.now,
    },
   
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