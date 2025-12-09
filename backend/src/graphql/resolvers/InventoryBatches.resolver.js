import { GraphQLError } from "graphql";

const inventoryResolvers = {
  Mutation: {
    // Nhập kho cho biến thể (variant)
    importInventory: async (_, { input }, { models, user }) => {
      if (!user)
        throw new GraphQLError("Bạn cần đăng nhập", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      const { productId, variantId, quantity, importPrice, importDate, note } =
        input;
      if (!productId || !variantId || !quantity)
        throw new GraphQLError("Thiếu thông tin bắt buộc", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      const variant = await models.Variants.findById(variantId);
      if (!variant)
        throw new GraphQLError("Không tìm thấy biến thể", {
          extensions: { code: "NOT_FOUND" },
        });
      if (String(variant.product_id) !== String(productId))
        throw new GraphQLError("Biến thể không thuộc sản phẩm này", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      // Tạo batch nhập kho mới
      await models.InventoryBatch.create({
        product_id: productId,
        variant_id: variantId,
        quantity,
        remaining_quantity: quantity,
        import_price: importPrice || 0,
        import_date: importDate ? new Date(importDate) : new Date(),
        note: note || "",
      });

      // Tăng tồn kho variant
      variant.stock_quantity += quantity;
      await variant.save();

      // Cập nhật lại tổng tồn kho product
      const totalStock = await models.Variants.aggregate([
        { $match: { product_id: variant.product_id } },
        { $group: { _id: null, total: { $sum: "$stock_quantity" } } },
      ]);
      await models.Product.findByIdAndUpdate(productId, {
        stock: totalStock[0]?.total || 0,
      });

      // Ghi log nếu có model InventoryTransaction
      if (models.InventoryTransaction) {
        await models.InventoryTransaction.create({
          product_id: productId,
          variant_id: variantId,
          type: "import",
          quantity,
          price: importPrice || 0,
          date: importDate ? new Date(importDate) : new Date(),
          note: note || "",
          user_id: user._id,
        });
      }

      return { success: true };
    },

    // Xuất kho cho biến thể (variant) - FIFO
    exportInventory: async (_, { input }, { models, user }) => {
      if (!user)
        throw new GraphQLError("Bạn cần đăng nhập", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      const { productId, variantId, quantity, exportDate, note } = input;
      if (!productId || !variantId || !quantity)
        throw new GraphQLError("Thiếu thông tin bắt buộc", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      let qtyToExport = quantity;
      const batches = await models.InventoryBatch.find({
        product_id: productId,
        variant_id: variantId,
        remaining_quantity: { $gt: 0 },
      }).sort({ import_date: 1 });

      for (const batch of batches) {
        if (qtyToExport <= 0) break;
        const take = Math.min(batch.remaining_quantity, qtyToExport);
        batch.remaining_quantity -= take;
        await batch.save();
        qtyToExport -= take;
        // Ghi log xuất kho từng batch nếu có model InventoryTransaction
        if (models.InventoryTransaction) {
          await models.InventoryTransaction.create({
            product_id: productId,
            variant_id: variantId,
            batch_id: batch._id,
            type: "export",
            quantity: take,
            price: batch.import_price || 0,
            date: exportDate ? new Date(exportDate) : new Date(),
            note: note || "",
            user_id: user._id,
          });
        }
      }
      if (qtyToExport > 0)
        throw new GraphQLError("Không đủ tồn kho để xuất", {
          extensions: { code: "BAD_USER_INPUT" },
        });

      // Giảm tồn kho variant
      const variant = await models.Variants.findById(variantId);
      variant.stock_quantity -= quantity;
      if (variant.stock_quantity < 0) variant.stock_quantity = 0;
      await variant.save();

      // Cập nhật lại tổng tồn kho product
      const totalStock = await models.Variants.aggregate([
        { $match: { product_id: variant.product_id } },
        { $group: { _id: null, total: { $sum: "$stock_quantity" } } },
      ]);
      await models.Product.findByIdAndUpdate(productId, {
        stock: totalStock[0]?.total || 0,
      });

      return { success: true };
    },
  },
};

export default inventoryResolvers;
