import { normalizeSubscription } from "../utils/subscriptionUtils";

export const getProfile = async (req, res) => {
  const user = req.user!;
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
