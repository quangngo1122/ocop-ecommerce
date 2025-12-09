import mongoose from "mongoose";
const variantSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  selling_price: { type: Number },
  image: { type: String },
  stock_quantity: {
    type: Number,
    default: 0,
  },
  attributes: [
    {
      name: String,
      value: String,
    },
  ],
  weight: {
    type: Number,
    default: 10,
  },
  length: {
    type: Number,
    default: 10,
  },
  width: {
    type: Number,
    default: 10,
  },
  height: {
    type: Number,
    default: 10,
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
  },
});

const Variants = mongoose.model("Variants", variantSchema);
export default Variants;
