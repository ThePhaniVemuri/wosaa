import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { noSqlSanitizer } from "./middleware/noSqlSanitizer.js";
import manageWebhook from "./webhooks/dodoWebhook.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// some security measures
app.use(helmet());
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// webhook
app.use(
  "/api/v1/client/payments/webhook",
  express.raw({ type: "application/json" }),
  manageWebhook
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// sanitization
app.use(noSqlSanitizer);

app.use(cookieParser());
app.use(express.static("public"));

import userRegisterRouter from "./routes/user.routes.js";
import freelancerRouter from "./routes/freelancer.routes.js";
import clientRouter from "./routes/client.routes.js";

app.use("/api/v1/users", userRegisterRouter);
app.use("/api/v1/freelancer", freelancerRouter);
app.use("/api/v1/client", clientRouter);

export { app };