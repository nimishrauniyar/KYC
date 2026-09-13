const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { ROLES, ROLE_VALUES } = require('../constants/roles');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: /^\S+@\S+\.\S+$/ },
    password: { type: String, required: true, select: false, minlength: 8 },
    role: { type: String, enum: ROLE_VALUES, default: ROLES.CUSTOMER },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: { transform: (_doc, ret) => { delete ret.password; delete ret.__v; return ret; } } },
);

userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
