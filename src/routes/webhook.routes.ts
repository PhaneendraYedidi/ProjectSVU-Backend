import express from "express";
import { razorpayWebhook } from "../controllers/webhook.controller";

const router = express.Router();

router.post("/razorpay", razorpayWebhook);

export default router;
