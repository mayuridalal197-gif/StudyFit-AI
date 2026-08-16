const db = require("../_config/db");
const {
    generateWellnessRecommendation
} = require("../_services/aiService");
// =============================
// SIGNUP
// =============================
const signup = (req, res) => {

    const {name, email, password} = req.body;
    // Check required fields
    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: "Name, email and password are required."
        });
    }
    // Check if email already exists
    const checkSql = `
        SELECT student_id
        FROM students
        WHERE email = ?
    `;
    db.query(
        checkSql,
        [email],
        (err, results) => {
            if (err) {
                console.error(
                    "❌ Signup database error:",
                    err
                );
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }
            // Email already registered
            if (results.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already registered."
                });
            }
            // Insert student
            const insertSql = `
                INSERT INTO students
                (name, email, password)
                VALUES (?, ?, ?)
            `;
            db.query(
                insertSql,
                [
                    name,
                    email,
                    password
                ],
                (err, result) => {
                    if (err) {
                        console.error(
                            "❌ Student signup error:",
                            err
                        );
                        return res.status(500).json({
                            success: false,
                            message: "Student could not be registered."
                        });
                    }
                    res.json({
                        success: true,
                        message:"Account created successfully!",
                        studentId:
                            result.insertId
                    });
                }
            );
        }
    );
};
// =============================
// LOGIN
// =============================
const login = (req, res) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message:"Email and password are required."
        });
    }
    const sql = `
        SELECT
            student_id,
            name,
            email
        FROM students
        WHERE email = ?
        AND password = ?
    `;
    db.query(
        sql,
        [
            email,
            password
        ],
        (err, results) => {
            if (err) {
                console.error(
                    "❌ Login database error:",
                    err
                );
                return res.status(500).json({
                    success: false,
                    message: "Database error."
                });
            }
            // Invalid login
            if (results.length === 0) {
                return res.status(401).json({
                    success: false,
                    message:"Invalid email or password."
                });
            }
            const student = results[0];
            res.json({
                success: true,
                message:"Login successful!",
                student: student
            });
        }
    );
};
module.exports = {
    signup,
    login
};