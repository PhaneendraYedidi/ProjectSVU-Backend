import express from "express";
import session from "express-session";
import cors from "cors";
import practiceRoutes from "./routes/practice.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import path from "path";
import cookieParser from "cookie-parser";
import bookmarkRoutes from "./routes/bookmark.routes";
import mockRoutes from "./routes/mock.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import paymentsRoutes from "./routes/payment.routes";
import bodyParser from "body-parser";
import webhookRoutes from "./routes/webhook.routes";
import userRoutes from "./routes/user.routes";
import challengeRoutes from "./routes/challenge.routes";
const app = express();
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    secret: "admin-secret",
    resave: false,
    saveUninitialized: false
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/practice", practiceRoutes);
//app.use("/api/admin", adminRoutes);
app.use("/admin", adminRoutes);
// app.use("/admin", express.static(path.join(__dirname, "views")));
app.use("/api/bookmarks", bookmarkRoutes)
app.use("/api/mock", mockRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/user", userRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/webhooks", webhookRoutes);
app.use(
  "/webhooks/razorpay",
  bodyParser.raw({ type: "application/json" })
);

app.get("/", (_req, res) => {
  res.send("ProjectSVU Backend Running 🚀");
});

app.set("view engine", "ejs");
const viewsPath = path.join(__dirname, "views");
app.set("views", viewsPath);
// app.use(express.static("public"));

import fs from "fs";
try {
  console.log("Views directory:", viewsPath);
  const adminViews = path.join(viewsPath, "admin");
  if (fs.existsSync(adminViews)) {
    console.log("Admin views:", fs.readdirSync(adminViews));
  } else {
    console.log("Admin views directory does not exist!");
    console.log("Root views contents:", fs.readdirSync(viewsPath));
  }
} catch (err) {
  console.error("Error checking views:", err);
}

export default app;
