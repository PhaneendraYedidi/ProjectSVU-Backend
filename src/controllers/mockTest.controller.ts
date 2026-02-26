import { Request, Response } from "express";
import { MockTestTemplate } from "../models/MockTestTemplate";
import Question from "../models/Question";
import { MockTest } from "../models/MockTest";

// --- ADMIN CONTROLLERS ---

export const getCreateMockTestPage = async (req: Request, res: Response) => {
    try {
        const { subject, year, search } = req.query;
        const filter: any = { isActive: true };

        if (subject) filter.subject = subject;
        if (year) filter.year = Number(year);
        if (search) filter.question = { $regex: search, $options: "i" };

        // Limit questions shown in the selector to avoid page bloat
        const questions = await Question.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        const subjects = await Question.distinct("subject");
        const years = await Question.distinct("year");

        res.render("admin/createMockTest", {
            questions,
            subjects,
            years,
            filter: { subject, year, search }
        });
    } catch (err) {
        console.error("Error loading create mock test page:", err);
        res.status(500).send("Server Error");
    }
};

export const createMockTest = async (req: Request, res: Response) => {
    try {
        const { title, description, duration, questionIds } = req.body;

        // Ensure questionIds is an array
        const qIds = Array.isArray(questionIds) ? questionIds : [questionIds];

        await MockTestTemplate.create({
            title,
            description,
            duration: Number(duration),
            questions: qIds,
            isActive: true
        });

        res.redirect("/admin/mock-tests");
    } catch (err) {
        console.error("Error creating mock test:", err);
        res.status(500).send("Failed to create mock test");
    }
};

export const listMockTestsAdmin = async (req: Request, res: Response) => {
    try {
        const mockTests = await MockTestTemplate.find().sort({ createdAt: -1 });
        res.render("admin/mockTests", { mockTests });
    } catch (err) {
        console.error("Error listing mock tests:", err);
        res.status(500).send("Server Error");
    }
};

export const deleteMockTest = async (req: Request, res: Response) => {
    try {
        await MockTestTemplate.findByIdAndDelete(req.params.id);
        res.redirect("/admin/mock-tests");
    } catch (err) {
        console.error("Error deleting mock test:", err);
        res.status(500).send("Failed to delete mock test");
    }
};

export const getEditMockTestPage = async (req: Request, res: Response) => {
    try {
        const mockTest = await MockTestTemplate.findById(req.params.id).populate("questions");
        if (!mockTest) {
            return res.status(404).send("Mock Test not found");
        }

        const { subject, year, search } = req.query;
        const filter: any = { isActive: true };

        if (subject) filter.subject = subject;
        if (year) filter.year = Number(year);
        if (search) filter.question = { $regex: search, $options: "i" };

        const questions = await Question.find(filter)
            .sort({ createdAt: -1 })
            .limit(100);

        const subjects = await Question.distinct("subject");
        const years = await Question.distinct("year");

        // Map the current questions to an array of string IDs for easy checking
        const selectedQuestionIds = mockTest.questions.map((q: any) => q._id.toString());

        res.render("admin/editMockTest", {
            mockTest,
            questions,
            subjects,
            years,
            selectedQuestionIds,
            filter: { subject, year, search }
        });
    } catch (err) {
        console.error("Error loading edit mock test page:", err);
        res.status(500).send("Server Error");
    }
};

export const editMockTest = async (req: Request, res: Response) => {
    try {
        const { title, description, duration, questionIds } = req.body;

        const qIds = Array.isArray(questionIds) ? questionIds : [questionIds];

        await MockTestTemplate.findByIdAndUpdate(req.params.id, {
            title,
            description,
            duration: Number(duration),
            questions: qIds,
        });

        res.redirect("/admin/mock-tests");
    } catch (err) {
        console.error("Error updating mock test:", err);
        res.status(500).send("Failed to update mock test");
    }
};

// --- API CONTROLLERS (Mobile) ---

export const listActiveMockTests = async (req: Request, res: Response) => {
    try {
        const tests = await MockTestTemplate.find({ isActive: true })
            .select("-questions") // Don't send questions in list
            .sort({ createdAt: -1 })
            .lean(); // Use lean to add custom properties

        const userAttempts = await MockTest.find({ user: req.user!.id });
        const attemptMap = new Map();

        userAttempts.forEach(attempt => {
            const tId = attempt.templateId?.toString();
            if (tId) {
                const existing = attemptMap.get(tId);
                // Prefer SUBMITTED over IN_PROGRESS if there are multiple attempts
                if (!existing || existing.status === 'IN_PROGRESS' || attempt.status === 'SUBMITTED') {
                    attemptMap.set(tId, {
                        status: attempt.status,
                        score: attempt.score,
                        total: attempt.total
                    });
                }
            }
        });

        const testsWithStatus = tests.map(test => {
            const attempt = attemptMap.get(test._id.toString());
            return {
                ...test,
                status: attempt?.status || "NOT_STARTED",
                score: attempt?.score,
                total: attempt?.total
            };
        });

        res.json(testsWithStatus);
    } catch (err) {
        console.error("Error listing active mock tests:", err);
        res.status(500).json({ message: "Server Error" });
    }
};

export const startMockTestFromTemplate = async (req: Request, res: Response) => {
    try {
        const { templateId } = req.params;
        const user = req.user!;

        const template = await MockTestTemplate.findById(templateId).populate("questions");
        if (!template) {
            return res.status(404).json({ message: "Mock Test not found" });
        }

        // Create a new attempt
        const mockTestAttempt = await MockTest.create({
            user: user.id,
            templateId: template._id,
            questions: template.questions.map((q: any) => q._id),
            startedAt: new Date(),
            status: "IN_PROGRESS"
        });

        // Sanitize questions (remove correct answer)
        const sanitizedQuestions = template.questions.map((q: any) => ({
            _id: q._id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            subject: q.subject
        }));

        res.json({
            mockTestId: mockTestAttempt._id,
            questions: sanitizedQuestions,
            duration: template.duration,
            title: template.title
        });
    } catch (err) {
        console.error("Error starting mock test:", err);
        res.status(500).json({ message: "Server Error" });
    }
};
