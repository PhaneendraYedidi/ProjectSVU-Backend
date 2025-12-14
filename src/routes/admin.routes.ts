import express, { Response } from "express";
import { upload } from "../middleware/upload.middleware";
import { authMiddleware, AuthRequest } from "../middleware/auth.middleware";
import { parseExcelBuffer } from "../utils/excelParser";
import Question from "../models/Question";
import User from "../models/User";

const router = express.Router();

router.post(
  "/upload-questions",
  authMiddleware,
  upload.single("file"),
  async (req: AuthRequest, res: Response) => {
    try {
      const user = await User.findById(req.userId);
      if (!user || user.subscription !== "admin") {
        return res.status(403).json({ message: "Admin only" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "Excel file missing" });
      }

      const questions = parseExcelBuffer(req.file.buffer);

      await Question.insertMany(questions, { ordered: false });

      res.json({
        message: "Upload successful",
        count: questions.length
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
);

export default router;
