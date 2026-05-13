const express = require("express");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
const { SerialPort } = require("serialport");
const app = express();
app.use(cors({
    origin: "*"
}));
app.use(express.json());

// ================= ARDUINO SERIAL =================

// ================= ARDUINO SERIAL =================

let port = null;

// ONLY TRY ARDUINO LOCALLY
if (process.env.RENDER !== "true") {

    try {

        port = new SerialPort({
            path: "COM9",
            baudRate: 9600
        });

        port.on("open", () => {

            console.log("✅ Arduino Connected");
        });

        port.on("error", (err) => {

            console.log("❌ Arduino Error:", err.message);
        });

    } catch (err) {

        console.log("❌ Arduino Not Connected");
    }
}
// ================= FILE SETUP =================
const FILE = "subscribers.json";

// Load existing subscribers
let subscribers = [];

if (fs.existsSync(FILE)) {
    subscribers = JSON.parse(fs.readFileSync(FILE));
}

// ================= EMAIL SETUP =================
const transporter = nodemailer.createTransport({

    service: "gmail",

    auth: {

        user: process.env.EMAIL_USER,

        pass: process.env.EMAIL_PASS
    }
});

// ================= SUBSCRIBE API =================
app.post("/subscribe", async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).send("Email required");
    }

    // 🚫 Prevent duplicate
    if (subscribers.includes(email)) {
        return res.send("Already subscribed");
    }

    // ✅ Save new email
    subscribers.push(email);

    // 💾 Save to file
    fs.writeFileSync(FILE, JSON.stringify(subscribers, null, 2));

    // 📧 Send notification
    try {
        await transporter.sendMail({
            from: "formalin857@gmail.com",
            to: "formalin857@gmail.com",
            subject: "📢 New Subscriber",
            text: `New subscriber: ${email}`
        });

        res.send("Subscribed successfully");

    } catch (err) {
        console.error(err);
        res.status(500).send("Email error");
    }
});
// ================= DETECTION CONTROL =================

// START DETECTION
app.post("/start-detection", (req, res) => {

    // Arduino not connected
    if (!port || !port.isOpen) {

        console.log("❌ Arduino not connected");

        return res.status(500).send(
            "Arduino not connected"
        );
    }

    // Send start signal
    port.write("1");

    console.log("✅ Detection Started");

    res.send("Detection started");
});

// STOP DETECTION
app.post("/stop-detection", (req, res) => {

    // SEND STOP SIGNAL TO ARDUINO
    port.write("0");

    console.log("🛑 Detection Stopped");

    res.send("Detection stopped");
});
// ================= START SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);
});