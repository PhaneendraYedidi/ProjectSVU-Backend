import express from "express";
import auth from "../middleware/auth.middleware";
import { getProfile } from "../controllers/user.controller";

const router = express.Router();

router.get("/profile", auth, getProfile);

export default router;