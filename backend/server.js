const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const authRoutes = require("./src/routes/auth");

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // parse JSON request bodies

app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:3000', 
    'http://127.0.0.1:5173',
    'https://accounts.google.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  next();
});
// simple health check
app.get("/", (req, res) => res.send("API up"));

app.use("/api/auth", authRoutes);
// app.use(cors({
//   origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));
async function start() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
    app.listen(process.env.PORT, () =>
      console.log("✅ Server running on port", process.env.PORT)
    );
  } catch (err) {
    console.error("❌ Failed to start:", err.message);
    process.exit(1);
  }
}

start();
