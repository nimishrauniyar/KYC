const cron = require('node-cron');
const KYCDocument = require('../models/KYCDocument');
const VerificationLog = require('../models/VerificationLog');
const { DOCUMENT_STATUSES } = require('../constants/document');
const { sendStatusChangeEmail } = require('../services/emailService');

async function expireDocuments() {
  const now = new Date();
  const documents = await KYCDocument.find({ status: DOCUMENT_STATUSES.APPROVED, expiryDate: { $lt: now } }).populate('customer', 'name email');
  await Promise.all(documents.map(async (document) => {
    document.status = DOCUMENT_STATUSES.EXPIRED;
    await document.save();
    await VerificationLog.create({ document: document.id, actor: document.customer._id, action: 'document_expired', fromStatus: DOCUMENT_STATUSES.APPROVED, toStatus: DOCUMENT_STATUSES.EXPIRED });
    await sendStatusChangeEmail(document.customer, document);
  }));
  return documents.length;
}

function scheduleExpiryJob() {
  return cron.schedule('0 1 * * *', () => expireDocuments().catch((error) => console.error('Document expiry job failed:', error)));
}

module.exports = { expireDocuments, scheduleExpiryJob };
