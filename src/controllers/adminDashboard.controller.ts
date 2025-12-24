import User from "../models/User";

export const adminReferralDashboard = async (req, res) => {
  // Fetch referrers
  const referrers = await User.find({ referralCount: { $gt: 0 } })
    .select("name email referralCode referralCount referralEarnings")
    .lean();

  // Attach referred users
  for (const referrer of referrers) {
    const referredUsers = await User.find({ referredBy: referrer._id })
      .select("name email subscription createdAt")
      .lean();

    referrer["referredUsers"] = referredUsers;
  }

  res.render("admin/adminReferrals", { referrers });
};


export const adminDashboard = async (req, res) => {
  const [
    totalUsers,
    premiumUsers,
    freeUsers,
    totalReferralEarnings,
    topReferrers
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ subscription: "premium" }),
    User.countDocuments({ subscription: "free" }),
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: "$referralEarnings" }
        }
      }
    ]),
    User.find({ referralCount: { $gt: 0 } })
      .sort({ referralCount: -1 })
      .limit(10)
      .select("name email referralCount referralEarnings")
  ]);

  res.render("admin/adminDashboard", {
    totalUsers,
    premiumUsers,
    freeUsers,
    totalRevenue: premiumUsers * 999, // or from payments later
    totalReferralEarnings: totalReferralEarnings[0]?.total || 0,
    topReferrers
  });
};
