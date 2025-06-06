import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";


import authRoutes from "./routes/auth.routes.js";
import problemRoutes from "./routes/problem.route.js";
import executeRoutes from "./routes/execute.routes.js";
import submissionRoutes from "./routes/submission.route.js";
import playlistRoutes from "./routes/playlist.route.js";
import userRoutes from "./routes/user.route.js";
import reportRoutes from "./routes/report.route.js";

import initializeSocket from "./libs/socketHandler.js";
import { invitationEvents } from "./libs/events.js";
import breakzoneRoutes from "./routes/breakzone.route.js";
import aiRoutes from "./routes/ai.route.js";
import devLogRoutes from "./routes/devLog.route.js";
import contestRoutes from "./routes/contest.route.js";

dotenv.config();
const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use((req, res, next) => {
  req.io = io;
  next();
})

initializeSocket(io);

app.set('invitationEvents', invitationEvents)

app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.get("/", (req, res) => {
  res.send("Welcome to the CodeSaga 🔥");
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute-code", executeRoutes);
app.use("/api/v1/submission", submissionRoutes);
app.use("/api/v1/playlist", playlistRoutes);
app.use("/api/v1/problems/report", reportRoutes);
app.use("/api/v1/breakzone", breakzoneRoutes)
app.use("/api/v1/ai", aiRoutes)
app.use("/api/v1/dev-log", devLogRoutes)
app.use("/api/v1/contests", contestRoutes)

invitationEvents.on('invitationCreated', (invitation) => {
  io.emit('newInvitation', invitation); 
})

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Socket.io is ready at ws://localhost:${PORT}/socket.io`);
});