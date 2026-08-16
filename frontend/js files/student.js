const studentForm = document.getElementById("studentForm");

const message = document.getElementById("message");

studentForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const name = document.getElementById("name").value;

    const email = document.getElementById("email").value;

    try {

        const response = await fetch("/api/students/create", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email
            })

        });

        const data = await response.json();

        if (data.success) {

            localStorage.setItem("studentId", data.studentId);

            message.innerHTML = `
                <p>✅ ${data.message}</p>
                <p>Student ID: ${data.studentId}</p>
                <p>Now you can create your AI study plan.</p>

                <a href="/planner.html">
                    <button type="button">
                        Create Study Plan 🤖
                    </button>
        </a>
    `;

            studentForm.reset();

        } else {

            message.innerHTML = `
                <p>❌ ${data.message}</p>
            `;

        }

    } catch (error) {

        console.error(error);

        message.innerHTML = `
            <p>❌ Server connection failed.</p>
        `;

    }

});