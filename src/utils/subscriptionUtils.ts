export const normalizeSubscription = async (user) => {
  if (
    user.subscription === "PREMIUM" &&
    user.subscriptionEnd &&
    user.subscriptionEnd < new Date()
  ) {
    user.subscription = "FREE";
    user.subscriptionStart = undefined;
    user.subscriptionEnd = undefined;
    await user.save();
  }
};
