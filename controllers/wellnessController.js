const db = require("../_config/db");

const {
    generateWellnessRecommendation
} = require("../_services/aiService");

// Save wellness data
const saveWellness = async (req, res) => {
    const {studentId, waterGlasses, eyeRestBreaks, movementBreaks,sleepHours, mood} = req.body;
    if (!studentId) {
        return res.status(400).json({
            success: false,
            message: "Student ID is required."
        });
    }
    const aiRecommendation =
    await generateWellnessRecommendation({
        waterGlasses:
            waterGlasses || 0,
        eyeRestBreaks:
            eyeRestBreaks || 0,
        movementBreaks:
            movementBreaks || 0,
        sleepHours:
            sleepHours || 0,
        mood:
            mood || "Not recorded"
    });
    const sql = `
        INSERT INTO wellness
        (
            student_id,
            water_glasses,
            eye_breaks,
            movement_breaks,
            sleep_hours,
            mood
        )
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            studentId,
            waterGlasses || 0,
            eyeRestBreaks || 0,
            movementBreaks || 0,
            sleepHours || 0,
            mood || ""
        ],
        (err, result) => {
            if (err) {
                console.error(
                    "❌ Wellness database error:",
                    err
                );
                return res.status(500).json({
                    success: false,
                    message: "Wellness data could not be saved."
                });
            }
            res.json({
                success: true,
                message: "Wellness data saved successfully!",
                wellnessId: result.insertId,
                recommendation: aiRecommendation

            });
        }
    );
};
// Get wellness data
const getWellness = (req, res) => {
    const studentId = req.params.studentId;
    const sql = `
        SELECT *
        FROM wellness
        WHERE student_id = ?
        ORDER BY created_at DESC
    `;
    db.query(
        sql,
        [studentId],
        (err, results) => {
            if (err) {
                console.error(
                    "❌ Wellness fetch error:",
                    err
                );
                return res.status(500).json({
                    success: false,
                    message: "Wellness data could not be fetched."
                });

            }
            res.json({
                success: true,
                wellness: results

            });
        }
    );
};
module.exports = {
    saveWellness,
    getWellness
};