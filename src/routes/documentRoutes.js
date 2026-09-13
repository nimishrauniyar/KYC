const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const { uploadSingleDocument } = require('../middleware/upload');
const { uploadDocument, listMyDocuments, reviewQueue, reviewDocument, viewDocumentFile } = require('../controllers/documentController');

router.use(authenticate);
router.post('/', authorize(ROLES.CUSTOMER), uploadSingleDocument, uploadDocument);
router.get('/mine', authorize(ROLES.CUSTOMER), listMyDocuments);
router.get('/review-queue', authorize(ROLES.VERIFIER, ROLES.ADMIN), reviewQueue);
router.get('/:id/file', viewDocumentFile);
router.patch('/:id/review', authorize(ROLES.VERIFIER, ROLES.ADMIN), reviewDocument);

module.exports = router;

