const express = require("express");

const router = express.Router();

const {
    saveWellness,
    getWellness
} = require("../controllers/wellnessController");

// Save wellness data
router.post("/", saveWellness);

// Get wellness data
router.get("/student/:studentId", getWellness);

module.exports = router;