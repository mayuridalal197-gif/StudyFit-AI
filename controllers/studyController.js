const db = require("../_config/db");
// Existing create function
const createStudyPlan = (req, res) => {
    const { subject, hours } = req.body;
    if (!subject || !hours) {
        return res.status(400).json({
            success: false,
            message: "Subject and study hours are required."
        });
    }
    res.json({
        success: true,
        message: "Study plan created successfully!",
        data: {subject, hours}
    });
};

// Fetch saved plans
const getStudentPlans = (req, res) => {
    const studentId = req.params.studentId;
    const sql = `
        SELECT
            plan_id,
            student_id,
            subjects,
            daily_hours,
            exam_date,
            ai_plan,
            created_at
        FROM study_plans
        WHERE student_id = ?
        ORDER BY plan_id DESC
    `;
    db.query(sql, [studentId], (err, results) => {
        if (err) {
            console.error("❌ Database error:", err);
            return res.status(500).json({
                success: false,
                message: "Could not fetch study plans."
            });
        }
       const plans = results.map(plan => {
    let parsedPlan = null;
    try {
        parsedPlan = JSON.parse(plan.ai_plan);
    } catch (error) {
        console.log("⚠️ Could not parse AI plan:", error);
    }
    return {
        ...plan,
        ai_plan: parsedPlan
    };
});

res.json({success: true,plans: plans});
    });
};
const deleteStudyPlan = (req, res) => {
    const planId = req.params.planId;
    const sql = `
        DELETE FROM study_plans
        WHERE plan_id = ?
    `;
    db.query(sql, [planId], (err, result) => {
        if (err) {
            console.error(
                "❌ Delete study plan error:",
                err
            );
            return res.status(500).json({
                success: false,
                message: "Could not delete study plan."
            });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Study plan not found."
            });
        }
        res.json({
            success: true,
            message: "Study plan deleted successfully!"
        });
    });
};
module.exports = {
    createStudyPlan,
    getStudentPlans,
    deleteStudyPlan
};