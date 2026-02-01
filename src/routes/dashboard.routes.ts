import express, { Request, Response } from "express";
import mongoose from "mongoose";
import QuestionAttempt from "../models/QuestionAttempt";
import auth from "../middleware/auth.middleware";
import { MockTest } from "../models/MockTest";

const router = express.Router();

router.get("/summary", auth, async (req, res) => {
  const userIdStr = req.user!.id;
  const userId = new mongoose.Types.ObjectId(userIdStr);

  const [
    totalPractice,
    correctPractice,
    totalMocks,
    avgMockScore,
    subjectStats
  ] = await Promise.all([
    QuestionAttempt.countDocuments({ userId: userIdStr }),

    QuestionAttempt.countDocuments({
      userId: userIdStr,
      isCorrect: true
    }),

    MockTest.countDocuments({
      user: userIdStr,
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
    totalAttempted: totalPractice,
    accuracy:
      totalPractice === 0
        ? 0
        : Math.round((correctPractice / totalPractice) * 100),

    totalMocks,
    avgMockScore: avgMockScore[0]?.avgScore ? Math.round(avgMockScore[0].avgScore * 10) / 10 : 0,
    subjectStats
  });
});

export default router;