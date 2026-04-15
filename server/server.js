const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg"); // ✅ only once (fixed duplicate)

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());
app.use(express.static("../tracker"));

/* 🔥 DATABASE CONNECTION (NEON) */
const pool = new Pool({
  connectionString: "postgresql://neondb_owner:npg_Cp36HRSLcMtZ@ep-green-snow-a1e4emsi-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require", // 🔥 replace this
  ssl: { rejectUnauthorized: false }
});

/* ✅ TEST CONNECTION */
pool.connect()
  .then(() => console.log("✅ Connected to Neon DB"))
  .catch(err => console.error("❌ DB Error:", err));

/* ROUTES */
app.get("/", (req, res) => res.send("API Running"));

app.post("/track", async (req, res) => {
  try {
    const { url, referrer, userAgent } = req.body;

    const device = userAgent?.includes("Mobile") ? "Mobile" : "Desktop";
    const sessionId = req.headers["x-session-id"] || "unknown";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    await pool.query(
      "INSERT INTO events (url, referrer, user_agent, device, session_id, ip) VALUES ($1,$2,$3,$4,$5,$6)",
      [url, referrer, userAgent, device, sessionId, ip]
    );

    io.emit("new_visit", { url, device });

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Error inserting data:", err);
    res.status(500).send("Error");
  }
});

app.get("/stats", async (req, res) => {
  try {
    const views = await pool.query("SELECT COUNT(*) FROM events");
    res.json({ totalViews: views.rows[0].count });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error");
  }
});

server.listen(5001, () => console.log("🚀 Server running on port 5001"));