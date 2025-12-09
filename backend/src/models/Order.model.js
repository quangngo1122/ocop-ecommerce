import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  order_code: {
    type: String,
    required: true,
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amounts: {
    subtotal: {
      type: Number,
      required: true,
    },
    shippingFee: {
      type: Number,
      required: true,
    },
    total_discount: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  payment: {
    method: {
      type: String,
      enum: ["cod", "online"],
      default: "cod",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cod", "failed"],
      default: "pending",
    },
    transactionId: String,
    paid_at: Date,
  },
  status: {
    type: String,
    enum: ["active", "cancelled"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Tạo virtual field shopOrders
orderSchema.virtual("shopOrders", {
  ref: "ShopOrder",
  localField: "_id", // _id của Order
  foreignField: "order_id", // field order_id trong ShopOrder
});

// Cho phép trả về cả virtual khi dùng toJSON/toObject
orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

// Tạo index cho tìm kiếm đơn hàng
orderSchema.index({ buyer: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ "items.shop": 1 });

const Order = mongoose.model("Order", orderSchema);
export default Order;
