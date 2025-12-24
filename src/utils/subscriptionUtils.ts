export const normalizeSubscription = async (user) => {
  if (
    user.subscription === "premium" &&
    user.subscriptionEnd &&
    user.subscriptionEnd < new Date()
  ) {
    user.subscription = "free";
    user.subscriptionStart = undefined;
    user.subscriptionEnd = undefined;
    await user.save();
  }
};
