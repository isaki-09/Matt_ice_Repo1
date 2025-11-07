import jwt from 'jsonwebtoken';


export function authRequired(req, res, next) {
const auth = req.headers.authorization || '';
const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
if (!token) return res.status(401).json({ message: 'Missing token' });
try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = decoded; // { id, role }
next();
} catch (err) {
return res.status(401).json({ message: 'Invalid or expired token' });
}
}


export function requireAdmin(req, res, next) {
if (!req.user || req.user.role !== 'admin') {
return res.status(403).json({ message: 'Admin access required' });
}
next();
}