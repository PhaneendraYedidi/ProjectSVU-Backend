import { Request, Response } from "express";
import { parseExcelBuffer } from "../utils/excelParser";
import Question from "../models/Question";
import { AuthRequest } from "../middleware/auth.middleware";

export const uploadQuestions = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "File missing" });
        }

        let questions = [];

        // Check mime type or extension
        const mimeType = req.file.mimetype;
        const originalName = req.file.originalname.toLowerCase();

        if (
            mimeType === "application/json" ||
            originalName.endsWith(".json")
        ) {
            // Parse JSON
            const jsonString = req.file.buffer.toString("utf-8");
            questions = JSON.parse(jsonString);

            // Basic validation for JSON structure
            if (!Array.isArray(questions)) {
                throw new Error("JSON file must contain an array of questions");
            }

            // Optional: Validate each question object against schema or required fields
            // For now, we rely on Mongoose schema validation during insert

        } else if (
            mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            originalName.endsWith(".xlsx")
        ) {
            // Parse Excel
            questions = parseExcelBuffer(req.file.buffer);
        } else {
            return res.status(400).json({ message: "Invalid file type. Only .xlsx and .json are supported." });
        }

        if (questions.length === 0) {
            return res.status(400).json({ message: "No questions found in file" });
        }

        await Question.insertMany(questions, { ordered: false });

        res.redirect("/admin/questions");
    } catch (error: any) {
        console.error("Upload Error:", error);
        res.status(400).json({ message: error.message || "Upload failed" });
    }
};
