const DOCUMENT_TYPES = Object.freeze(['passport', 'national_id', 'drivers_license', 'proof_of_address']);
const DOCUMENT_STATUSES = Object.freeze({ PENDING: 'pending', APPROVED: 'approved', REJECTED: 'rejected', EXPIRED: 'expired' });

module.exports = { DOCUMENT_TYPES, DOCUMENT_STATUSES };
