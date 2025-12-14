import express from "express";
import { adminAuth } from "../middleware/adminAuth.middleware";
import { upload } from "../middleware/upload.middleware";
import { parseExcelBuffer } from "../utils/excelParser";
import Question from "../models/Question";

const router = express.Router();

router.get("/upload", adminAuth, (_req, res) => {
  res.sendFile("upload.html", { root: "src/views" });
});

router.post(
  "/upload-questions",
  adminAuth,
  upload.single("file"),
  async (req, res) => {
    if (!req.file) return res.send("No file uploaded");

    const questions = parseExcelBuffer(req.file.buffer);
    console.log(JSON.stringify(questions,null,1));
    await Question.insertMany(questions, { ordered: false });

    res.send(`✅ Uploaded ${questions.length} questions`);
  }
);

export default router;
