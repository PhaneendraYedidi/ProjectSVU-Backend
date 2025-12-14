import express, { Request, Response } from "express";
import Question from "../models/Question";
import PracticeAttempt from "../models/PracticeAttempt";
import User from "../models/User";
import { authMiddleware } from "../middleware/auth.middleware";
import crypto from "crypto";
import PracticeSession from "../models/PracticeSession";

const router = express.Router();

/**
 * GET /api/practice/questions
 */
router.get("/questions", authMiddleware, async (req: Request, res: Response) => {
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
router.post("/submit", authMiddleware, async (req: Request, res: Response) => {
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

  const isCorrect = question.correctAnswer === selectedOption;

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
    correctOption: question.correctAnswer,
    explanation: question.explanation
  });
});

/**
 * POST /api/practice/bookmark
 */
router.post("/bookmark", authMiddleware, async (req: Request, res: Response) => {
  const { userId, questionId } = req.body;

  await User.findByIdAndUpdate(userId, {
    $addToSet: { bookmarks: questionId }
  });

  res.json({ success: true });
});

/* START SESSION */
router.post("/start", async (req: Request, res: Response) => {
  const userId = req.body.userId || null;

  let questionLimit = 5;

  if (userId) {
    const user = await User.findById(userId);
    if (user && user.subscription !== "free") {
      questionLimit = 1000000; // unlimited
    }
  }

  const session = await PracticeSession.create({
    userId,
    sessionId: crypto.randomUUID(),
    questionLimit
  });

  res.json({
    sessionId: session.sessionId,
    remaining: questionLimit
  });
});

/* GET NEXT QUESTION */
router.get("/question", async (req: Request, res: Response) => {
  const { sessionId } = req.query;

  const session = await PracticeSession.findOne({
    sessionId,
    isActive: true
  });

  if (!session) {
    return res.status(400).json({ message: "Invalid session" });
  }

  if (session.questionsServed.length >= session.questionLimit) {
    session.isActive = false;
    await session.save();
    return res.status(403).json({ message: "Free limit reached" });
  }

  const question = await Question.aggregate([
    { $match: { _id: { $nin: session.questionsServed } } },
    { $sample: { size: 1 } }
  ]);

  if (!question.length) {
    return res.status(404).json({ message: "No more questions" });
  }

  const q = question[0];

  session.questionsServed.push(q._id);
  await session.save();

  res.json({
    questionId: q._id,
    question: q.question,
    options: q.options
  });
});

/* SUBMIT ANSWER */
router.post("/answer", async (req, res) => {
  const {
    sessionId,
    userId,
    questionId,
    selected,
    timeTaken,
    mode
  } = req.body;

  if (!sessionId || !questionId || !selected || !mode) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const session = await PracticeSession.findOne({
    sessionId,
    isActive: true
  });

  if (!session) {
    return res.status(400).json({ message: "Invalid session" });
  }

  // Ensure question was served in this session
  if (!session.questionsServed.includes(questionId)) {
    return res.status(403).json({ message: "Question not part of session" });
  }

  // Prevent duplicate attempts
  const existingAttempt = await PracticeAttempt.findOne({
    sessionId,
    questionId
  });

  if (existingAttempt) {
    return res.status(409).json({ message: "Already answered" });
  }

  const question = await Question.findById(questionId);
  if (!question) {
    return res.status(404).json({ message: "Question not found" });
  }

  const isCorrect = question.correctAnswer === selected;

  await PracticeAttempt.create({
    userId,
    sessionId,
    questionId,
    selectedOption: selected,
    isCorrect,
    timeTaken: timeTaken || 0,
    mode,
    topic: question.subject,
    year: question.year
  });

  res.json({
    correct: isCorrect,
    correctAnswer: question.correctAnswer,
    explanation: question.explanation
  });
});

export default router;
