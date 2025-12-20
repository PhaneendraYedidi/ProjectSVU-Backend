import { Router } from "express";
import crypto from "crypto";
import Question from "../models/Question";
import PracticeSession from "../models/PracticeSession";
import User from "../models/User";
import PracticeAttempt from "../models/PracticeAttempt";

const router = Router();

router.post("/start", async (req, res) => {
  const { userId, duration = 1800, year } = req.body;

  const sessionId = crypto.randomUUID();

    let limit = 5; // default free limit
    if (userId) {
        const user = await User.findById(userId);
        if (user && user.subscription !== "free") {
            limit = 1000000; // unlimited
        }
    }

  const filter: any = {};
  if (year) filter.year = year;

  const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: limit } }
  ]);

  await PracticeSession.create({
    userId,
    sessionId,
    questionLimit: limit,
    questionsServed: questions.map(q => q._id),
    isActive: true
  });

  res.json({
    sessionId,
    duration,
    questions
  });
});

router.post("/submit", async (req, res) => {
  const { sessionId } = req.body;

  const session = await PracticeSession.findOne({ sessionId });

  if (!session || !session.isActive) {
    return res.status(400).json({ message: "Invalid session" });
  }

  session.isActive = false;
  await session.save();

  const attempts = await PracticeAttempt.find({ sessionId });

  const correct = attempts.filter(a => a.isCorrect).length;
  const wrong = attempts.length - correct;
  const unattempted =
    session.questionLimit - attempts.length;

  res.json({
    total: session.questionLimit,
    attempted: attempts.length,
    correct,
    wrong,
    unattempted,
    score: correct
  });
});

router.get("/result/:sessionId", async (req, res) => {
  const { sessionId } = req.params;

  const session = await PracticeSession.findOne({ sessionId });
  const attempts = await PracticeAttempt.find({ sessionId });

  const totalTime = attempts.reduce(
    (sum, a) => sum + a.timeTaken,
    0
  );

  const correct = attempts.filter(a => a.isCorrect).length;

  res.json({
    totalQuestions: session?.questionLimit,
    attempted: attempts.length,
    correct,
    wrong: attempts.length - correct,
    accuracy:
      attempts.length > 0
        ? ((correct / attempts.length) * 100).toFixed(2)
        : 0,
    totalTime
  });
});

export default router;
