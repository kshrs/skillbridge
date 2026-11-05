const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'skillbridge-academic-jwt-secret-token-key-2026';

const verifyToken = (req) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
};

const protect = (req, res, next) => {
  const decoded = verifyToken(req);
  if (!decoded) {
    return res.status(401).json({ success: false, message: 'Unauthorized. Invalid or missing bearer token.' });
  }
  req.user = decoded;
  next();
};

const staffOnly = (req, res, next) => {
  if (!req.user || !['admin', 'faculty', 'mentor'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden. Staff/Faculty privileges required.' });
  }
  next();
};

module.exports = {
  JWT_SECRET,
  verifyToken,
  protect,
  staffOnly
};
