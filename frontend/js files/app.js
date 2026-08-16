// =============================
// SHOW SIGNUP
// =============================
function showSignup() {

    document.getElementById("loginBox")
        .style.display = "none";

    document.getElementById("signupBox")
        .style.display = "block";

}
// =============================
// SHOW LOGIN
// =============================

function showLogin() {

    document.getElementById("signupBox")
        .style.display = "none";

    document.getElementById("loginBox")
        .style.display = "block";

}
// =============================
// SIGNUP
// =============================
async function signupStudent() {

    const name =document.getElementById("signupName").value.trim();
    const email =document.getElementById("signupEmail").value.trim();
    const password =document.getElementById("signupPassword").value;
    const message =document.getElementById("signupMessage");

    if (!name || !email || !password) {
        message.innerHTML = "❌ Please fill all fields.";
        return;
    }

    try {
        const response = await fetch("/api/students/signup",
            {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            }
        );
        const data =
            await response.json();
        if (!data.success) {
            message.innerHTML =`❌ ${data.message}`;
            return;
        }
        message.innerHTML ="✅ Account created successfully!";
        // Clear fields

        document.getElementById(
            "signupName"
        ).value = "";

        document.getElementById(
            "signupEmail"
        ).value = "";

        document.getElementById(
            "signupPassword"
        ).value = "";
        // Show login

        setTimeout(() => {
            showLogin();
        }, 1000);

    } catch (error) {
        console.error(
            "Signup error:",
            error
        );
        message.innerHTML ="❌ Unable to create account.";
    }
}
// =============================
// LOGIN
// =============================
async function loginStudent() {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    if (!email || !password) {
        message.innerHTML = "❌ Please enter email and password.";
        return;
    }

    try {
        const response = await fetch(
            "/api/students/login",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password

                })
            }
        );
        const data =
            await response.json();
        if (!data.success) {
            message.innerHTML = `❌ ${data.message}`;
            return;
        }
        // Save logged-in student
        localStorage.setItem(
            "studentId",
            data.student.student_id
        );
        localStorage.setItem(
            "studentName",
            data.student.name
        );
        localStorage.setItem(
            "studentEmail",
            data.student.email
        );
        message.innerHTML = "✅ Login successful!";
        // Dashboard
        setTimeout(() => {
            window.location.href =
                "/dashboard.html";
        }, 700);
    } catch (error) {
        console.error(
            "Login error:",
            error
        );
        message.innerHTML =
            "❌ Unable to login.";
    }

}
// =============================
// DASHBOARD
// =============================
function goToDashboard() {
    window.location.href =
        "/dashboard.html";

}