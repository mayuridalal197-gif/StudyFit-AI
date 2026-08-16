const express = require("express");

const router = express.Router();

const { generateStudyPlan } = require("../controllers/aiController");

// router.post("/study-plan", generateStudyPlan);

router.post("/study-plan", (req, res, next) => {

    console.log("🔥 AI ROUTE HIT");

    next();

}, generateStudyPlan);

module.exports = router;