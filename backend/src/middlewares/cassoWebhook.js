import { verifySignature } from "../utils/cassoHelper.js";
import Order from "../models/Order.model.js";
import BankTransaction from "../models/BankTransaction.model.js";

export const cassoWebhookHandler = async (req, res) => {
  const isValid = verifySignature(req);
  if (!isValid) {
    return res.status(401).json({ error: "Invalid signature" });
  }

  const { data } = req.body;
  const { id, description, amount } = data;

  try {
    // Extract order code from description (OCOP orderCode format)
    const orderCodeMatch = description.match(/OCOP\s+(\w+)/i);
    if (!orderCodeMatch) {
      return res.status(400).json({
        error: "Invalid description format. Expected 'OCOP orderCode'",
      });
    }

    const orderCode = orderCodeMatch[1];

    // Query order from models
    const order = await Order.findOne({ order_code: orderCode });
    if (!order) {
      console.log(`Order not found: ${orderCode}`);
      return res.status(404).json({
        error: "Order not found",
        orderCode,
      });
    }
    // check payment method
    if (order.payment.method !== "online") {
      console.log(
        `Order payment method is not online: ${order.payment.method}`
      );
      return res.status(400).json({
        error: "Order payment method is not online",
      });
    }
    // check payment status
    if (order.payment.status === "cod") {
      console.log(`Order payment status is cod: ${order.payment.status}`);
      return res.status(400).json({
        error: "Order payment status is cod",
      });
    }
    if (order.payment.status === "paid") {
      console.log(`Order payment status is paid: ${order.payment.status}`);
      return res.status(400).json({
        error: "Order payment status is paid",
      });
    }
    // check order status
    if (order.status !== "active") {
      console.log(`Order status is not active: ${order.status}`);
      return res.status(400).json({
        error: "Order status is not active",
      });
    }
    // check order amount
    const { total: orderAmount } = order.amounts;
    if (orderAmount !== amount) {
      console.log(`Order amount mismatch: ${orderAmount} !== ${amount}`);
      return res.status(400).json({
        error: "Order amount mismatch",
      });
    }
    order.payment.status = "paid";
    order.payment.paid_at = new Date();
    order.payment.transactionId = id;
    await order.save();
    const bankTransaction = new BankTransaction({
      ...data,
      order_id: order._id,
    });
    await bankTransaction.save();
    res.status(200).json({
      message: "Webhook processed successfully",
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
    });
  }
};
