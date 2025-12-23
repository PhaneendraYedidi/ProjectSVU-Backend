import auth from "../middleware/auth.middleware";
import express from "express";
import User from "../models/User";
import crypto from "crypto";
import razorpay from "../config/razorpay";
import { createOrder } from "../controllers/payment.controller";

const router = express.Router();

router.post("/createOrder", auth, createOrder);

router.post("/verify", auth, async (req, res) => {
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    referralCode
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({ message: "Invalid payment" });
  }

  // PAYMENT SUCCESS
  const user = await User.findById(req.user!.id);
  if (!user) return res.sendStatus(401);

  user.subscription = "premium";

  // Referral reward
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      user.referredBy = referrer._id;
      referrer.referralCount += 1;
      referrer.referralEarnings += 20; // ₹20 reward
      await referrer.save();
    }
  }

  await user.save();

  res.json({ message: "Subscription activated" });
});


export default router;
