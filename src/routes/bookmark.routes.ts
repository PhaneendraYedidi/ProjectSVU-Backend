import express from "express";
import User from "../models/User";
import auth, { AuthRequest } from "../middleware/auth.middleware";

const router = express.Router();

/* ADD BOOKMARK */
router.post("/:questionId", auth, async (req: AuthRequest, res) => {
  const { questionId } = req.params;

  await User.findByIdAndUpdate(req.user!.id, {
    $addToSet: { bookmarks: questionId }
  });

  res.json({ success: true });
});

/* REMOVE BOOKMARK */
router.delete("/:questionId", auth, async (req: AuthRequest, res) => {
  const { questionId } = req.params;

  await User.findByIdAndUpdate(req.user!.id, {
    $pull: { bookmarks: questionId }
  });

  res.json({ success: true });
});

/* GET BOOKMARKS */
router.get("/", auth, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user!.id)
    .populate("bookmarks");

  res.json(user?.bookmarks || []);
});

export default router;
