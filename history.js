document.addEventListener("DOMContentLoaded", function () {

    const btn = document.getElementById("subscribeBtn");

    if (!btn) {
        console.log("Button not found");
        return;
    }

    btn.addEventListener("click", function () {

        console.log("Button clicked"); // 🔍 check console

        const email = document.getElementById("emailInput").value;
        const msg = document.getElementById("subscribeMsg");

        if (!email || !email.includes("@")) {
            msg.style.color = "red";
            msg.innerText = "Please enter a valid email";
            return;
        }

        msg.style.color = "#66ff99";
        msg.innerText = "Subscribed successfully!";
    });

});
const historyList = document.getElementById("historyList");

function loadHistory() {

    let history = JSON.parse(localStorage.getItem("history")) || [];

    if (history.length === 0) {
        historyList.innerHTML = "<p>No history available</p>";
        return;
    }

    // 🔥 Group by time (minute precision)
    let grouped = {};

    history.forEach(item => {

        // Take only up to minutes (ignore seconds)
        let timeKey = item.time.slice(0, 16);

        if (!grouped[timeKey]) {
            grouped[timeKey] = { total: 0, red: 0, green: 0 };
        }

        grouped[timeKey].total++;

        if (item.type === "Red") {
            grouped[timeKey].red++;
        } else {
            grouped[timeKey].green++;
        }
    });

    // Convert to array & sort latest first
    let sorted = Object.keys(grouped)
        .sort()
        .reverse();

    historyList.innerHTML = "";

sorted.forEach((time, index) => {

    let data = grouped[time];

    let card = document.createElement("div");
    card.className = "history-card";

    card.innerHTML = `
        <div class="history-left">
            <strong>Total: ${data.total}</strong><br>

            <span class="red-text">
                Red: ${data.red}
            </span>

            |

            <span class="green-text">
                Green: ${data.green}
            </span>
        </div>

        <div class="history-right">
            ${time}
        </div>

        <!-- DELETE BUTTON -->
        <button class="delete-history-btn"
                data-index="${index}">
            🗑
        </button>
    `;

    historyList.appendChild(card);
});
}

loadHistory();
document.getElementById("subscribeBtn").addEventListener("click", async () => {

    const email = document.getElementById("emailInput").value;
    const msg = document.getElementById("subscribeMsg");

    if (!email || !email.includes("@")) {
        msg.innerText = "formalin857@gmail.com";
        msg.style.color = "red";
        return;
    }

    try {
        await fetch("https://tomatofinal.onrender.com/subscribe", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        });

        msg.innerText = "Subscribed successfully!";
        msg.style.color = "#66ff99";

    } catch {
        msg.innerText = "Server error";
        msg.style.color = "red";
    }
});
// ================= DELETE HISTORY =================

document.addEventListener("DOMContentLoaded", () => {

    let deleteIndex = null;

    const deleteModal =
        document.getElementById("deleteModal");

    const confirmDelete =
        document.getElementById("confirmDelete");

    const cancelDelete =
        document.getElementById("cancelDelete");

    // OPEN DELETE POPUP
    document.addEventListener("click", function (e) {

        if (e.target.classList.contains("delete-history-btn")) {

            deleteIndex =
                e.target.getAttribute("data-index");

            if (deleteModal) {
                deleteModal.style.display = "flex";
            }
        }
    });

    // YES DELETE
    if (confirmDelete) {

        confirmDelete.addEventListener("click", () => {

            let history =
                JSON.parse(localStorage.getItem("history")) || [];

            // Remove selected item
            history.splice(deleteIndex, 1);

            // Save updated history
            localStorage.setItem(
                "history",
                JSON.stringify(history)
            );

            // Close popup
            deleteModal.style.display = "none";

            // Reload page
            location.reload();
        });
    }

    // NO CANCEL
    if (cancelDelete) {

        cancelDelete.addEventListener("click", () => {

            deleteModal.style.display = "none";
        });
    }

});
const menuToggle =
    document.getElementById("menuToggle");

const navLinks =
    document.getElementById("navLinks");

if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function (e) {

        e.stopPropagation();

        navLinks.classList.toggle("active");

        this.innerText =
            navLinks.classList.contains("active")
            ? "✖"
            : "☰";
    });

    // CLOSE WHEN CLICKING OUTSIDE
    document.addEventListener("click", function (e) {

        if (
            navLinks.classList.contains("active") &&
            !navLinks.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {

            navLinks.classList.remove("active");

            menuToggle.innerText = "☰";
        }
    });
}