document.addEventListener("DOMContentLoaded", () => {

    requestNotificationPermission();

    const form = document.getElementById("plannerForm");

    if (!form) {
        console.error("❌ Planner form not found");
        return;
    }

    // Calculate total subject hours when page loads
    updateTotalHours();

    form.addEventListener("submit", async (event) => {

        event.preventDefault();

        const studentId = localStorage.getItem("studentId");

        const examDate =
            document.getElementById("examDate").value;

        // Daily available study time
        const availableHours =
            parseFloat(document.getElementById("hours").value);

        // Get all subject rows
        const subjectRows =
            document.querySelectorAll(".subject-row");

        let subjects = [];
        let totalSubjectHours = 0;

        subjectRows.forEach((row) => {

            const subjectInput =
                row.querySelector(".subject-input");

            const hoursInput =
                row.querySelector(".subject-hours");

            const subject =
                subjectInput.value.trim();

            const subjectHours =
                parseFloat(hoursInput.value);

            if (subject && subjectHours > 0) {

                subjects.push({
                    name: subject,
                    hours: subjectHours
                });

                totalSubjectHours += subjectHours;
            }

        });

        // Login check
        if (!studentId) {
            alert("Please login first.");
            window.location.href = "/";
            return;
        }

        // Basic validation
        if (
            subjects.length === 0 ||
            !availableHours ||
            !examDate
        ) {
            alert("Please fill all fields.");
            return;
        }

        // Check that subject hours exactly match daily study hours
        if (totalSubjectHours !== availableHours) {

            alert(
                `⚠️ Subject study time is ${totalSubjectHours} hours, ` +
                `but Daily Study Hours is ${availableHours} hours.\n\n` +
                `Please make both values equal.`
            );

            return;
        }

        // Convert subjects into API-friendly text
        const subjectsText = subjects
            .map(subject =>
                `${subject.name} (${subject.hours} hours)`
            )
            .join(", ");

        console.log("🚀 Sending AI request...");

        console.log("Student ID:", studentId);

        console.log("Subjects:", subjects);

        console.log(
            "Total Subject Hours:",
            totalSubjectHours
        );

        console.log(
            "Available Hours:",
            availableHours
        );

        console.log("Exam Date:", examDate);

        const result =
            document.getElementById("result");

        result.innerHTML = `
            <div class="plan-card">
                <h2>🤖 Creating your AI study plan...</h2>
                <p>
                    StudyFit AI is organizing your
                    selected subjects and study time.
                </p>
            </div>
        `;

        try {

            const response =
                await fetch("/api/ai/study-plan", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        studentId: studentId,

                        subjects: subjectsText,

                        hours: availableHours,

                        examDate: examDate

                    })

                });

            console.log(
                "📡 Response status:",
                response.status
            );

            const data =
                await response.json();

            console.log(
                "📦 FULL AI RESPONSE:",
                data
            );

            if (!data.success) {

                result.innerHTML = `
                    <div class="error-box">
                        ❌ ${data.message}
                    </div>
                `;

                return;
            }

            /*
             * AI + MySQL successful
             */

            displayStudyPlan({

                subjects: subjectsText,

                subjectList: subjects,

                dailyHours: availableHours,

                totalSubjectHours:
                    totalSubjectHours,

                examDate: examDate,

                aiResponse:
                    data.data.aiResponse

            });

        } catch (error) {

            console.error(
                "❌ Planner error:",
                error
            );

            result.innerHTML = `
                <div class="error-box">
                    ❌ Unable to generate study plan.
                </div>
            `;
        }

    });

});

// =============================
// MULTIPLE SUBJECT MANAGEMENT
// =============================

function addSubject() {

    const container =
        document.getElementById("subjectsContainer");

    if (!container) {
        return;
    }

    const row =
        document.createElement("div");

    row.className = "subject-row";

    row.innerHTML = `

        <input
            type="text"
            class="subject-input"
            placeholder="Subject name"
            required
        >

        <input
            type="number"
            class="subject-hours"
            min="0.5"
            max="12"
            step="0.5"
            placeholder="Hours"
            required
        >

        <button
            type="button"
            class="remove-subject"
            onclick="removeSubject(this)">
            ✕
        </button>

    `;

    container.appendChild(row);

    updateTotalHours();
}


// =============================
// REMOVE SUBJECT
// =============================

function removeSubject(button) {

    const container =
        document.getElementById("subjectsContainer");

    const rows =
        container.querySelectorAll(".subject-row");

    // Don't allow deleting the last row
    if (rows.length <= 1) {

        alert(
            "At least one subject is required."
        );

        return;
    }

    button.parentElement.remove();

    updateTotalHours();
}


// =============================
// TOTAL HOURS CALCULATION
// =============================

function updateTotalHours() {

    const hourInputs =
        document.querySelectorAll(".subject-hours");

    let total = 0;

    hourInputs.forEach((input) => {

        const value =
            parseFloat(input.value);

        if (!isNaN(value)) {
            total += value;
        }

    });

    const display =
        document.getElementById(
            "totalHoursDisplay"
        );

    if (display) {

        display.innerHTML = `
            Total Study Time:
            <strong>${total} hours</strong>
        `;
    }

}
// =============================
// LIVE TOTAL UPDATE
// =============================
document.addEventListener(
    "input",
    (event) => {

        if (
            event.target.classList.contains(
                "subject-hours"
            )
        ) {

            updateTotalHours();

        }

    }
);

function displayStudyPlan(plan) {
    const result =
        document.getElementById("result");
    result.innerHTML = `
        <div class="plan-card">
            <!-- SUCCESS -->
            <div class="success-message">
                ✨ AI Study Plan Created!
            </div>
            <!-- SUMMARY -->
            <div class="plan-summary">
                <div class="summary-box">
                    <span>📚 Subjects</span>
                    <strong>
                        ${escapeHTML(plan.subjects)}
                    </strong>
                </div>
                <div class="summary-box">
                    <span>⏱️ Daily Study</span>
                    <strong>
                        ${escapeHTML(plan.totalSubjectHours)}
                        / ${escapeHTML(plan.dailyHours)} Hours
                    </strong>
                </div>
                <div class="summary-box">
                    <span>📅 Exam Date</span>
                    <strong>
                        ${formatDate(plan.examDate)}
                    </strong>
                </div>
            </div>
            <!-- STUDY SCHEDULE -->
            <h2 class="schedule-title">
                🗓️ Today's Study Schedule
            </h2>
            <table class="schedule-table">
                <thead>
                    <tr>
                        <th>Time</th>
                        <th>Activity</th>
                        <th>Type</th>
                    </tr>
                </thead>
                <tbody>
                    ${createScheduleRows(plan.aiResponse)

        }
                </tbody>
            </table>

            <!-- WELLNESS TRACKER -->
            <h2 class="schedule-title">
                🌿 Wellness Tracker
            </h2>

            <div class="planner-wellness-tracker">

                <div class="wellness-input-card">

                    <label>💧 Water Glasses</label>
                    <input
                        type="number"
                        id="waterGlasses"
                        min="0"
                        max="20"
                        placeholder="Example: 8"
                    >

                    <label>👁️ Eye Rest Breaks</label>
                    <input
                        type="number"
                        id="eyeRestBreaks"
                        min="0"
                        max="20"
                        placeholder="Example: 5"
                    >

                    <label>🚶 Movement Breaks</label>
                    <input
                        type="number"
                        id="movementBreaks"
                        min="0"
                        max="20"
                        placeholder="Example: 4"
                    >

                    <label>😴 Sleep Hours</label>
                    <input
                        type="number"
                        id="sleepHours"
                        min="0"
                        max="24"
                        step="0.5"
                        placeholder="Example: 8"
                    >

                    <label>😊 Today's Mood</label>

                    <select id="mood">

                        <option value="">
                            Select your mood
                        </option>

                        <option value="Excellent">
                            Excellent
                        </option>

                        <option value="Good">
                            Good
                        </option>

                        <option value="Okay">
                            Okay
                        </option>

                        <option value="Tired">
                            Tired
                        </option>

                        <option value="Stressed">
                            Stressed
                        </option>

                    </select>

                    <button
                        type="button"
                        id="saveWellnessBtn"
                        class="new-plan-btn"
                    >
                        🤖 Save & Get AI Recommendation
                    </button>

                    <div id="wellnessMessage"></div>

                </div>

            </div>
            <!-- DASHBOARD -->
            <div class="dashboard-link">
                <a href="/dashboard.html" class="new-plan-btn">📊 Go to Dashboard</a>
            </div>
        </div>
    `;
    schedulePlanNotifications(plan.aiResponse);
    setupPlannerWellness();
}

/*
 * Creates the table from the AI response.
 *
 * Your current AI returns normal text,
 * so we extract useful sections from it.
 */

function createScheduleRows(planData) {

    if (!planData) {
        return defaultSchedule();
    }

    // New structured AI / fallback response
    if (
        typeof planData === "object" &&
        Array.isArray(planData.sessions)
    ) {

        return planData.sessions
            .map(session => {

                return `
                    <tr>
                        <td>
                            ${escapeHTML(session.time)}
                        </td>

                        <td>
                            ${escapeHTML(session.activity)}
                        </td>

                        <td>
                            ${escapeHTML(session.type)}
                        </td>
                    </tr>
                `;

            })
            .join("");
    }


    // Old text-based AI response
    if (typeof planData === "string") {

        const lowerText =
            planData.toLowerCase();

        let rows = [];


        if (
            lowerText.includes("concept")
        ) {

            rows.push({
                time: "50 min",
                activity: "Concept Building",
                type: "📚 Study"
            });

        }


        if (
            lowerText.includes("water") ||
            lowerText.includes("hydration")
        ) {

            rows.push({
                time: "10 min",
                activity: "Water + Eye Rest",
                type: "💧 Wellness"
            });

        }


        if (
            lowerText.includes("problem solving") ||
            lowerText.includes("practice")
        ) {

            rows.push({
                time: "50 min",
                activity: "Problem Solving",
                type: "✏️ Practice"
            });

        }


        if (
            lowerText.includes("movement") ||
            lowerText.includes("break")
        ) {

            rows.push({
                time: "10 min",
                activity: "Movement Break",
                type: "🚶 Break"
            });

        }


        if (
            lowerText.includes("revision")
        ) {

            rows.push({
                time: "50 min",
                activity: "Revision & Practice",
                type: "🔄 Revision"
            });

        }


        if (rows.length >= 1) {

            return rows
                .slice(0, 5)
                .map(row => {

                    return `
                        <tr>
                            <td>${row.time}</td>
                            <td>${row.activity}</td>
                            <td>${row.type}</td>
                        </tr>
                    `;

                })
                .join("");
        }

    }


    return defaultSchedule();
}
/*
 * Backup schedule
 */

function defaultSchedule() {
    return `
        <tr>
            <td>50 min</td>
            <td>
                Concept Building
            </td>
            <td>
                📚 Study
            </td>
        </tr>
        <tr>
            <td>10 min</td>
            <td>
                Water + Eye Rest
            </td>
            <td>
                💧 Wellness
            </td>
        </tr>
        <tr>
            <td>50 min</td>
            <td>
                Problem Solving
            </td>
            <td>
                ✏️ Practice
            </td>
        </tr>
        <tr>
            <td>10 min</td>
            <td>
                Movement Break
            </td>
            <td>
                🚶 Break
            </td>
        </tr>
        <tr>
            <td>50 min</td>
            <td>
                Revision & Practice
            </td>
            <td>
                🔄 Revision
            </td>
        </tr>
    `;
}
/*
 * Format date
 */
function formatDate(date) {
    const formatted = new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    return formatted;

}
/*
 * Basic HTML protection
 */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function requestNotificationPermission() {

    if (!("Notification" in window)) {
        console.log("❌ Browser notifications are not supported.");
        return;
    }

    if (Notification.permission === "default") {

        const permission =
            await Notification.requestPermission();

        if (permission === "granted") {

            console.log("🔔 Notifications enabled!");

            startStudyReminders();

        } else {

            console.log("🔕 Notifications blocked.");

        }

    } else if (Notification.permission === "granted") {

        console.log("🔔 Notifications already enabled.");

        startStudyReminders();

    }
}

let studyReminderStarted = false;

function startStudyReminders() {

    if (studyReminderStarted) {
        console.log("🔔 Study reminders already running.");
        return;
    }

    if (Notification.permission !== "granted") {
        console.log("🔕 Notifications are not enabled.");
        return;
    }

    studyReminderStarted = true;

    console.log("🔔 AI-based study reminders ready.");
}
// =============================
// STUDYFIT AI NOTIFICATIONS
// =============================

function sendStudyFitNotification(title, message) {

    if (!("Notification" in window)) {
        console.log("❌ Notifications not supported.");
        return;
    }

    console.log("🔔 Notification permission:", Notification.permission);

    if (Notification.permission !== "granted") {
        console.log("❌ Notification permission is not granted.");
        return;
    }

    new Notification(title, {
        body: message
    });

    console.log("✅ Notification sent!");
}

function schedulePlanNotifications(planData) {

    if (!planData || !planData.sessions) {
        console.log("❌ No study sessions available.");
        return;
    }

    if (Notification.permission !== "granted") {
        console.log("🔕 Notifications are not enabled.");
        return;
    }

    let elapsedMinutes = 0;

    planData.sessions.forEach((session) => {

        const timeText = session.time || "0 min";

        const match = timeText.match(/\d+/);

        const duration = match
            ? parseInt(match[0])
            : 0;

        setTimeout(() => {

            sendStudyFitNotification(
                `🤖 StudyFit AI - ${session.type}`,
                session.activity
            );

        }, elapsedMinutes * 60 * 1000);

        elapsedMinutes += duration;
    });

    console.log(
        `🔔 Notifications scheduled for ${elapsedMinutes} minutes.`
    );
}

function setupPlannerWellness() {

    const button =
        document.getElementById("saveWellnessBtn");

    if (!button) {
        return;
    }

    button.addEventListener(
        "click",
        savePlannerWellness
    );
}

async function savePlannerWellness() {

    const studentId =
        localStorage.getItem("studentId");

    const message =
        document.getElementById("wellnessMessage");

    if (!studentId) {

        message.innerHTML =
            "❌ Student profile not found.";

        return;
    }

    const waterGlasses =
        document.getElementById("waterGlasses").value;

    const eyeRestBreaks =
        document.getElementById("eyeRestBreaks").value;

    const movementBreaks =
        document.getElementById("movementBreaks").value;

    const sleepHours =
        document.getElementById("sleepHours").value;

    const mood =
        document.getElementById("mood").value;

    const button =
        document.getElementById("saveWellnessBtn");

    try {

        button.disabled = true;

        button.innerHTML =
            "🤖 AI is analyzing...";

        message.innerHTML =
            "⏳ StudyFit AI is analyzing your wellness...";

        const response =
            await fetch(
                "/api/wellness",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        studentId:
                            studentId,

                        waterGlasses:
                            Number(waterGlasses) || 0,

                        eyeRestBreaks:
                            Number(eyeRestBreaks) || 0,

                        movementBreaks:
                            Number(movementBreaks) || 0,

                        sleepHours:
                            Number(sleepHours) || 0,

                        mood:
                            mood

                    })
                }
            );

        const data =
            await response.json();

        if (!data.success) {

            message.innerHTML =
                `❌ ${data.message}`;

            return;
        }

        if (data.recommendation) {

        message.innerHTML = `

            <div class="ai-recommendation">

                <div class="ai-recommendation-header">
                    <div class="ai-icon">
                        🤖
                    </div>

                    <div>
                        <h3>AI Wellness Recommendation</h3>
                        <span>Personalized for your study day ✨</span>
                    </div>
                </div>

                <div class="recommendation-content">

                    <div class="recommendation-item">
                        <span class="recommendation-icon">💧</span>
                        <div>
                            <strong>Hydration</strong>
                            <p>
                                ${escapeHTML(
                                    extractRecommendation(
                                        data.recommendation,
                                        "Hydration"
                                    )
                                )}
                            </p>
                        </div>
                    </div>

                    <div class="recommendation-item">
                        <span class="recommendation-icon">👁️</span>
                        <div>
                            <strong>Eye Rest</strong>
                            <p>
                                ${escapeHTML(
                                    extractRecommendation(
                                        data.recommendation,
                                        "Eye Rest"
                                    )
                                )}
                            </p>
                        </div>
                    </div>

                    <div class="recommendation-item">
                        <span class="recommendation-icon">🚶</span>
                        <div>
                            <strong>Movement</strong>
                            <p>
                                ${escapeHTML(
                                    extractRecommendation(
                                        data.recommendation,
                                        "Movement"
                                    )
                                )}
                            </p>
                        </div>
                    </div>

                    <div class="recommendation-item">
                        <span class="recommendation-icon">😴</span>
                        <div>
                            <strong>Sleep</strong>
                            <p>
                                ${escapeHTML(
                                    extractRecommendation(
                                        data.recommendation,
                                        "Sleep"
                                    )
                                )}
                            </p>
                        </div>
                    </div>

                    <div class="recommendation-item">
                        <span class="recommendation-icon">😊</span>
                        <div>
                            <strong>Mood</strong>
                            <p>
                                ${escapeHTML(
                                    extractRecommendation(
                                        data.recommendation,
                                        "Mood"
                                    )
                                )}
                            </p>
                        </div>
                    </div>

                </div>

                <div class="wellness-tip">

                    <span>💡</span>

                    <div>
                        <strong>Today's Tip</strong>
                        <p>
                            ${escapeHTML(
                                extractRecommendation(
                                    data.recommendation,
                                    "Today's Tip"
                                )
                            )}
                        </p>
                    </div>

                </div>

            </div>

        `;

    } 
        else {

            message.innerHTML =
                "✅ Wellness data saved successfully!";

        }

        document.getElementById(
            "waterGlasses"
        ).value = "";

        document.getElementById(
            "eyeRestBreaks"
        ).value = "";

        document.getElementById(
            "movementBreaks"
        ).value = "";

        document.getElementById(
            "sleepHours"
        ).value = "";

        document.getElementById(
            "mood"
        ).value = "";

    } catch (error) {

        console.error(
            "❌ Planner wellness error:",
            error
        );

        message.innerHTML =
            "❌ Unable to save wellness data.";

    } finally {

        button.disabled = false;

        button.innerHTML =
            "🤖 Save & Get AI Recommendation";

    }
}
function extractRecommendation(text, section) {

    const regex =
        new RegExp(
            section + "\\s*:\\s*(.*?)(?=\\s+(?:Hydration|Eye Rest|Movement|Sleep|Mood|Today's Tip)\\s*:|$)",
            "i"
        );

    const match = text.match(regex);

    return match
        ? match[1].trim()
        : "Keep following your wellness routine!";
}