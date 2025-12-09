import { graphql, GraphQLError } from "graphql";

const voucherResolvers = {
  Query: {
    voucher: async (_, { _id }, { models }) => {
      const voucher = await models.Voucher.findById(_id).populate("shop_id");
      if (!voucher) {
        throw new GraphQLError("voucher not found", {
          extensions: { code: "VOUCHER_NOT_FOUND" },
        });
      }

      return voucher;
    },

    validateVoucher: async (_, { code, orderAmount }, { models, user }) => {
      if (!user) {
        throw new GraphQLError("user not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      }

      const voucher = await models.Voucher.findOne({
        code: code.toUpperCase(),
      }).populate("shop_id");

      if (!voucher) {
        throw new GraphQLError("voucher not found", {
          extensions: { code: "VOUCHER_NOT_FOUND" },
        });
      }

      // Check if voucher is active
      const now = new Date();
      if (now < voucher.start_date || now > voucher.end_date) {
        throw new GraphQLError("voucher not found", {
          extensions: { code: "VOUCHER_NOT_FOUND" },
        });
      }

      // Check usage limit
      if (voucher.usage_count >= voucher.usage_limit) {
        throw new GraphQLError("user already to use", {
          extensions: { code: "USER_ALREADY_TO_USE" },
        });
      }

      // Check minimum order value
      if (voucher.min_order_value && orderAmount < voucher.min_order_value) {
        throw new GraphQLError(
          `Order amount must be at least ${voucher.min_order_value}`,
          {
            extensions: {
              code: `Order amount must be at least ${voucher.min_order_value}`,
            },
          }
        );
      }

      // Check user usage limit
      const userUsage = await models.Order.countDocuments({
        "vouchers.code": code.toUpperCase(),
        user_id: user.id,
      });

      if (userUsage >= voucher.usage_limit_per_user) {
        throw new GraphQLError(
          "You have reached the usage limit for this voucher",
          {
            extensions: {
              code: "You have reached the usage limit for this voucher",
            },
          }
        );
      }

      return voucher;
    },

    shopVouchers: async (_, { shopId, filter, pagination }, { models }) => {
      const query = { shop_id: shopId };

      if (filter) {
        if (filter.status) query.status = filter.status;
        if (filter.type) query.type = filter.type;
        if (filter.fromDate || filter.toDate) {
          query.start_date = {};
          if (filter.fromDate) query.start_date.$gte = filter.fromDate;
          if (filter.toDate) query.start_date.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 10 } = pagination || {};

      const [items, total] = await Promise.all([
        models.Voucher.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate("shop_id"),
        models.Voucher.countDocuments(query),
      ]);

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      };
    },

    availableVouchers: async (
      _,
      { shopId, orderAmount, pagination },
      { models, user }
    ) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to view available vouchers"
        );
      }

      const now = new Date();
      const query = {
        shop_id: shopId,
        start_date: { $lte: now },
        end_date: { $gt: now },
        usage_count: { $lt: mongoose.expr({ $toLong: "$usage_limit" }) },
        min_order_value: { $lte: orderAmount },
      };

      const { offset = 0, limit = 10 } = pagination || {};

      // Get vouchers and exclude ones where user has reached their limit
      const [items, total] = await Promise.all([
        models.Voucher.find(query)
          .sort({ created_at: -1 })
          .skip(offset)
          .limit(limit)
          .populate("shop_id"),
        models.Voucher.countDocuments(query),
      ]);

      // Filter out vouchers where user has reached their usage limit
      const filteredItems = await Promise.all(
        items.map(async (voucher) => {
          const userUsage = await models.Order.countDocuments({
            "vouchers.code": voucher.code,
            user_id: user.id,
          });
          return userUsage < voucher.usage_limit_per_user ? voucher : null;
        })
      );

      const validVouchers = filteredItems.filter(Boolean);

      return {
        items: validVouchers,
        total,
        hasMore: offset + validVouchers.length < total,
      };
    },
  },

  Mutation: {
    createVoucher: async (_, { input }, { models, user, shop }) => {
      if (!user && !shop) {
        throw new GraphQLError("Only shop owners can create vouchers", {
          extensions: { code: "Only shop owners can create vouchers" },
        });
      }
      if (input.startDate >= input.endDate) {
        throw new GraphQLError("End date must be after start date", {
          extensions: { code: "End date must be after start date" },
        });
      }

      // Validate discount value
      if (input.type === "percentage" && input.value > 100) {
        throw new GraphQLError("Percentage discount cannot exceed 100%", {
          extensions: { code: "Percentage discount cannot exceed 100%" },
        });
      }

      const voucher = new models.Voucher({
        ...input,
        code: input.code.toUpperCase(),
        shop_id: shop._id,
      });

      await voucher.save();
      return voucher;
    },

    updateVoucher: async (_, { _id, input }, { models, user, shop }) => {
      const voucher = await models.Voucher.findById(_id);

      if (!voucher) {
        throw new GraphQLError("Voucher not found", {
          extensions: { code: "VOUCHER_NOT_FOUND" },
        });
      }

      if (!user || shop._id.toString() !== voucher.shop_id.toString()) {
        throw new GraphQLError("Not authorized to update this voucher", {
          extensions: { code: "NOT_AUTHORIZED" },
        });
      }

      if (
        input.startDate &&
        input.endDate &&
        input.startDate >= input.endDate
      ) {
        throw new GraphQLError("End date must be after start date", {
          extensions: { code: "End date must be after start date" },
        });
      }

      if (input.type === "percentage" && input.value > 100) {
        throw new graphql.GraphQLError(
          "Percentage discount cannot exceed 100%",
          {
            extensions: { code: "Percentage discount cannot exceed 100%" },
          }
        );
      }

      Object.assign(voucher, input);
      await voucher.save();

      return voucher;
    },

    deleteVoucher: async (_, { _id }, { models, user, shop }) => {
      const voucher = await models.Voucher.findById(_id);

      if (!voucher) {
        throw new GraphQLError("Voucher not found", {
          extensions: { code: "VOUCHER_NOT_FOUND" },
        });
      }

      if (!shop) {
        throw new GraphQLError("Shop not found", {
          extensions: { code: "SHOP_NOT_FOUND" },
        });
      }

      if (!user || String(shop._id) !== String(voucher.shop_id)) {
        throw new GraphQLError("Not authorized to delete this voucher", {
          extensions: { code: "NOT_AUTHORIZED" },
        });
      }

      const now = new Date();
      if (voucher.start_date <= now && voucher.end_date >= now) {
        throw new GraphQLError("Cannot delete an active voucher", {
          extensions: { code: "CANNOT_DELETE_ACTIVE_VOUCHER" },
        });
      }

      await models.Voucher.deleteOne({ _id: voucher._id });

      return true;
    },
  },

  Voucher: {
    shop: (voucher) => voucher.shop_id,
  },
};

export default voucherResolvers;
