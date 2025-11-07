import dotenv from 'dotenv';
dotenv.config();


import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';


import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';


const app = express();


// Middlewares
app.use(cors());
app.use(express.json());


// Health check
app.get('/', (req, res) => {
res.json({ status: 'ok', message: 'User Management API running' });
});


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);


// DB Connect & Server start
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;


if (!MONGO_URI) {
console.error('❌ MONGO_URI missing in .env');
process.exit(1);
}


mongoose
.connect(MONGO_URI, { dbName: undefined })
.then(() => {
console.log('✅ Connected to MongoDB Atlas');
app.listen(PORT, () => console.log(`✅ Server listening on port ${PORT}`));
})
.catch((err) => {
console.error('❌ MongoDB connection error:', err.message);
process.exit(1);
});