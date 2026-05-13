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

let port;

try {

    port = new SerialPort({
        path: "COM3", // change this
        baudRate: 9600,
        autoOpen: false
    });

    port.open((err) => {

        if (err) {

            console.log(
                "❌ Arduino NOT connected"
            );

            return;
        }

        console.log(
            "✅ Arduino Connected"
        );
    });

} catch (err) {

    console.log(
        "❌ Serial setup failed"
    );
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
app.listen(3000, () => {
    console.log("Server running on port 3000");
});