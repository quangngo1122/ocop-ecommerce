import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  gender: {
    type: String,
    enum: ["male", "female"],
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  role: {
    type: String,
    enum: ["admin", "seller", "user"],
    default: "user",
  },
  provider: {
    type: String,
    enum: ["google", "facebook", "email"],
    required: true,
  },
  providerIds: {
    type: [String],
    default: [],
  },
  avatar: {
    type: String,
    default:
      "https://res.cloudinary.com/dtexmphc4/image/upload/v1750046642/default_avatar_ynxrjq.avif", // Default avatar URL
  },
  cart: [
    {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId(),
      },
      VariantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Variants",
        required: true,
      },
      quantity: {
        type: Number,
        default: 1,
        min: 1,
      },
      price: {
        type: Number,
        required: true,
      },
      isChecked: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  address: [
    {
      name: String,
      phone: String,
      address: String,
      province: String,
      district: String,
      ward: String,
      province_id: Number,
      district_id: Number,
      ward_code: Number,
      isDefault: {
        type: Boolean,
        default: false,
      },
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.methods.hasProvider = function (providerId) {
  return this.providerIds.includes(providerId);
};

userSchema.methods.addProvider = function (providerId) {
  if (!this.providerIds.includes(providerId)) {
    this.providerIds.push(providerId);
  }
};

const User = mongoose.model("User", userSchema);
export default User;
