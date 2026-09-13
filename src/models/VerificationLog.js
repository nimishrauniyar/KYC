const mongoose = require('mongoose');

const verificationLogSchema = new mongoose.Schema(
  {
    document: { type: mongoose.Schema.Types.ObjectId, ref: 'KYCDocument', required: true, index: true },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true, trim: true },
    fromStatus: { type: String },
    toStatus: { type: String },
    note: { type: String, trim: true, maxlength: 500 },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

module.exports = mongoose.model('VerificationLog', verificationLogSchema);
