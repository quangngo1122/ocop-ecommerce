import mongoose from "mongoose";
import { GraphQLError } from "graphql";

const statisticResolvers = {
  Query: {
    getStatistics: async (_, { fromDate, toDate, shopId }, { models }) => {
      const { ShopOrder, Product, Variants } = models;

      // Bộ lọc theo ngày và shop
      let filter = {};
      if (fromDate || toDate) {
        filter.createdAt = {
          ...(fromDate ? { $gte: new Date(fromDate) } : {}),
          ...(toDate ? { $lte: new Date(toDate) } : {}),
        };
      }
      if (shopId) {
        filter.shop_id = new mongoose.Types.ObjectId(shopId);
      }

      // -----------------------------
      // 1) Thống kê đơn hàng
      // -----------------------------
      const orderStats = await ShopOrder.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            deliveredOrders: {
              $sum: {
                $cond: [{ $eq: ["$current_status", "delivered"] }, 1, 0],
              },
            },
            totalRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$current_status", "delivered"] },
                  "$amounts.total",
                  0,
                ],
              },
            },
            netRevenue: {
              $sum: {
                $cond: [
                  { $eq: ["$current_status", "delivered"] },
                  "$amounts.subtotal",
                  0,
                ],
              },
            },
            totalDiscount: {
              $sum: {
                $cond: [
                  { $eq: ["$current_status", "delivered"] },
                  "$amounts.total_discount",
                  0,
                ],
              },
            },
            ordersByShop: { $push: "$shop_id" },
          },
        },
      ]);

      const stats = orderStats[0] || {
        totalOrders: 0,
        deliveredOrders: 0,
        totalRevenue: 0,
        netRevenue: 0,
        totalDiscount: 0,
        ordersByShop: [],
      };

      // Đếm đơn theo shop
      const shopCount = {};
      stats.ordersByShop.forEach((sid) => {
        shopCount[sid.toString()] = (shopCount[sid.toString()] || 0) + 1;
      });
      const totalOrdersByShop = Object.entries(shopCount).map(
        ([sid, count]) => ({
          shop_id: sid,
          totalOrders: count,
        })
      );

      // -----------------------------
      // 2) Thống kê sản phẩm bán ra
      // -----------------------------
      const productStats = await ShopOrder.aggregate([
        { $match: { ...filter, current_status: "delivered" } },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.variant_id",
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { totalQuantity: -1 } },
      ]);

      // Lấy product từ variant
      const variantIds = productStats.map((p) => p._id);
      const variants = await Variants.find({
        _id: { $in: variantIds },
      }).populate("product_id");
      const productMap = {};
      variants.forEach((v) => {
        productMap[v._id.toString()] = v.product_id;
      });

      const productSales = productStats.map((p) => {
        const prod = productMap[p._id.toString()];
        return {
          product_id: prod?._id,
          name: prod?.name,
          totalQuantity: p.totalQuantity,
        };
      });

      const productRevenue = productStats.map((p) => {
        const prod = productMap[p._id.toString()];
        return {
          product_id: prod?._id,
          name: prod?.name,
          totalRevenue: p.totalRevenue,
        };
      });

      const topSellingProducts = [...productSales].slice(0, 5);
      const topRevenueProducts = [...productRevenue]
        .sort((a, b) => b.totalRevenue - a.totalRevenue)
        .slice(0, 5);

      return {
        totalOrders: stats.totalOrders,
        totalOrdersByShop,
        totalRevenue: stats.totalRevenue,
        netRevenue: stats.netRevenue,
        totalDiscount: stats.totalDiscount,
        completionRate:
          stats.totalOrders > 0
            ? (stats.deliveredOrders / stats.totalOrders) * 100
            : 0,
        productSales,
        topSellingProducts,
        topRevenueProducts,
      };
    },
  },
};

export default statisticResolvers;
