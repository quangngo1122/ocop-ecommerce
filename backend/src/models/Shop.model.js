import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: {
    type: String,
  },
  logo: {
    type: String,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
  },
  coverImage: {
    type: String,
  },
  address: {
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
  contact: {
    phone: String,
    email: String,
  },
  businessLicense: [
    {
      id: mongoose.Schema.Types.ObjectId,
      name: String,
      code: String,
      description: String,
      images: [String],
    },
  ],
  rating: {
    average: {
      type: Number,
      default: 0,
    },
    count: {
      type: Number,
      default: 0,
    },
  },
  status: {
    type: String,
    enum: ["pending", "active", "suspended", "closed", "hidden", "locked"],
    default: "pending",
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

shopSchema.virtual("products", {
  ref: "Product",
  localField: "_id",
  foreignField: "shop_id",
});

shopSchema.virtual("vouchers", {
  ref: "Voucher",
  localField: "_id",
  foreignField: "shop_id",
});

shopSchema.set("toObject", { virtuals: true });
shopSchema.set("toJSON", { virtuals: true });

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
