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

export const updateProfile = async (req, res) => {
  const userId = req.user?.id;
  const { name, phone } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};
