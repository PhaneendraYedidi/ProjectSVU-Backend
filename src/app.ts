import express from "express";
import cors from "cors";
import practiceRoutes from "./routes/practice.routes";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import path from "path";
import cookieParser from "cookie-parser";
import adminAuthRoutes from "./routes/admin.auth.routes";
import adminUploadRoutes from "./routes/admin.upload.routes";
import bookmarkRoutes from "./routes/bookmark.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/practice", practiceRoutes);
app.use("/api/admin", adminRoutes);
// app.use("/admin", express.static(path.join(__dirname, "views")));
app.use("/admin", adminAuthRoutes);
app.use("/admin", adminUploadRoutes);
app.use("/api/bookmarks",bookmarkRoutes)

app.get("/", (_req, res) => {
  res.send("ProjectSVU Backend Running 🚀");
});

export default app;
