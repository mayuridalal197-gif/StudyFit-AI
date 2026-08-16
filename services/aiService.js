const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

const generateAIPlan = async (data) => {

    const { subjects, hours, examDate } = data;
    try {
        console.log("🤖 Trying Gemini AI...");
        const prompt = `
            You are StudyFit AI, an intelligent study assistant.

            The student has already decided how much time they want to spend on each subject.

            Student's selected subjects and time:
            ${subjects}

            Total available daily study time:
            ${hours} hours

            Exam date:
            ${examDate}

            IMPORTANT:
            - NEVER change the student's selected study time.
            - NEVER increase or decrease the time given to any subject.
            - The student's time allocation is final.
            - Your job is only to organize the selected subjects into a practical study schedule.
            - You may suggest concept learning, practice, revision and breaks.
            - Include short wellness breaks between study sessions when appropriate.
            - Do not allocate more study time than the student selected.
            - Do not add any subject that the student did not provide.

            Return ONLY valid JSON.

            Use exactly this format:

            {
                "sessions": [
                    {
                        "time": "60 min",
                        "activity": "DSA - Concept Learning",
                        "type": "Study"
                    },
                    {
                        "time": "10 min",
                        "activity": "💧 Water + 👁️ Eye Rest",
                        "type": "Wellness"
                    },
                    {
                        "time": "60 min",
                        "activity": "DSA - Problem Solving",
                        "type": "Study"
                    },
                    {
                        "time": "10 min",
                        "activity": "🚶 Movement Break",
                        "type": "Break"
                    },
                    {
                        "time": "60 min",
                        "activity": "DSA - Revision",
                        "type": "Study"
                    },
                    {
                        "time": "60 min",
                        "activity": "Java - Concepts & OOP",
                        "type": "Study"
                    }
                ]
            }

            Rules:
            Rules:
            - Keep each subject's selected study time EXACTLY the same.
            - NEVER reduce or increase the selected study time.
            - NEVER create a study session longer than 60 minutes.
            - If a subject has more than 60 minutes, SPLIT it into multiple sessions of maximum 60 minutes.
            - For example, 180 minutes must become 60 + 60 + 60 minutes.
            - 120 minutes must become 60 + 60 minutes.
            - 60 minutes must remain 60 minutes.
            - Add a short 10-minute wellness break between long study sessions.
            - Wellness breaks must NOT be counted as study time.
            - Subject study minutes must add up exactly to the student's selected subject hours.
            - Do NOT add extra practice, revision or study time outside the selected subject hours.
            - Subject names must appear in the activity.
            - Do not invent additional subjects.
            - Do not change the student's total study hours.
            - Keep the response practical and student-friendly.
            `;

        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });

        let text = response.text.trim();

        text = text
            .replace(/^```json/i, "")
            .replace(/^```/i, "")
            .replace(/```$/i, "")
            .trim();

        const structuredPlan = JSON.parse(text);

        console.log("✅ Gemini AI successful");

        return {
            message: "AI study plan generated successfully!",
            aiResponse: structuredPlan,
            source: "gemini"
        };

    } 
    catch (error) {

        console.log("⚠️ Gemini unavailable. Using fallback AI.");

        return {
            message: "Study plan generated using StudyFit AI fallback.",
            aiResponse: generateFallbackPlan(data),
            source: "fallback"
        };
    }
};

const generateFallbackPlan = (data) => {

    const {
        subjects,
        hours
    } = data;

    // --------------------------------
    // Convert subjects into array
    // --------------------------------

    const subjectList = subjects
        .split(",")
        .map(subject => subject.trim())
        .filter(subject => subject.length > 0)
        .map(subject => {

            // Example:
            // "DSA (3 hours)"

            const match = subject.match(
                /^(.+?)\s*\(([\d.]+)\s*hours?\)$/i
            );

            if (match) {

                return {
                    name: match[1].trim(),
                    hours: Number(match[2])
                };

            }

            return {
                name: subject,
                hours: 1
            };

        });


    const dailyHours = Number(hours) || 2;

    // --------------------------------
    // Total selected study minutes
    // --------------------------------

    const totalSelectedMinutes =
        subjectList.reduce(
            (total, subject) =>
                total + (subject.hours * 60),
            0
        );


    const sessions = [];


    // --------------------------------
    // Create subject sessions
    // --------------------------------

    subjectList.forEach((subject, index) => {

        const totalSubjectMinutes =
            Math.round(subject.hours * 60);

        let remainingMinutes =
            totalSubjectMinutes;

        let sessionNumber = 1;


        while (remainingMinutes > 0) {

            // Maximum 60 minutes per focused session
            const sessionMinutes =
                Math.min(60, remainingMinutes);


            let activity = "";


            // Subject-specific activities

            if (
                subject.name
                    .toLowerCase()
                    .includes("java")
            ) {

                if (sessionNumber === 1) {

                    activity =
                        "Java - Concepts & OOP";

                } else {

                    activity =
                        "Java - Coding & Practice";

                }

            } else if (
                subject.name
                    .toLowerCase()
                    .includes("dbms")
            ) {

                if (sessionNumber === 1) {

                    activity =
                        "DBMS - SQL & Database Concepts";

                } else {

                    activity =
                        "DBMS - SQL Practice & Revision";

                }

            } else if (
                subject.name
                    .toLowerCase()
                    .includes("python")
            ) {

                if (sessionNumber === 1) {

                    activity =
                        "Python - Concepts & Coding";

                } else {

                    activity =
                        "Python - Practice & Problem Solving";

                }

            } else if (
                subject.name
                    .toLowerCase()
                    .includes("math")
            ) {

                if (sessionNumber === 1) {

                    activity =
                        "Mathematics - Concepts";

                } else {

                    activity =
                        "Mathematics - Problem Solving";

                }

            } else {

                if (sessionNumber === 1) {

                    activity =
                        `${subject.name} - Concept Learning`;

                } else {

                    activity =
                        `${subject.name} - Practice & Revision`;

                }

            }


            // --------------------------------
            // Add study session
            // --------------------------------

            sessions.push({

                time:
                    `${sessionMinutes} min`,

                activity:
                    activity,

                type:
                    "Study"

            });


            remainingMinutes -=
                sessionMinutes;


            sessionNumber++;


            // --------------------------------
            // Add break if subject continues
            // --------------------------------

            if (remainingMinutes > 0) {

                sessions.push({

                    time:
                        "10 min",

                    activity:
                        "💧 Water + 👁️ Eye Rest",

                    type:
                        "Wellness"

                });

            }

        }


        // --------------------------------
        // Break between subjects
        // --------------------------------

        if (
            index <
            subjectList.length - 1
        ) {

            sessions.push({

                time:
                    "10 min",

                activity:
                    "🚶 Movement Break",

                type:
                    "Break"

            });

        }

    });


    // --------------------------------
    // Safety check
    // --------------------------------

    const generatedStudyMinutes =
        sessions
            .filter(
                session =>
                    session.type === "Study"
            )
            .reduce(
                (total, session) => {

                    const minutes =
                        parseInt(
                            session.time
                        ) || 0;

                    return total + minutes;

                },
                0
            );


    console.log(
        "📚 Selected study minutes:",
        totalSelectedMinutes
    );

    console.log(
        "📚 Generated study minutes:",
        generatedStudyMinutes
    );


    return {

        sessions:
            sessions,

        generatedBy:
            "StudyFit AI Fallback",

        dailyHours:
            dailyHours,

        totalStudyMinutes:
            generatedStudyMinutes

    };

};

const generateWellnessRecommendation = async (data) => {

    const {waterGlasses, eyeRestBreaks, movementBreaks, sleepHours, mood} = data;
    const prompt = `
        You are StudyFit AI, a student wellness assistant.

        Analyze this student's daily wellness data:

        Water glasses: ${waterGlasses}
        Eye rest breaks: ${eyeRestBreaks}
        Movement breaks: ${movementBreaks}
        Sleep hours: ${sleepHours}
        Mood: ${mood}

        Give a SHORT and practical wellness summary.

        Follow EXACTLY this format:

        Hydration: [one short sentence]
        Eye Rest: [one short sentence]
        Movement: [one short sentence]
        Sleep: [one short sentence]
        Mood: [one short sentence]

        Today's Tip: [one practical sentence]

        Rules:
        - Maximum 1 sentence for each section.
        - Keep the entire response under 100 words.
        - Do not say "Hi", "Hello", or introduce yourself.
        - Do not use Markdown headings.
        - Do not give medical advice.
        - Use simple language suitable for students.
        `;

    try {
        // 🤖 Try Gemini AI
        const response = await ai.models.generateContent({
            model: "gemini-3.6-flash",
            contents: prompt
        });
        return response.text;
    } 
    catch (error) {
        // ⚠️ Gemini unavailable / quota exceeded
        console.error("⚠️ Gemini AI unavailable:", error.message);
        // 🔄 StudyFit AI fallback
        return `
        Hydration: ${waterGlasses < 6
                        ? "Try drinking more water throughout the day."
                        : "Your hydration looks good today."}

        Eye Rest: ${eyeRestBreaks < 3
                        ? "Take regular breaks and look away from the screen."
                        : "Good job taking regular eye rest breaks."}

        Movement: ${movementBreaks < 2
                        ? "Take a short movement break to stay active."
                        : "Good job staying active during your study time."}

        Sleep: ${sleepHours < 7
                        ? "Try to get around 7–8 hours of sleep tonight."
                        : "Your sleep duration looks good."}

        Mood: ${mood
                        ? "Keep taking short breaks and maintain a positive routine."
                        : "Take some time to relax and recharge."}

        Today's Tip: Balance focused study with regular water, movement and rest breaks.
                `.trim();
    }
};
module.exports = {
    generateAIPlan,
    generateWellnessRecommendation
};