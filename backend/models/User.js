import mongoose from 'mongoose';


const userSchema = new mongoose.Schema(
{
name: { type: String, required: true, trim: true },
email: { type: String, required: true, unique: true, lowercase: true, trim: true },
password: { type: String, required: true },
role: { type: String, enum: ['admin', 'client'], default: 'client' },
verified: { type: Boolean, default: false },
approved: { type: Boolean, default: false },


// Email verification
emailVerificationToken: { type: String },
emailVerificationExpires: { type: Date },
},
{ timestamps: true }
);


// Explicitly set collection name to your provided collection
export default mongoose.model('User', userSchema, 'mattice_webappdb');