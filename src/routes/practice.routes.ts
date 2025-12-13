import express, { Request, Response } from "express";
import Question from "../models/Question";
import PracticeAttempt from "../models/PracticeAttempt";
import User from "../models/User";

const router = express.Router();

/**
 * GET /api/practice/questions
 */
router.get("/questions", async (req: Request, res: Response) => {
  const { mode, topic, year } = req.query;

  const filter: any = { isActive: true };

  if (mode === "topic") filter.topic = topic;
  if (mode === "year") filter.year = Number(year);

  const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: 5 } }
  ]);

  res.json(questions);
});

/**
 * POST /api/practice/submit
 */
router.post("/submit", async (req: Request, res: Response) => {
  const {
    userId,
    questionId,
    selectedOption,
    timeTaken,
    mode,
    topic,
    year
  } = req.body;

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const isCorrect = question.correctOption === selectedOption;

  await PracticeAttempt.create({
    userId,
    questionId,
    selectedOption,
    isCorrect,
    timeTaken,
    mode,
    topic,
    year
  });

  res.json({
    isCorrect,
    correctOption: question.correctOption,
    explanation: question.explanation
  });
});

/**
 * POST /api/practice/bookmark
 */
router.post("/bookmark", async (req: Request, res: Response) => {
  const { userId, questionId } = req.body;

  await User.findByIdAndUpdate(userId, {
    $addToSet: { bookmarks: questionId }
  });

  res.json({ success: true });
});

export default router;
