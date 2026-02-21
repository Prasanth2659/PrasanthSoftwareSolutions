const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret123');
    req.headers['x-user-id']   = decoded.id || decoded._id || decoded.userId;
    req.headers['x-user-role'] = decoded.role;
    req.headers['x-user-name'] = decoded.name;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

module.exports = { verifyToken };
