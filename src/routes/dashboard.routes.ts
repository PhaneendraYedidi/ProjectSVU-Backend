import express, { Request, Response } from "express";
import QuestionAttempt from "../models/QuestionAttempt";
import auth from "../middleware/auth.middleware";
import { MockTest } from "../models/MockTest";

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  const userId = req.user!.id;

  const [
    totalPractice,
    correctPractice,
    totalMocks,
    avgMockScore,
    subjectStats
  ] = await Promise.all([
    QuestionAttempt.countDocuments({ userId }),

    QuestionAttempt.countDocuments({
      userId,
      isCorrect: true
    }),

    MockTest.countDocuments({
      user: userId,
      status: "SUBMITTED"
    }),

    MockTest.aggregate([
      { $match: { user: userId, status: "SUBMITTED" } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$score" }
        }
      }
    ]),

    QuestionAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$topic",
          attempted: { $sum: 1 },
          correct: {
            $sum: { $cond: ["$isCorrect", 1, 0] }
          }
        }
      }
    ])
  ]);

  res.json({
    totalPractice,
    accuracy:
      totalPractice === 0
        ? 0
        : Math.round((correctPractice / totalPractice) * 100),

    totalMocks,
    avgMockScore: avgMockScore[0]?.avgScore ?? 0,
    subjectStats
  });
});

export default router;