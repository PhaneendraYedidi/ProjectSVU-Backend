import { uploadQuestions } from "../src/controllers/question.controller";
import { Request, Response } from "express";
import mongoose from "mongoose";
import Question from "../src/models/Question";
import dotenv from "dotenv";

dotenv.config();

// Mock Express Request and Response
const mockRequest = (fileData: any) => {
    return {
        file: fileData,
        user: { id: "admin_id", email: "admin@example.com" } // Mock admin user
    } as unknown as Request;
};

const mockResponse = () => {
    const res: any = {};
    res.status = (code: number) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data: any) => {
        res.body = data;
        return res;
    };
    res.redirect = (url: string) => {
        res.redirectUrl = url;
        return res;
    };
    return res;
};

const runTest = async () => {
    try {
        // Connect to MongoDB (use a test DB or the dev DB if safe - BE CAREFUL)
        // For safety, we will NOT connect to the real DB in this script unless we are sure.
        // Instead, we can mock mongoose.model or Question.insertMany.
        // However, to essentially verify the parsing logic, we don't strictly need the DB if we mock Question.insertMany.

        console.log("Mocking Question.insertMany...");
        Question.insertMany = async (docs: any) => {
            console.log("Question.insertMany called with:", docs.length, "questions");
            console.log("First question sample:", docs[0]);
            return docs;
        };

        // Test Case 1: Valid JSON Upload
        console.log("\n--- Test Case 1: Valid JSON Upload ---");
        const validJson = JSON.stringify([
            {
                question: "Test Question 1",
                options: [
                    { key: "A", text: "Opt A" },
                    { key: "B", text: "Opt B" },
                    { key: "C", text: "Opt C" },
                    { key: "D", text: "Opt D" }
                ],
                correctAnswer: "A",
                subject: "Test",
                tags: ["tag1"],
                year: 2024
            }
        ]);

        const req1 = mockRequest({
            buffer: Buffer.from(validJson),
            mimetype: "application/json",
            originalname: "test.json"
        });
        const res1 = mockResponse();

        await uploadQuestions(req1, res1 as Response);

        if (res1.redirectUrl === "/admin/questions") {
            console.log("✅ Success: Redirected to /admin/questions");
        } else {
            console.log("❌ Failed: Did not redirect. Body:", res1.body);
        }

        // Test Case 2: Invalid JSON (Not an array)
        console.log("\n--- Test Case 2: Invalid JSON (Not an array) ---");
        const invalidJson = JSON.stringify({ key: "value" });
        const req2 = mockRequest({
            buffer: Buffer.from(invalidJson),
            mimetype: "application/json",
            originalname: "invalid.json"
        });
        const res2 = mockResponse();

        await uploadQuestions(req2, res2 as Response);

        if (res2.statusCode === 400) {
            console.log("✅ Success: Returned 400 for invalid JSON");
        } else {
            console.log("❌ Failed: Expected 400. Got:", res2.statusCode);
        }

    } catch (err) {
        console.error("Test execution failed:", err);
    }
};

runTest();
