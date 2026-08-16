const express = require("express");

const router = express.Router();

const {
    createStudyPlan,
    getStudentPlans,
    deleteStudyPlan
} = require("../controllers/studyController");

router.post("/create", createStudyPlan);

router.get("/student/:studentId", getStudentPlans);

router.delete("/:planId", deleteStudyPlan);

module.exports = router;