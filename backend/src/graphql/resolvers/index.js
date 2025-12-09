import authResolvers from "./Auth.resolver.js";
import userResolvers from "./User.resolver.js";
import categoryResolvers from "./Category.resolver.js";
import shopResolvers from "./Shop.resolver.js";
import productResolvers from "./Product.resolver.js";
import reviewResolvers from "./Review.resolver.js";
import voucherResolvers from "./Voucher.resolver.js";
import orderResolvers from "./Order.resolver.js";
import bannerResolvers from "./Banner.resolver.js";
import inventoryBatches from "./InventoryBatches.resolver.js";
import statisticResolvers from "./Statistic.resolver.js";
import CommonResolvers from "./Common.resolver.js";

const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...userResolvers.Query,
    ...categoryResolvers.Query,
    ...shopResolvers.Query,
    ...productResolvers.Query,
    ...reviewResolvers.Query,
    ...voucherResolvers.Query,
    ...orderResolvers.Query,
    ...bannerResolvers.Query,
    ...inventoryBatches.Query,
    ...statisticResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...userResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...shopResolvers.Mutation,
    ...productResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...voucherResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...bannerResolvers.Mutation,
    ...inventoryBatches.Mutation,
    ...statisticResolvers.Mutation,
  },

  Category: {
    ...categoryResolvers.Category, // 🔥 thêm dòng này
  },

  ...CommonResolvers,
};

export default resolvers;
