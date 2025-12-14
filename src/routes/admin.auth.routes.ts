import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import path from "path";
import User from "../models/User";

const router = express.Router();

/* RENDER SIGNUP PAGE */
router.get("/signup", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../views/signup.html"));
});

/* RENDER LOGIN PAGE */
router.get("/login", (_req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../views/login.html"));
});

/* ADMIN SIGNUP */
router.post("/signup", async (req: Request, res: Response) => {
  const { name, phone, email, password } = req.body;

  const existing = await User.findOne({ email });
  if (existing) return res.send("Admin already exists");

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    subscription: "admin"
  });

  res.redirect("/admin/login");
});

/* ADMIN LOGIN */
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const admin = await User.findOne({
    email,
    subscription: "admin"
  });

  if (!admin) return res.send("Invalid credentials");

  const valid = await bcrypt.compare(password, admin.password);
  if (!valid) return res.send("Invalid credentials");

  const token = jwt.sign(
    { userId: admin._id },
    process.env.JWT_SECRET as string,
    { expiresIn: "1d" }
  );

  res.cookie("admin_token", token, {
    httpOnly: true,
    sameSite: "lax"
  });

  res.redirect("/admin/upload");
});

/* LOGOUT */
router.get("/logout", (_req, res) => {
  res.clearCookie("admin_token");
  res.redirect("/admin/login");
});

export default router;
