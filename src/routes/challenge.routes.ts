import express from "express";
import crypto from "crypto";
import Challenge from "../models/Challenge";
import Question from "../models/Question";
import auth from "../middleware/auth.middleware";
import QuestionAttempt from "../models/QuestionAttempt"; // Re-using if needed or just storing raw score

const router = express.Router();

/**
 * GENERATE CODE
 */
const generateCode = () => crypto.randomBytes(3).toString("hex").toUpperCase();

/**
 * POST /api/challenges/create
 */
router.post("/create", auth, async (req, res) => {
    try {
        const creatorId = req.user!.id;

        // Fetch 5 random questions for the battle
        const questions = await Question.aggregate([
            { $match: { isActive: true } },
            { $sample: { size: 5 } }
        ]);

        const code = generateCode();

        const challenge = await Challenge.create({
            creator: creatorId as any,
            code,
            questions: questions.map(q => q._id),
            status: "WAITING"
        });

        res.json({
            message: "Challenge created",
            challengeId: challenge._id,
            code: challenge.code
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create challenge" });
    }
});

/**
 * POST /api/challenges/join
 */
router.post("/join", auth, async (req, res) => {
    try {
        const joinerId = req.user!.id;
        const { code } = req.body;

        const challenge = await Challenge.findOne({ code, status: "WAITING" });

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found or already started" });
        }

        if (challenge.creator.toString() === joinerId) {
            return res.status(400).json({ message: "You cannot join your own challenge" });
        }

        challenge.joiner = joinerId as any;
        challenge.status = "ACTIVE";
        await challenge.save();

        res.json({
            message: "Joined successfully",
            challengeId: challenge._id,
            questions: challenge.questions // Client should fetch details or we can populate here
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to join challenge" });
    }
});

/**
 * GET /api/challenges/:id
 * Poll this to check status (if waiting) or get questions (if active)
 */
router.get("/:id", auth, async (req, res) => {
    try {
        const challenge = await Challenge.findById(req.params.id)
            .populate("creator", "name")
            .populate("joiner", "name")
            .populate("questions", "question options"); // Do not send correct answer

        if (!challenge) {
            return res.status(404).json({ message: "Challenge not found" });
        }

        res.json(challenge);

    } catch (error) {
        res.status(500).json({ message: "Error fetching challenge" });
    }
});

/**
 * POST /api/challenges/:id/submit
 */
router.post("/:id/submit", auth, async (req, res) => {
    try {
        const userId = req.user!.id;
        const { score } = req.body; // Client sends calculated score for simplicity in v1

        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) return res.status(404).json({ message: "Not found" });

        if (challenge.creator.toString() === userId) {
            challenge.scores!.creator = score;
        } else if (challenge.joiner?.toString() === userId) {
            challenge.scores!.joiner = score;
        } else {
            return res.status(403).json({ message: "Not a participant" });
        }

        // If both submitted (simplified logic: assumption non-zero means submitted, or allow 0 updates)
        // ideally separate 'submitted' flags. For now, rely on updates.

        // Mark completed if we want? 
        // challenge.status = "COMPLETED"; 

        await challenge.save();
        res.json({ message: "Score submitted" });

    } catch (err) {
        res.status(500).json({ message: "Error submitting score" });
    }
});

export default router;
