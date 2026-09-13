const User = require('../models/User');
const { ROLES } = require('../constants/roles');
const { signToken } = require('../utils/token');

function authResponse(user, statusCode, res) {
  return res.status(statusCode).json({ token: signToken(user), user });
}

async function signup(req, res, next) {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'name, email, and password are required.' });
    const existing = await User.exists({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ message: 'An account with this email already exists.' });
    const user = await User.create({ name, email, password, role: ROLES.CUSTOMER });
    return authResponse(user, 201, res);
  } catch (error) { return next(error); }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'email and password are required.' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !user.isActive || !(await user.comparePassword(password))) return res.status(401).json({ message: 'Invalid email or password.' });
    return authResponse(user, 200, res);
  } catch (error) { return next(error); }
}

function me(req, res) { return res.json({ user: req.user }); }

module.exports = { signup, login, me };
