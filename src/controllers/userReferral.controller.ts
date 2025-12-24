import User from "../models/User";

export const getReferralDashboard = async (req, res) => {
  const user = req.user!;

  const referredUsers = await User.find({ referredBy: user._id })
    .select("name email subscription createdAt");

  res.json({
    referralCode: user.referralCode,
    referralCount: user.referralCount,
    referralEarnings: user.referralEarnings,
    referredUsers
  });
};
