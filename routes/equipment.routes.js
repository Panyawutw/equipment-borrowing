// --- Imports & Configurations ---
const router = require('express').Router();
const c = require('../controllers/equipment.controller');
const upload = require('../middleware/upload');

// --- Equipment Routes ---
// List & Views
router.get('/', c.list);
router.get('/new', c.newForm);
router.post('/', upload.single('image'), c.create);
router.get('/:id/edit', c.editForm);

// Actions (Create, Update, Delete)
router.post('/:id/edit', upload.single('image'), c.update);
router.post('/:id/delete', c.remove);
router.get('/:id', c.detail);

// --- Export Module ---
module.exports = router;