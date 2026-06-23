const express = require('express');
const router = express.Router({ mergeParams: true });
const { uploadDocument, getDocuments, updateDocumentStatus } = require('../controllers/kycController');
const { protect, authorize } = require('../middlewares/authMiddleware');

router.post('/', protect, uploadDocument);
router.get('/', protect, getDocuments);
router.put('/:docId/status', protect, authorize('ADMIN'), updateDocumentStatus);

module.exports = router;
