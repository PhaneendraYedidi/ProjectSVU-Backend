import express from "express";
import auth from "../middleware/auth.middleware";
import { getProfile, getMyInfo } from "../controllers/user.controller";
import { getReferralDashboard } from "../controllers/userReferral.controller";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.get("/me", auth, getMyInfo);
router.get("/referrals", auth, getReferralDashboard);


export default router;