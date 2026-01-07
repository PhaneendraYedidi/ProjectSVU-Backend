import User from "../models/User";
import { normalizeSubscription } from "../utils/subscriptionUtils";

export const getProfile = async (req, res) => {
  const userId = req.user?.id;
  const user = await User.findById(userId);
  await normalizeSubscription(user);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    subscription: user.subscription,
    subscriptionStart: user.subscriptionStart,
    subscriptionEnd: user.subscriptionEnd,
    referralCode: user.referralCode,
    referralCount: user.referralCount
  });
};

export const getMyInfo = async (req, res) => {
  const user = req.user!;
  await normalizeSubscription(user);

  res.json({
    user: {
      id: user._id,
      name: user.name,
      phone: user.phone,
      email: user.email
    },
    subscription: {
      plan: user.subscription,
      expiresexpiresAt: user.subscriptionEnd
    }
  });
};
