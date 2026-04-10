
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const { Pool } = require("pg");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

app.use(express.static("../tracker"));
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "analytics",
  password: "Shubham@21",
  port: 5432,
});

app.get("/", (req,res)=>res.send("API Running"));

app.post("/track", async (req, res) => {
  const { url, referrer, userAgent } = req.body;

  await pool.query(
    "INSERT INTO events (url, referrer, user_agent) VALUES ($1,$2,$3)",
    [url, referrer, userAgent]
  );

  io.emit("new_visit", { url });
  res.sendStatus(200);
});

app.get("/stats", async (req, res) => {
  const views = await pool.query("SELECT COUNT(*) FROM events");
  res.json({ totalViews: views.rows[0].count });
});

server.listen(5000, () => console.log("Server running"));
