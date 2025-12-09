import mongoose from "mongoose";
const shopOrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  order_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  order_code: {
    type: String,
    required: true,
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    required: true,
  },
  shipping: {
    from_address: {
      name: String,
      phone: String,
      address: String,
      province: String,
      district: String,
      ward: String,
      province_id: Number,
      district_id: Number,
      ward_code: Number,
    },
    to_address: {
      name: String,
      phone: String,
      address: String,
      province: String,
      district: String,
      ward: String,
      province_id: Number,
      district_id: Number,
      ward_code: Number,
    },
    method: String,
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "preparing",
        "transit",
        "delivered",
        "failed",
        "cancelled_by_shop",
        "cancelled_by_buyer",
      ],
      default: "pending",
    },
    tracking_code: String,
  },
  weight: {
    type: Number, // in grams
  },
  items: [
    {
      variant_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variants",
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      discount: {
        type: Number,
        default: 0,
      },
    },
  ],
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
  current_status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "preparing",
      "transit",
      "delivered",
      "failed",
      "cancelled_by_shop",
      "cancelled_by_buyer",
    ],
    default: "pending",
  },
  status_history: [
    {
      status: {
        type: String,
        enum: [
          "pending",
          "confirmed",
          "preparing",
          "transit",
          "delivered",
          "failed",
          "cancelled_by_shop",
          "cancelled_by_buyer",
        ],
        required: true,
      },
      updatedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  voucher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Voucher",
    default: null,
  },

  // discount: {
  //   type: Number,
  //   default: 0,
  // },

  cancel_reason: {
    type: String,
    default: null,
  },
  return_reason: {
    type: String,
    default: null,
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
const ShopOrder = mongoose.model("ShopOrder", shopOrderSchema);
export default ShopOrder;
