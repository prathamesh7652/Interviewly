import express from "express";
import ENV from "./lib/env.js";
import path from "path";
import connectDB from "./lib/db.js";
import cors from "cors";
import { serve } from "inngest/express";
import { inngest, functions } from "./lib/inngest.js";
import { clerkMiddleware } from "@clerk/express";
import chatRoutes from "./routes/chatRoutes.js";

const app = express();
const __dirname = path.resolve();

// middleware
app.use(express.json());
// credentials:true meaning?? => server allows a browser to include cookies on request
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(clerkMiddleware()); // this adds auth field to request object: req.auth()

app.use("/api/inngest", serve({ client: inngest, functions }));
app.use("/api/chat", chatRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({ msg: "api is up and running" });
});
app.get("/health", (req, res) => {
  res.status(200).json({ msg: "health" });
});

app.get("/box", (req, res) => {
  res.status(200).json({ msg: "success from backend" });
});

// Production frontend
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  app.get("/{*any}", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(ENV.PORT || 3000, () => {
      console.log(`Server running on port ${ENV.PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection failed:", err);
  });
