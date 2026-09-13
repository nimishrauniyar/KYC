const router = require('express').Router();
const { authenticate, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants/roles');
const { auditLogs, stats, createUser, updateUserRole } = require('../controllers/adminController');

router.use(authenticate, authorize(ROLES.ADMIN));
router.get('/audit-logs', auditLogs);
router.get('/stats', stats);
router.post('/users', createUser);
router.patch('/users/role', updateUserRole);

module.exports = router;

