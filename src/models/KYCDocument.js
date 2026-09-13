const mongoose = require('mongoose');

const kycDocumentSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    documentType: { type: String, enum: ['passport', 'national_id', 'drivers_license', 'proof_of_address'], required: true },
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    mimeType: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'expired'], default: 'pending', index: true },
    expiryDate: { type: Date },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

module.exports = mongoose.model('KYCDocument', kycDocumentSchema);
