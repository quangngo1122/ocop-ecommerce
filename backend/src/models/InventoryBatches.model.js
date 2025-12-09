import mongoose from "mongoose";
const inventoryBatchesSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variant_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ProductVariant",
  },
  shop_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop",
    require: "true",
  },
  batch_number: {
    type: String,
    required: true,
    index: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  remaining_quantity: {
    type: Number,
    required: true,
    min: 0,
  },
  import_price: {
    type: Number,
    required: true,
    min: 0,
  },
  import_date: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

const InventoryBatches = mongoose.model(
  "InventoryBatches",
  inventoryBatchesSchema
);
export default InventoryBatches;
