import express from "express";
import cors from "cors";
import practiceRoutes from "./routes/practice.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/practice", practiceRoutes);

app.get("/", (_req, res) => {
  res.send("ProjectSVU Backend Running 🚀");
});

export default app;
