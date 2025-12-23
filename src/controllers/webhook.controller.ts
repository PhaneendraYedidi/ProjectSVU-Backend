import crypto from "crypto";
import { Request, Response } from "express";
import User from "../models/User";

export const razorpayWebhook = async (req: Request, res: Response) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  const signature = req.headers["x-razorpay-signature"] as string;

  const expectedSignature = crypto
    .createHmac("sha256", webhookSecret)
    .update(req.body)
    .digest("hex");

  if (expectedSignature !== signature) {
    return res.status(400).json({ message: "Invalid webhook signature" });
  }

  const event = JSON.parse(req.body.toString());

  switch (event.event) {
    case "payment.captured":
      await handlePaymentCaptured(event);
      break;

    case "payment.failed":
      console.log("Payment failed:", event.payload.payment.entity.id);
      break;

    case "refund.processed":
      console.log("Refund processed");
      break;
  }

  res.json({ status: "ok" });
};

const handlePaymentCaptured = async (event: any) => {
  const payment = event.payload.payment.entity;

  const userId = payment.notes?.userId;
  const referralCode = payment.notes?.referralCode;

  if (!userId) return;

  const user = await User.findById(userId);
  if (!user) return;

  // Upgrade subscription
  user.subscription = "premium";

  // Referral reward
  if (referralCode) {
    const referrer = await User.findOne({ referralCode });
    if (referrer) {
      user.referredBy = referrer._id;
      referrer.referralCount += 1;
      referrer.referralEarnings += 200;
      await referrer.save();
    }
  }

  await user.save();
};
