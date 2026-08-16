document.addEventListener("DOMContentLoaded", () => {
    loadStudentProfile();
    loadStudyPlans();
    loadWellness();

});

async function loadStudyPlans() {
    const studentId = localStorage.getItem("studentId");
    const container = document.getElementById("plansContainer");
    // Student ID check
    if (!studentId) {
        container.innerHTML = `
            <p>❌ Student profile not found.</p>
            <a href="/student.html">
                Create Student Profile
            </a>
        `;
        return;
    }

    try {
        console.log("📡 Fetching study plans for student:", studentId);
        const response = await fetch(
            `/api/study/student/${studentId}`
        );

        const data = await response.json();
        console.log("📦 Dashboard response:", data);
        // API error
        if (!data.success) {
            container.innerHTML = `<p>❌ ${data.message}</p>`;
            return;
        }
        // No plans
        if (!data.plans || data.plans.length === 0) {
            container.innerHTML = `
                <div class="plan-card">
                    <h2>📚 No Study Plans Yet</h2>
                    <p>
                        You haven't created an AI study plan yet.
                    </p>
                    <br>
                    <a href="/planner.html"
                       class="new-plan-btn">
                        🤖 Create AI Study Plan
                    </a>
                </div>
            `;
            return;
        }
        // Clear loading message
        container.innerHTML = "";
        // Display every saved plan
        data.plans.forEach(plan => {
            let sessions = [];
            if (plan.ai_plan && plan.ai_plan.sessions) {
                sessions = plan.ai_plan.sessions;
            }
            const card = document.createElement("div");
            card.className = "plan-card";
            card.style.position = "relative";
            card.innerHTML = `
                <div class="plan-menu">
                <button
                    type="button"
                    class="plan-menu-btn"
                    onclick="togglePlanMenu(${plan.plan_id})">
                    ⋮
                </button>

                <div
                    id="planMenu-${plan.plan_id}"
                    class="plan-menu-dropdown">

                    <button
                        type="button"
                        onclick="deleteStudyPlan(${plan.plan_id})">
                        🗑️ Delete Plan
                    </button>

                </div>
                </div>
                <h2>
                    🤖 Your AI Study Plan
                </h2>
                <!-- PLAN SUMMARY -->
                <div class="plan-summary">
                    <div class="summary-box">
                        <span>📚 Subject</span>
                        <strong>
                            ${plan.subjects}
                        </strong>
                    </div>
                    <div class="summary-box">
                        <span>⏱️ Daily Study</span>
                        <strong>
                            ${plan.daily_hours} Hours
                        </strong>
                    </div>
                    <div class="summary-box">
                        <span>📅 Exam Date</span>
                        <strong>
                            ${formatDate(plan.exam_date)}
                        </strong>
                    </div>
                </div>
                <!-- STUDY SCHEDULE -->
                <h3 class="schedule-title">
                🗓️ Today's AI Study Schedule
                </h3>
                <table class="schedule-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Activity</th>
                            <th>Type</th>
                        </tr>
                    </thead>
                <tbody>
                ${sessions.length > 0
                    ? sessions.map(session => `
                        <tr>
                            <td>${session.time}</td>
                            <td>${session.activity}</td>
                            <td class="${session.type.toLowerCase()}">
                                ${session.type}
                            </td>
                        </tr>
                    `).join("")
                    : `
                        <tr>
                            <td colspan="3">
                                No AI schedule available.
                            </td>
                        </tr>
                    `
                }
                 </tbody>
                 </table>

                
                <!-- WELLNESS -->
                
                <!-- PLAN ID -->
                <p style="margin-top:20px; color:#6b7280;">
                    Plan ID:
                    <strong>${plan.plan_id}</strong>
                </p>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error(
            "❌ Dashboard error:",
            error
        );
        container.innerHTML = `
            <div class="plan-card">
                <h2>❌ Something went wrong</h2>
                <p>
                    Unable to load your study plans.
                </p>
            </div>
        `;
    }
}




/* DATE FORMAT */
function formatDate(date) {
    return new Date(date).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );
}

// =============================
// LOAD STUDENT PROFILE
// =============================

function loadStudentProfile() {
    const studentName = localStorage.getItem("studentName");
    const nameElement = document.getElementById("studentName");
    if (!studentName) {
        window.location.href = "/";
        return;
    }
    if (nameElement) {
        nameElement.textContent = studentName;
    }
}
// =============================
// LOGOUT
// =============================
function logoutStudent() {
    localStorage.removeItem("studentId");
    localStorage.removeItem("studentName");
    localStorage.removeItem("studentEmail");
    window.location.href = "/";

}

async function loadWellness() {

    const studentId =
        localStorage.getItem("studentId");

    const history =
        document.getElementById("wellnessHistory");

    if (!studentId || !history) {
        return;
    }

    try {

        const response =
            await fetch(
                `/api/wellness/student/${studentId}`
            );

        const data =
            await response.json();

        if (!data.success) {
            return;
        }

        if (
            !data.wellness ||
            data.wellness.length === 0
        ) {

            history.innerHTML = `
                <p>
                    🌿 No wellness records yet.
                </p>
            `;

            return;
        }

        const latest =
            data.wellness[0];

        // ⭐ Calculate score
        calculateWellnessScore(latest);

        history.innerHTML = `

            <h3>📊 Latest Wellness Record</h3>

            <div class="wellness-grid">

                <div class="wellness-card">
                    <div class="icon">💧</div>
                    <h3>Water</h3>
                    <p>
                        ${latest.water_glasses}
                        glasses
                    </p>
                </div>

                <div class="wellness-card">
                    <div class="icon">👁️</div>
                    <h3>Eye Rest</h3>
                    <p>
                        ${latest.eye_breaks}
                        breaks
                    </p>
                </div>

                <div class="wellness-card">
                    <div class="icon">🚶</div>
                    <h3>Movement</h3>
                    <p>
                        ${latest.movement_breaks}
                        breaks
                    </p>
                </div>

                <div class="wellness-card">
                    <div class="icon">😴</div>
                    <h3>Sleep</h3>
                    <p>
                        ${latest.sleep_hours}
                        hours
                    </p>
                </div>

                <div class="wellness-card">
                    <div class="icon">😊</div>
                    <h3>Mood</h3>
                    <p>
                        ${latest.mood || "Not recorded"}
                    </p>
                </div>

            </div>
        `;

    } catch (error) {

        console.error(
            "Wellness fetch error:",
            error
        );

    }
}

function calculateWellnessScore(wellness) {

    const water = Number(wellness.water_glasses) || 0;
    const eyeBreaks = Number(wellness.eye_breaks) || 0;
    const movement = Number(wellness.movement_breaks) || 0;
    const sleep = Number(wellness.sleep_hours) || 0;
    const mood = wellness.mood || "";

    // Maximum points
    // Water = 20
    // Eye Rest = 20
    // Movement = 20
    // Sleep = 20
    // Mood = 20

    let waterScore =
        Math.min(water / 8, 1) * 20;

    let eyeScore =
        Math.min(eyeBreaks / 5, 1) * 20;

    let movementScore =
        Math.min(movement / 4, 1) * 20;

    let sleepScore =
        Math.min(sleep / 8, 1) * 20;

    let moodScore = 0;

    if (mood === "Excellent") {
        moodScore = 20;
    } else if (mood === "Good") {
        moodScore = 16;
    } else if (mood === "Okay") {
        moodScore = 12;
    } else if (mood === "Tired") {
        moodScore = 8;
    } else if (mood === "Stressed") {
        moodScore = 5;
    }

    const score = Math.round(
        waterScore +
        eyeScore +
        movementScore +
        sleepScore +
        moodScore
    );


    let message = "";

    if (score >= 90) {
        message = "Excellent! Keep up your healthy routine! 🌟";
    } else if (score >= 75) {
        message = "Great job! Your wellness habits are strong. 💪";
    } else if (score >= 50) {
        message = "Good start! You can improve your wellness habits. 🌱";
    } else {
        message = "Let's focus on your wellness today. ❤️";
    }

    const detailsContainer =
        document.getElementById("wellnessDetails");

    if (detailsContainer) {

        detailsContainer.innerHTML = `

    <div class="wellness-details-card">

        <h3>📊 Wellness Details</h3>

        <button
            type="button"
            id="toggleWellnessBtn"
            class="toggle-wellness-btn"
        >
            📊 View Wellness Details
        </button>


        <div
            id="wellnessDetailsContent"
            style="display: none;"
        >

            <table class="wellness-details-table">

                <thead>

                    <tr>
                        <th>Wellness Area</th>
                        <th>Your Data</th>
                        <th>Target</th>
                    </tr>

                </thead>

                <tbody>

                    <tr>
                        <td>💧 Water</td>
                        <td>${water} glasses</td>
                        <td>8 glasses</td>
                    </tr>

                    <tr>
                        <td>👁️ Eye Rest</td>
                        <td>${eyeBreaks} breaks</td>
                        <td>5 breaks</td>
                    </tr>

                    <tr>
                        <td>🚶 Movement</td>
                        <td>${movement} breaks</td>
                        <td>4 breaks</td>
                    </tr>

                    <tr>
                        <td>😴 Sleep</td>
                        <td>${sleep} hours</td>
                        <td>8 hours</td>
                    </tr>

                    <tr>
                        <td>😊 Mood</td>
                        <td>${mood || "Not recorded"}</td>
                        <td>—</td>
                    </tr>

                </tbody>

            </table>

        </div>

    </div>

`;
        const toggleButton =
            document.getElementById("toggleWellnessBtn");

        const detailsContent =
            document.getElementById("wellnessDetailsContent");


        if (toggleButton && detailsContent) {

            toggleButton.addEventListener("click", () => {

                if (detailsContent.style.display === "none") {

                    detailsContent.style.display = "block";

                    toggleButton.textContent =
                        "🔼 Hide Wellness Details";

                }
                else {

                    detailsContent.style.display = "none";

                    toggleButton.textContent =
                        "📊 View Wellness Details";

                }

            });
        }
    }
    const scoreContainer =
        document.getElementById("wellnessScore");

    if (!scoreContainer) {
        return;
    }


    scoreContainer.innerHTML = `

        <div class="wellness-score-card">

            <div class="score-icon">
                🌿
            </div>

            <div>

                <h3>
                    Today's Wellness Score
                </h3>

                <div class="score-number">
                    ${score}/100
                </div>

                <p>
                    ${message}
                </p>

            </div>

        </div>

    `;
}
// =============================
// STUDY PLAN 3-DOT MENU
// =============================

function togglePlanMenu(planId) {

    const menu =
        document.getElementById(`planMenu-${planId}`);

    if (!menu) {
        return;
    }

    // Close other open menus
    document
        .querySelectorAll(".plan-menu-dropdown")
        .forEach(otherMenu => {

            if (otherMenu !== menu) {
                otherMenu.style.display = "none";
            }

        });

    if (menu.style.display === "block") {

        menu.style.display = "none";

    } else {

        menu.style.display = "block";

    }
}


// =============================
// DELETE STUDY PLAN
// =============================

async function deleteStudyPlan(planId) {

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this study plan?"
        );

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `/api/study/${planId}`,
            {
                method: "DELETE"
            }
        );

        const data =
            await response.json();

        if (!data.success) {

            alert(
                "❌ " +
                (data.message ||
                    "Unable to delete study plan.")
            );

            return;
        }

        alert("✅ Study plan deleted successfully!");

        // Reload plans
        loadStudyPlans();

    } catch (error) {

        console.error(
            "❌ Delete study plan error:",
            error
        );

        alert(
            "❌ Unable to delete study plan."
        );

    }
}