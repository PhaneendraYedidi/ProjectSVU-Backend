import express, { Response } from "express";
import { upload } from "../middleware/upload.middleware";
import auth, { AuthRequest } from "../middleware/auth.middleware";
import { parseExcelBuffer } from "../utils/excelParser";
import Question from "../models/Question";
import User from "../models/User";
import { adminAuth } from "../middleware/adminAuth.middleware";
const router = express.Router();
import Admin from "../models/Admin";
import bcrypt from "bcrypt";
import { adminDashboard, adminReferralDashboard } from "../controllers/adminDashboard.controller";
import { uploadQuestions } from "../controllers/question.controller";
import {
  createMockTest,
  deleteMockTest,
  getCreateMockTestPage,
  listMockTestsAdmin,
  getEditMockTestPage,
  editMockTest
} from "../controllers/mockTest.controller";

/* SIGNUP PAGE */
router.get("/signup", (req, res) => {
  res.render("admin/signup", { error: null });
});

/* SIGNUP SUBMIT */
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const existing = await Admin.findOne({ email });
  if (existing) {
    return res.render("admin/signup", {
      error: "Admin already exists"
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await Admin.create({
    email,
    password: hashedPassword
  });

  res.redirect("/admin/login");
});

/* LOGIN PAGE */
router.get("/login", (req, res) => {
  res.render("admin/login", { error: null });
});

/* LOGIN SUBMIT */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email });
  if (!admin) {
    return res.render("admin/login", {
      error: "Invalid email or password"
    });
  }

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) {
    return res.render("admin/login", {
      error: "Invalid email or password"
    });
  }

  req.session.admin = {
    id: admin._id.toString(),
    email: admin.email
  };

  res.redirect("/admin/questions");
});

/* LOGOUT */
router.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
});

/* UPLOAD PAGE */
router.get("/upload", (req, res) => {
  res.render("admin/upload", { error: null });
});

router.post(
  "/upload-questions",
  adminAuth,
  upload.single("file"),
  uploadQuestions
);

router.get("/questions", adminAuth, async (req, res) => {
  const { page = 1, search = "", year } = req.query;

  const limit = 20;
  const skip = (Number(page) - 1) * limit;

  const filter: any = {};

  if (search) {
    filter.question = { $regex: search, $options: "i" };
  }

  if (year) {
    filter.year = Number(year);
  }

  const questions = await Question.find(filter)
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 });

  const total = await Question.countDocuments(filter);

  res.render("admin/questions", {
    questions,
    page: Number(page),
    totalPages: Math.ceil(total / limit),
    search,
    year
  });
});

router.get("/questions/:id/edit", adminAuth, async (req, res) => {
  const question = await Question.findById(req.params.id);
  res.render("admin/editQuestion", { question });
});

router.post("/questions/:id/edit", adminAuth, async (req, res) => {
  try {
    const { options, tags, isActive, ...rest } = req.body;

    // 1️⃣ Convert options object → array
    const formattedOptions = Object.entries(options).map(
      ([key, text]) => ({
        key,
        text
      })
    );

    // 2️⃣ Convert tags string → array
    const formattedTags = tags
      ? tags.split(",").map((t: string) => t.trim())
      : [];

    // 3️⃣ Convert isActive → boolean
    const active =
      isActive === "true" || isActive === true;

    // 4️⃣ Final update payload
    const updateData = {
      ...rest,
      options: formattedOptions,
      tags: formattedTags,
      isActive: active
    };

    await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.redirect("/admin/questions");
  } catch (err) {
    console.error("Edit Question Error:", err);
    res.status(500).send("Failed to update question");
  }
});


router.post(
  "/questions/:id/delete",
  adminAuth,
  async (req, res) => {
    await Question.findByIdAndDelete(req.params.id);
    res.redirect("/admin/questions");
  }
);

router.get("/dashboard", adminAuth, adminDashboard);
router.get("/referrals", adminAuth, adminReferralDashboard);

/* MOCK TESTS */
router.get("/mock-tests", adminAuth, listMockTestsAdmin);
router.get("/create-mock-test", adminAuth, getCreateMockTestPage);
router.post("/create-mock-test", adminAuth, createMockTest);
router.get("/mock-tests/:id/edit", adminAuth, getEditMockTestPage);
router.post("/mock-tests/:id/edit", adminAuth, editMockTest);
router.post("/mock-tests/:id/delete", adminAuth, deleteMockTest);

export default router;
