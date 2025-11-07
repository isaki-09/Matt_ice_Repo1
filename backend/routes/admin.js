import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import User from '../models/User.js';
import { authRequired, requireAdmin } from '../middleware/authMiddleware.js';
import { sendEmail } from '../Utils/sendEmail.js';

const router = express.Router();
router.use(authRequired, requireAdmin);


// GET /api/admin/users (list clients)
router.get('/users', async (req, res) => {
const clients = await User.find({ role: 'client' }).select('-password');
res.json(clients);
});


// POST /api/admin/users (add client + send verification email)
router.post('/users', async (req, res) => {
try {
const { name, email, password } = req.body;
if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });


const exists = await User.findOne({ email });
if (exists) return res.status(409).json({ message: 'Email already registered' });


const hash = await bcrypt.hash(password, 10);
const token = crypto.randomBytes(32).toString('hex');
const expires = new Date(Date.now() + 1000 * 60 * 60 * 24);


const client = await User.create({
name,
email,
password: hash,
role: 'client',
approved: false,
emailVerificationToken: token,
emailVerificationExpires: expires,
});


const verifyUrl = `${req.protocol}://${req.get('host')}/api/auth/verify-email?token=${token}`;


await sendEmail({
to: email,
subject: 'Verify your client account',
html: `<p>Hello ${name},</p>
<p>Your account was created by an admin. Please verify your email:</p>
<p><a href="${verifyUrl}">Verify Email</a></p>`
});


res.status(201).json({ message: 'Client created. Verification email sent.', clientId: client._id });
} catch (err) {
console.error(err);
res.status(500).json({ message: 'Server error' });
}
});


// PATCH /api/admin/users/:id (update client)
router.patch('/users/:id', async (req, res) => {
const { id } = req.params;
const updates = { ...req.body };
delete updates.password; // prevent password change here
const user = await User.findByIdAndUpdate(id, updates, { new: true }).select('-password');
if (!user) return res.status(404).json({ message: 'User not found' });
res.json(user);
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
const { id } = req.params;
const user = await User.findByIdAndDelete(id);
if (!user) return res.status(404).json({ message: 'User not found' });
res.json({ message: 'User deleted' });
});


// POST /api/admin/users/:id/approve
router.post('/users/:id/approve', async (req, res) => {
const { id } = req.params;
const user = await User.findById(id);
if (!user) return res.status(404).json({ message: 'User not found' });
if (user.role !== 'client') return res.status(400).json({ message: 'Only clients can be approved' });


user.approved = true;
await user.save();


await sendEmail({
to: user.email,
subject: 'Your account has been approved',
html: `<p>Hello ${user.name},</p><p>Your account has been approved. You can now log in.</p>`,
});


res.json({ message: 'Client approved' });
});


// POST /api/admin/users/:id/unapprove
router.post('/users/:id/unapprove', async (req, res) => {
const { id } = req.params;
const user = await User.findById(id);
if (!user) return res.status(404).json({ message: 'User not found' });
if (user.role !== 'client') return res.status(400).json({ message: 'Only clients can be toggled' });


user.approved = false;
await user.save();
res.json({ message: 'Client unapproved' });
});


export default router;