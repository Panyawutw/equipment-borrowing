// --- Imports & Express Router ---
const router = require("express").Router();
const c = require("../controllers/borrowing.controller");

// --- Borrowing Endpoint Routes ---
router.get("/", c.list);
router.get("/new", c.newForm);
router.post("/", c.create);
router.post("/:id/return", c.returnItem);

// --- Export Router ---
module.exports = router;
