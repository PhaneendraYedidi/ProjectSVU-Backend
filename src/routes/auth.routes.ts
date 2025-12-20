import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { generateToken } from "../utils/jwt";

const router = express.Router();

/**
 * POST /api/auth/signup
 */
router.post("/signup", async (req: Request, res: Response) => {
  const { name, phone, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    phone,
    email,
    password: hashedPassword
  });

  const token = generateToken(user._id.toString());

  res.status(201).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email
    }
  });
});

/**
 * POST /api/auth/login
 */
router.post("/login", async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = generateToken(user._id.toString());

  res.json({
    token,
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email
    }
  });
});

export default router;
