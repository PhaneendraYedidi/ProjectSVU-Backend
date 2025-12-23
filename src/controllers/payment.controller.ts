import razorpay from "../config/razorpay";

export const createOrder = async (req, res) => {
  const order = await razorpay.orders.create({
    amount: 5 * 100,
    currency: "INR",
    receipt: `order_${Date.now()}`,
    notes: {
      userId: req.user!._id.toString(),
      referralCode: req.body.referralCode || ""
  }
  });

  res.json(order);
};

