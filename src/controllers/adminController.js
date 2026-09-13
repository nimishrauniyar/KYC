const KYCDocument = require('../models/KYCDocument');
const VerificationLog = require('../models/VerificationLog');

function pagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, Number.parseInt(query.limit, 10) || 20));
  return { page, limit, skip: (page - 1) * limit };
}

async function auditLogs(req, res, next) {
  try {
    const { page, limit, skip } = pagination(req.query);
    const [total, logs] = await Promise.all([
      VerificationLog.countDocuments(),
      VerificationLog.find().populate('document', 'documentType status').populate('actor', 'name email role').sort({ createdAt: -1 }).skip(skip).limit(limit),
    ]);
    return res.json({ data: logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
}

async function stats(_req, res, next) {
  try {
    const byStatus = await KYCDocument.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]);
    const total = byStatus.reduce((sum, entry) => sum + entry.count, 0);
    return res.json({ totalDocuments: total, byStatus: Object.fromEntries(byStatus.map((entry) => [entry._id, entry.count])) });
  } catch (error) { return next(error); }
}

const User = require('../models/User');
const { ROLES } = require('../constants/roles');

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required.' });
    }
    const assignedRole = role && Object.values(ROLES).includes(role) ? role : ROLES.VERIFIER;
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ message: 'User already exists with this email.' });

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
    });
    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

async function updateUserRole(req, res, next) {
  try {
    const { userId, role } = req.body;
    if (!userId || !role || !Object.values(ROLES).includes(role)) {
      return res.status(400).json({ message: 'Valid userId and role are required.' });
    }
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role;
    await user.save();
    return res.json({ user });
  } catch (error) {
    return next(error);
  }
}

module.exports = { auditLogs, stats, createUser, updateUserRole };

