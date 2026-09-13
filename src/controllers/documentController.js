const fs = require('fs/promises');
const KYCDocument = require('../models/KYCDocument');
const VerificationLog = require('../models/VerificationLog');
const { DOCUMENT_TYPES, DOCUMENT_STATUSES } = require('../constants/document');
const { hasValidFileSignature } = require('../utils/fileValidation');
const { assertValidTransition } = require('../services/documentStateMachine');
const { sendStatusChangeEmail } = require('../services/emailService');

async function uploadDocument(req, res, next) {
  try {
    const { documentType, expiryDate } = req.body;
    if (!DOCUMENT_TYPES.includes(documentType)) return res.status(400).json({ message: 'A valid documentType is required.' });
    if (!(await hasValidFileSignature(req.file))) {
      await fs.unlink(req.file.path);
      return res.status(400).json({ message: 'File contents do not match the claimed document type.' });
    }
    const document = await KYCDocument.create({
      customer: req.user.id, documentType, fileName: req.file.originalname, filePath: req.file.path,
      mimeType: req.file.mimetype, expiryDate: expiryDate || undefined,
    });
    await VerificationLog.create({ document: document.id, actor: req.user.id, action: 'document_uploaded', toStatus: document.status });
    return res.status(201).json({ document });
  } catch (error) { return next(error); }
}

async function listMyDocuments(req, res, next) {
  try { return res.json({ documents: await KYCDocument.find({ customer: req.user.id }).sort({ createdAt: -1 }) }); } catch (error) { return next(error); }
}

async function reviewQueue(_req, res, next) {
  try { return res.json({ documents: await KYCDocument.find({ status: DOCUMENT_STATUSES.PENDING }).populate('customer', 'name email').sort({ createdAt: 1 }) }); } catch (error) { return next(error); }
}

async function reviewDocument(req, res, next) {
  try {
    const { status, rejectionReason } = req.body;
    if (![DOCUMENT_STATUSES.APPROVED, DOCUMENT_STATUSES.REJECTED].includes(status)) return res.status(400).json({ message: 'Review status must be approved or rejected.' });
    if (status === DOCUMENT_STATUSES.REJECTED && !rejectionReason?.trim()) return res.status(400).json({ message: 'A rejectionReason is required when rejecting a document.' });
    const document = await KYCDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found.' });
    assertValidTransition(document.status, status);
    const fromStatus = document.status;
    document.status = status;
    document.reviewedBy = req.user.id;
    document.reviewedAt = new Date();
    document.rejectionReason = status === DOCUMENT_STATUSES.REJECTED ? rejectionReason.trim() : undefined;
    await document.save();
    await VerificationLog.create({ document: document.id, actor: req.user.id, action: 'document_reviewed', fromStatus, toStatus: status, note: document.rejectionReason });
    const customer = await document.populate('customer', 'name email');
    await sendStatusChangeEmail(customer.customer, customer);
    return res.json({ document });
  } catch (error) {
    if (error.message.startsWith('Invalid document status transition:')) return res.status(409).json({ message: error.message });
    return next(error);
  }
}

const { getDocumentFile } = require('../services/storageService');
const { ROLES } = require('../constants/roles');

async function viewDocumentFile(req, res, next) {
  try {
    const document = await KYCDocument.findById(req.params.id);
    if (!document) return res.status(404).json({ message: 'Document not found.' });

    const isOwner = document.customer.toString() === req.user.id;
    const isStaff = [ROLES.VERIFIER, ROLES.ADMIN].includes(req.user.role);
    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: 'Access denied.' });
    }

    const file = await getDocumentFile(document);
    if (file.type === 'url') {
      return res.redirect(file.url);
    }

    return res.sendFile(file.absolutePath);
  } catch (error) {
    return next(error);
  }
}

module.exports = { uploadDocument, listMyDocuments, reviewQueue, reviewDocument, viewDocumentFile };

