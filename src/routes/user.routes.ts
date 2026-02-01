import express from "express";
import auth from "../middleware/auth.middleware";
import { getProfile, getMyInfo, updateProfile } from "../controllers/user.controller";
import { getReferralDashboard } from "../controllers/userReferral.controller";

const router = express.Router();

router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);
router.get("/me", auth, getMyInfo);
router.get("/referrals", auth, getReferralDashboard);


export default router;