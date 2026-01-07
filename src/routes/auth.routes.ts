import express, { Request, Response } from "express";
import bcrypt from "bcrypt";
import User from "../models/User";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt";
import crypto from "crypto";

const router = express.Router();

const generateReferralCode = () =>
  crypto.randomBytes(4).toString("hex").toUpperCase();

/**
 * POST /api/auth/signup
 */
router.post("/signup", async (req: Request, res: Response) => {
  const { name, phone, email, password, referralCode } = req.body;

  const existingUser = await User.findOne({ $or: [{ phone }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const referrer = await User.findOne({ referralCode });

  const user = await User.create({
    name,
    phone,
    email,
    password: hashedPassword,
    referralCode: generateReferralCode(),
    referredBy: referrer ? referrer._id : undefined
  });

  const token = signAccessToken({
    userId: user._id,
    role: "user"
  });

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

  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const accessToken = signAccessToken({
    userId: user._id,
    role: "user"
  });

  const refreshToken = signRefreshToken({
    userId: user._id
  });

  res.json({
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email
    },
    accessToken,
    refreshToken,
    subscription: {
      plan: user.subscription,
      expiresAt: user.subscriptionEnd
    }
  });
});

/**
 * POST /api/auth/refresh
 */
router.post("/refresh", async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = verifyRefreshToken(refreshToken) as any;

    const user = await User.findById(decoded.userId);
    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid user" });
    }

    const newAccessToken = signAccessToken({
      userId: user._id,
      role: "user"
    });

    const newRefreshToken = signRefreshToken({
      userId: user._id
    });

    res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      subscription: {
        plan: user.subscription,
        expiresAt: user.subscriptionEnd
      }
    });
  } catch (err) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});



export default router;
