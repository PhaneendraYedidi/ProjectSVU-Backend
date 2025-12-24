import express, { Request, Response } from "express";
import Question from "../models/Question";
import QuestionAttempt from "../models/QuestionAttempt";
import User from "../models/User";
import auth from "../middleware/auth.middleware";
import crypto from "crypto";
import PracticeSession from "../models/PracticeSession";
import { enforceSubscription } from "../middleware/subscription.middleware";

const router = express.Router();

/**
 * GET /api/practice/questions
 */
function isSameDay(d1: Date, d2: Date) {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

router.get("/questions", auth, enforceSubscription({ freeDailyLimit: 1 }), async (req, res) => {
  try {
    //const user = req.user;
    const user = await User.findById(req.user!.id)

      if (user === null) {
        return res.status(400).json({ message: "User not exists" });
      }

    const { mode, topic, year, page = 1 } = req.query;

    const now = new Date();

    /* ---------------- FREE USER ---------------- */
    if (user.subscription === "free") {
      // Reset counter if new day
      if (
        !user.dailyFreeFetchDate ||
        !isSameDay(user.dailyFreeFetchDate, now)
      ) {
        user.dailyFreeFetchDate = now;
        user.dailyFreeFetchCount = 0;
      }

      // Stop if already fetched today
      if ((user.dailyFreeFetchCount || 0) >= 1) {
        return res.status(403).json({
          message: "Daily free limit reached"
        });
      }

      const match: any = { isActive: true };
      if (mode === "topic" && topic) match.subject = topic;
      if (mode === "year" && year) match.year = Number(year);

      const questions = await Question.aggregate([
        { $match: match },
        { $sample: { size: 5 } }
      ]);

      user.dailyFreeFetchCount = 1;
      await user.save();

      return res.json({
        subscription: "free",
        questions
      });
    }

    /* ---------------- PREMIUM USER ---------------- */
    const LIMIT = 20;
    const skip = (Number(page) - 1) * LIMIT;

    const match: any = { isActive: true };
    if (mode === "topic" && topic) match.subject = topic;
    if (mode === "year" && year) match.year = Number(year);

    const questions = await Question.aggregate([
      { $match: match },
      { $sample: { size: 1000 } },
      { $skip: skip },
      { $limit: LIMIT }
    ]);

    return res.json({
      subscription: "premium",
      page: Number(page),
      count: questions.length,
      questions
    });
  } catch (err) {
    console.error("Practice questions error:", err);
    res.status(500).json({ message: "Failed to fetch questions" });
  }
});


/**
 * POST /api/practice/submit
 */
router.post("/submit", auth, async (req: Request, res: Response) => {
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

  await QuestionAttempt.create({
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

router.post("/subscription/upgrade", auth, async (req, res) => {
  await User.findByIdAndUpdate(req.user!.id, {
    subscription: "premium"
  });

  res.json({ message: "Subscription upgraded successfully" });
});


/**
 * POST /api/practice/bookmark
 */
router.post("/bookmark", auth, async (req: Request, res: Response) => {
  const { userId, questionId } = req.body;

  await User.findByIdAndUpdate(userId, {
    $addToSet: { bookmarks: questionId }
  });

  res.json({ success: true });
});

/* START SESSION */
router.post("/start", async (req, res) => {
  const includeQuestions = req.query.includeQuestions === "true";

  const {
    userId,
    mode,
    topics,
    year,
  } = req.body;
  let limit = 5; // default free limit

  if (userId) {
    const user = await User.findById(userId);
    if (user && user.subscription !== "free") {
      limit = 1000000; // unlimited
    }
  }

  const sessionId = crypto.randomUUID();

  const filter = buildQuestionFilter(mode, topics, year);

  let questions: any[] = [];

  if (includeQuestions) {
    questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: limit } }
    ]);
  }

  await PracticeSession.create({
    userId,
    sessionId,
    questionLimit: limit,
    questionsServed: questions.map(q => q._id),
    isActive: true
  });

  res.json({
    sessionId,
    ...(includeQuestions && { questions })
  });
});

function buildQuestionFilter(
  mode: string,
  topics?: string[],
  year?: number
) {
  const filter: any = {};

  if (mode === "TOPIC" && topics?.length) {
    filter.tags = { $in: topics };
  }

  if (mode === "YEAR" && year) {
    filter.year = year;
  }

  return filter;
}

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

  await QuestionAttempt.create({
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

router.get("/session/:sessionId/stats", async (req, res) => {
  const { sessionId } = req.params;

  const session = await PracticeSession.findOne({ sessionId });

  if (!session) {
    return res.status(404).json({ message: "Session not found" });
  }

  const attempts = await QuestionAttempt.find({ sessionId });

  const attempted = attempts.length;
  const correct = attempts.filter(a => a.isCorrect).length;
  const wrong = attempted - correct;

  const totalTime = attempts.reduce(
    (sum, a) => sum + (a.timeTaken || 0),
    0
  );

  res.json({
    sessionId,
    totalQuestions: session.questionsServed.length,
    attempted,
    correct,
    wrong,
    accuracy:
      attempted > 0
        ? Number(((correct / attempted) * 100).toFixed(2))
        : 0,
    totalTime,
    avgTime:
      attempted > 0
        ? Math.round(totalTime / attempted)
        : 0
  });
});

router.get("/filters", async (_, res) => {
  const topics = await Question.distinct("tags");
  const years = await Question.distinct("year");

  res.json({
    topics,
    years: years.sort((a, b) => b - a)
  });
});

export default router;
