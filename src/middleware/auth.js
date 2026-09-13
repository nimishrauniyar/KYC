const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { jwtSecret } = require('../config/env');

async function authenticate(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme !== 'Bearer' || !token) return res.status(401).json({ message: 'Authentication required.' });

  try {
    const payload = jwt.verify(token, jwtSecret);
    const user = await User.findById(payload.sub);
    if (!user || !user.isActive) return res.status(401).json({ message: 'Account is unavailable.' });
    req.user = user;
    return next();
  } catch (_error) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'You are not authorized for this resource.' });
    return next();
  };
}

module.exports = { authenticate, authorize };
