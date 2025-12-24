import express from "express";
import auth from "../middleware/auth.middleware";
import { getProfile } from "../controllers/user.controller";
import { getReferralDashboard } from "../controllers/userReferral.controller";

const router = express.Router();

router.get("/profile", auth, getProfile);

router.get("/referrals", auth, getReferralDashboard);


export default router;