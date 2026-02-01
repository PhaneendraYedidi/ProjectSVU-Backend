import User from "../models/User";

export const getReferralDashboard = async (req, res) => {
  const userId = req.user!.id;

  const user = await User.findById(userId);

  const referredUsers = await User.find({ referredBy: userId })
    .select("name email subscription createdAt");

  res.json({
    referralCode: user!.referralCode,
    referralCount: user!.referralCount,
    referralEarnings: user.referralEarnings,
    referredUsers
  });
};
