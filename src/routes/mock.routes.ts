import { Router } from "express";
import crypto from "crypto";
import Question from "../models/Question";
import PracticeSession from "../models/PracticeSession";
import User from "../models/User";
import QuestionAttempt from "../models/QuestionAttempt";
import { MockTest } from "../models/MockTest";
import auth from "../middleware/auth.middleware";
import { enforceSubscription } from "../middleware/subscription.middleware";

const router = Router();

router.post("/start", auth, enforceSubscription({ requirePremium: true }),async (req, res) => {
  const user = req.user!;

  const TOTAL_QUESTIONS = 20;

  const questions = await Question.aggregate([
    { $match: { isActive: true } },
    { $sample: { size: TOTAL_QUESTIONS } }
  ]);

  const mockTest = await MockTest.create({
    user: user.id,
    questions: questions.map(q => q._id)
  });

  const sanitizedQuestions = questions.map(q => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    difficulty: q.difficulty,
    subject: q.subject
    // ❌ correctAnswer NOT sent
  }));

  res.json({
    mockTestId: mockTest._id,
    questions: sanitizedQuestions
  });
});


// router.post("/start", async (req, res) => {
//   const { userId, duration = 1800, year } = req.body;

//   const sessionId = crypto.randomUUID();

//     let limit = 5; // default free limit
//     if (userId) {
//         const user = await User.findById(userId);
//         if (user && user.subscription !== "free") {
//             limit = 1000000; // unlimited
//         }
//     }

//   const filter: any = {};
//   if (year) filter.year = year;

//   const questions = await Question.aggregate([
//     { $match: filter },
//     { $sample: { size: limit } }
//   ]);

//   await PracticeSession.create({
//     userId,
//     sessionId,
//     questionLimit: limit,
//     questionsServed: questions.map(q => q._id),
//     isActive: true
//   });

//   res.json({
//     sessionId,
//     duration,
//     questions
//   });
// });

router.post("/:id/submit", auth, async (req, res) => {
  const user = req.user!;
  const { answers } = req.body;

  const mockTest = await MockTest.findOne({
    _id: req.params.id,
    user: user.id,
    status: "IN_PROGRESS"
  });

  if (!mockTest) {
    return res.status(404).json({ message: "Mock test not found" });
  }

  const questions = await Question.find({
    _id: { $in: mockTest.questions }
  });

  let score = 0;

  questions.forEach(q => {
    if (answers[q._id.toString()] === q.correctAnswer) {
      score++;
    }
  });

  mockTest.answers = answers;
  mockTest.score = score;
  mockTest.total = questions.length;
  mockTest.status = "SUBMITTED";
  mockTest.submittedAt = new Date();

  await mockTest.save();

  res.json({
    score,
    total: questions.length,
    percentage: ((score / questions.length) * 100).toFixed(2)
  });
});


// router.post("/submit", async (req, res) => {
//   const { sessionId } = req.body;

//   const session = await PracticeSession.findOne({ sessionId });

//   if (!session || !session.isActive) {
//     return res.status(400).json({ message: "Invalid session" });
//   }

//   session.isActive = false;
//   await session.save();

//   const attempts = await PracticeAttempt.find({ sessionId });

//   const correct = attempts.filter(a => a.isCorrect).length;
//   const wrong = attempts.length - correct;
//   const unattempted =
//     session.questionLimit - attempts.length;

//   res.json({
//     total: session.questionLimit,
//     attempted: attempts.length,
//     correct,
//     wrong,
//     unattempted,
//     score: correct
//   });
// });

// router.get("/result/:sessionId", async (req, res) => {
//   const { sessionId } = req.params;

//   const session = await PracticeSession.findOne({ sessionId });
//   const attempts = await PracticeAttempt.find({ sessionId });

//   const totalTime = attempts.reduce(
//     (sum, a) => sum + a.timeTaken,
//     0
//   );

//   const correct = attempts.filter(a => a.isCorrect).length;

//   res.json({
//     totalQuestions: session?.questionLimit,
//     attempted: attempts.length,
//     correct,
//     wrong: attempts.length - correct,
//     accuracy:
//       attempts.length > 0
//         ? ((correct / attempts.length) * 100).toFixed(2)
//         : 0,
//     totalTime
//   });
// });

export default router;
