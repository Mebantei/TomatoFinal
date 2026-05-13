// ---------------- VARIABLES ----------------
let sortingActive = true;
let detecting = false;

let total = Number(localStorage.getItem("total")) || 0;
let red = Number(localStorage.getItem("red")) || 0;
let green = Number(localStorage.getItem("green")) || 0;

let lastDetectionTime = Date.now();

// ---------------- DOM ----------------
const statusText = document.getElementById("statusText");
const detectionText = document.getElementById("detectionText");

// Initial message
detectionText.innerText =
    "Click 'Start Detecting Tomato' to begin";

// ---------------- BUTTON EVENTS ----------------

//----------------- The Start Button -------------
document.getElementById("startDetect").onclick =
async () => {

    if (detecting) return;

    try {

        const response = await fetch(
            "http://localhost:3000/start-detection",
            {
                method: "POST"
            }
        );

        const text = await response.text();

        // Arduino NOT connected
        if (text === "Arduino not connected") {

            statusText.innerText =
                "Arduino not connected";

            detectionText.innerText =
                "Waiting for Arduino connection...";

            return;
        }

        // Arduino connected
        detecting = true;

        sortingActive = true;

        lastDetectionTime = Date.now();

        statusText.innerText =
            "Detection running...";

        detectionText.innerText =
            "Waiting for tomato detection...";

    } catch (err) {

        statusText.innerText =
            "Server offline";

        detectionText.innerText =
            "Unable to connect to server";
    }
};

//----------------- The Stop Button -------------
document.getElementById("stopDetect").onclick =
async () => {

    detecting = false;

    try {

        await fetch(
            "http://localhost:3000/stop-detection",
            {
                method: "POST"
            }
        );

    } catch {}

    statusText.innerText =
        "Detection stopped";

    detectionText.innerText =
        "Click start to begin tomato detection";
};
// ---------------- MAIN LOOP ----------------
function simulateSystem() {
    if (!detecting) return;

    setTimeout(() => {

        // stop immediately if turned off
        if (!detecting) return;

        let detected = Math.random() > 0.4;

        if (!detected) {

            detectionText.innerText = "No tomato is placed";

            let idleTime = (Date.now() - lastDetectionTime) / 1000;

            if (idleTime >= 20 && sortingActive) {
                sortingActive = false;
                statusText.innerText =
                    "Idle 20s → Sorting stopped";
            }

        } else {

            lastDetectionTime = Date.now();

            if (!sortingActive) {
                sortingActive = true;
                statusText.innerText = "Sorting resumed";
            }

            if (sortingActive) {

                let isRed = Math.random() > 0.5;
                total++;

                if (isRed) {
                    red++;
                    detectionText.innerText = "Red tomato → LEFT";
                    saveData("Red");
                } else {
                    green++;
                    detectionText.innerText = "Green tomato → RIGHT";
                    saveData("Green");
                }
            }
        }

        simulateSystem();

    }, 2000);
}

// ---------------- SAVE DATA ----------------
function saveData(type) {

    localStorage.setItem("total", total);
    localStorage.setItem("red", red);
    localStorage.setItem("green", green);

    let history = JSON.parse(localStorage.getItem("history")) || [];

    let now = new Date();

    let dateTime =
        now.getFullYear() + "-" +
        String(now.getMonth() + 1).padStart(2, "0") + "-" +
        String(now.getDate()).padStart(2, "0") + " " +
        String(now.getHours()).padStart(2, "0") + ":" +
        String(now.getMinutes()).padStart(2, "0") + ":" +
        String(now.getSeconds()).padStart(2, "0");

    history.unshift({
        time: dateTime,
        type: type
    });

    localStorage.setItem("history", JSON.stringify(history));
}

// ---------------- SUBSCRIBE ----------------
document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("subscribeBtn");

    if (!btn) return;

    btn.addEventListener("click", async () => {

        const email = document.getElementById("emailInput").value;
        const msg = document.getElementById("subscribeMsg");

        if (!email || !email.includes("@")) {
            msg.innerText = "Please enter a valid email";
            msg.style.color = "red";
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/subscribe", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email })
            });

            const text = await response.text();

            msg.innerText = text;

            if (text === "Already subscribed") {
                msg.style.color = "orange";
            } else {
                msg.style.color = "#66ff99";
            }

        } catch {
            msg.innerText = "Server error";
            msg.style.color = "red";
        }
    });
});

// ---------------- MOBILE NAV TOGGLE ----------------
const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function (e) {

        e.stopPropagation();

        navLinks.classList.toggle("active");

        // CHANGE ICON
        if (
            navLinks.classList.contains("active")
        ) {

            menuToggle.innerText = "✖";

        } else {

            menuToggle.innerText = "☰";
        }
    });

    // CLOSE WHEN CLICKING OUTSIDE
    document.addEventListener("click", function (e) {

        if (
            !menuToggle.contains(e.target) &&
            !navLinks.contains(e.target)
        ) {

            navLinks.classList.remove("active");

            menuToggle.innerText = "☰";
        }
    });
}
// ================= WARNING MODAL NAVIGATION =================

let nextPage = null;

// Modal elements
const warningModal = document.getElementById("warningModal");
const stopAndLeave = document.getElementById("stopAndLeave");
const continueRunning = document.getElementById("continueRunning");

// Detect navbar clicks
document.querySelectorAll(".nav-links a").forEach(link => {

    link.addEventListener("click", function (e) {

        // If detection running
        if (detecting) {

            e.preventDefault();

            nextPage = this.href;

            // Show popup
            if (warningModal) {
                warningModal.style.display = "flex";
            }
        }
    });

});

// YES STOP
if (stopAndLeave) {

    stopAndLeave.addEventListener("click", () => {

        detecting = false;

        statusText.innerText = "Detection stopped";

        detectionText.innerText =
            "Click 'Start Detecting Tomato' to begin";

        // Save stop entry
        saveData("Stopped");

        // Hide modal
        warningModal.style.display = "none";

        // Navigate
        window.location.href = nextPage;
    });

}

// NO KEEP RUNNING
if (continueRunning) {

    continueRunning.addEventListener("click", () => {

        // Just close popup
        warningModal.style.display = "none";

        // Stay on same page
        nextPage = null;
    });

}