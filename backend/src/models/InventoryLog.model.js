import mongoose from "mongoose";

const inventoryLogSchema = new mongoose.Schema(
  {
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variant_id: { type: mongoose.Schema.Types.ObjectId, ref: "ProductVariant" },
    batch_id: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryBatches" },
    action_type: {
      type: String,
      enum: ["import", "sell", "adjust", "return"],
      required: true,
    },
    quantity_change: { type: Number, required: true }, // số lượng thay đổi (+ nhập, - xuất, +/- điều chỉnh)
    old_value: { type: Number },
    new_value: { type: Number },
    note: { type: String },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const InventoryLog = mongoose.model("InventoryLog", inventoryLogSchema);
export default InventoryLog;
