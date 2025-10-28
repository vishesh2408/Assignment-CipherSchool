import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './config/db.js';
import projectRoutes from './routes/projectRoutes.js';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGODB_URI;

// --- Middleware ---
// Enable CORS for frontend communication
// Allow multiple known frontend origins and make it easy to configure via .env
const allowedOrigins = [process.env.FRONTEND_ORIGIN || 'http://localhost:5173', 'http://localhost:5174'];
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like curl, Postman)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }
        // For unknown origins, block the request
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
}));
// Parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Routes ---
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CipherSchool API' });
});

// Project API routes
app.use('/api/projects', projectRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// --- Database Connection and Server Start ---
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});