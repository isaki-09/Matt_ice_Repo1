import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { sendEmail } from '../Utils/sendEmail.js';

const router = express.Router();

// Helper to create JWT
function signToken(user) {
return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

// POST /api/auth/register-admin
router.post('/register-admin', async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });


const exists = await User.findOne({ email });
if (exists) return res.status(409).json({ message: 'Email already registered' });


const hash = await bcrypt.hash(password, 10);
const token = crypto.randomBytes(32).toString('hex');
const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24h


const user = await User.create({
name,
email,
password: hash,
role: 'admin',
emailVerificationToken: token,
emailVerificationExpires: expires,
});


const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;


await sendEmail({
to: email,
subject: 'Verify your admin account',
html: `<p>Hello ${name},</p>
<p>Please verify your admin account by clicking the link below (valid for 24 hours):</p>
<p><a href="${verifyUrl}">Verify Email</a></p>`
});


res.status(201).json({ message: 'Admin registered. Verification email sent.' });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});

// GET /api/auth/verify-email?token=...
router.get('/verify-email', async (req, res) => {
try {
const { token } = req.query;
if (!token) return res.status(400).json({ message: 'Token missing' });


const user = await User.findOne({
emailVerificationToken: token,
emailVerificationExpires: { $gt: new Date() },
});


if (!user) return res.status(400).json({ message: 'Invalid or expired token' });


user.verified = true;
user.emailVerificationToken = undefined;
user.emailVerificationExpires = undefined;
await user.save();


res.json({ message: 'Email verified successfully. You can now log in.' });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


// POST /api/auth/login
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;
const user = await User.findOne({ email });
if (!user) return res.status(401).json({ message: 'Invalid credentials' });


const match = await bcrypt.compare(password, user.password);
if (!match) return res.status(401).json({ message: 'Invalid credentials' });


if (!user.verified) return res.status(403).json({ message: 'Email not verified' });


if (user.role === 'client' && !user.approved) {
return res.status(403).json({ message: 'Account not approved by admin' });
}


const token = signToken(user);
res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


export default router;