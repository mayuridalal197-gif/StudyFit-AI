const db = require("../_config/db");
const { generateAIPlan } = require("../_services/aiService");

const generateStudyPlan = async (req, res) => {
    try {

        console.log("🚀 AI Controller called");
        const { studentId, subjects, hours, examDate } = req.body;
        console.log("Student data:", {studentId, subjects, hours, examDate});

        if (!studentId || !subjects || !hours || !examDate) {
            return res.status(400).json({
                success: false,
                message: "Student ID, subjects, hours and exam date are required."
            });
        }
        // Generate AI plan
        console.log("🤖 Calling Gemini AI...");
        const aiResult = await generateAIPlan({subjects, hours, examDate});

        console.log("✅ Gemini response received");

        // Save AI plan in MySQL
        const sql = `
            INSERT INTO study_plans
            (student_id, subjects, daily_hours, exam_date, ai_plan)
            VALUES (?, ?, ?, ?, ?)
        `;

    db.query(
    sql,
    [
        studentId,
        subjects,
        hours,
        examDate,
        JSON.stringify(aiResult.aiResponse)
    ],
            (err, result) => {
                if (err) {
                    console.error("❌ DATABASE ERROR:", err);
                    return res.status(500).json({
                        success: false,
                        message: "Study plan could not be saved."
                    });
                }
                console.log("✅ Study plan saved in MySQL");
                console.log("Plan ID:", result.insertId);
                res.json({
                    success: true,
                    message: "AI study plan generated and saved!",
                    planId: result.insertId,
                    data: aiResult
                });
            }
        );
    }
    catch (error) {
        console.error("🔥 GEMINI ERROR:", error);
        console.error("🔥 ERROR MESSAGE:", error.message);
        return res.status(500).json({
            success: false,
            message: error.message || "AI generation failed."
        });
    }
};

module.exports = {
    generateStudyPlan
};