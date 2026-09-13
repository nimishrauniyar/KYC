const { DOCUMENT_STATUSES } = require('../constants/document');

const transitions = Object.freeze({
  [DOCUMENT_STATUSES.PENDING]: [DOCUMENT_STATUSES.APPROVED, DOCUMENT_STATUSES.REJECTED],
  [DOCUMENT_STATUSES.APPROVED]: [DOCUMENT_STATUSES.EXPIRED],
  [DOCUMENT_STATUSES.REJECTED]: [],
  [DOCUMENT_STATUSES.EXPIRED]: [],
});

function assertValidTransition(fromStatus, toStatus) {
  if (!transitions[fromStatus]?.includes(toStatus)) {
    throw new Error(`Invalid document status transition: ${fromStatus} -> ${toStatus}`);
  }
}

module.exports = { transitions, assertValidTransition };
