require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 5000;

// Database
const db = require("./_config/db");

// Routes
const aiRoutes = require("./_routes_/aiRoutes");
const studyRoutes = require("./_routes_/studyRoutes");
const wellnessRoutes = require("./_routes_/wellnessRoutes");
const studentRoutes = require("./_routes_/studentRoutes");

// Middleware
app.use(express.json());

// Frontend
app.use(express.static(__dirname + "/frontend"));

// Home page
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/frontend/index.html");
});

// Planner page
app.get("/planner.html", (req, res) => {
    res.sendFile(__dirname + "/frontend/planner.html");
});

// Dashboard page
app.get("/dashboard.html", (req, res) => {
    res.sendFile(__dirname + "/frontend/dashboard.html");
});

// Student page
app.get("/student.html", (req, res) => {
    res.sendFile(__dirname + "/frontend/student.html");
});

// API Routes

app.post("/api/test", (req, res) => {
    console.log("🔥 TEST ROUTE HIT");

    res.json({
        success: true,
        message: "Backend is receiving POST requests!"
    });
});

app.use("/api/ai", aiRoutes);

app.use("/api/study", studyRoutes);

app.use("/api/wellness", wellnessRoutes);

app.use("/api/students", studentRoutes);


// Start Server
app.listen(PORT, () => {

    console.log(
        `StudyFit AI server running on http://localhost:${PORT}`
    );

});