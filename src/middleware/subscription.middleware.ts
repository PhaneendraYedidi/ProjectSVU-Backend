import { Request, Response, NextFunction } from "express";
import User from "../models/User";

const FREE_DAILY_LIMIT = 1;

export const enforceSubscription = (
  options: {
    requirePremium?: boolean;
    freeDailyLimit?: number;
  } = {}
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const user = await User.findById(userId);

      if (!user || !user.isActive) {
        return res.status(403).json({ message: "User not active" });
      }

      const now = new Date();

      // 🔒 AUTO DOWNGRADE IF SUBSCRIPTION EXPIRED
      if (
        user.subscription === "premium" &&
        user.subscriptionEnd &&
        user.subscriptionEnd < now
      ) {
        user.subscription = "free";
        user.subscriptionStart = undefined;
        user.subscriptionEnd = undefined;
        await user.save();
      }

      const isPremium =
        user.subscription === "premium" &&
        user.subscriptionEnd &&
        user.subscriptionEnd > now;

      // 🔐 PREMIUM ONLY ROUTE
      if (options.requirePremium && !isPremium) {
        return res.status(403).json({
          message: "Premium subscription required"
        });
      }

      // 🆓 FREE DAILY LIMIT CHECK
      if (!isPremium) {
        const limit = options.freeDailyLimit ?? FREE_DAILY_LIMIT;
        const today = now.toDateString();

        if (
          !user.dailyFreeFetchDate ||
          user.dailyFreeFetchDate.toDateString() !== today
        ) {
          user.dailyFreeFetchDate = now;
          user.dailyFreeFetchCount = 0;
        }

        if (user.dailyFreeFetchCount >= limit) {
          return res.status(429).json({
            message: "Daily free limit reached"
          });
        }

        user.dailyFreeFetchCount += 1;
        await user.save();
      }

      // Attach to request for controllers
      req.subscription = {
        isPremium,
        subscription: user.subscription
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
