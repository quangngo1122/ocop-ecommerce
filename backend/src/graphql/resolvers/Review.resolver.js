import { GraphQLError } from "graphql";
const reviewResolvers = {
  Query: {
    review: async (_, { id }, { models }) => {
      const review = await models.Review.findById(id)
        .populate("product_id")
        .populate("user_id")
        .populate("shop_order_id")
        .populate("reply.user_id");
      if (!review) {
        throw new GraphQLError("Review not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return review;
    },

    reviews: async (_, { filter, pagination }, { user, models }) => {
      if (!user) {
        throw new GraphQLError("You must be logged in to view reviews", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const query = {};

      if (filter) {
        if (filter.shop_id) {
          const productIds = await models.Product.find({
            shop_id: filter.shop_id,
          }).distinct("_id");
          query.product_id = { $in: productIds };
        }

        if (filter.status) query.status = filter.status;
        if (filter.rating) query.rating = filter.rating;

        if (filter.fromDate || filter.toDate) {
          query.createdAt = {};
          if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
          if (filter.toDate) query.createdAt.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 100 } = pagination || {};

      const [items, total] = await Promise.all([
        models.Review.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate("product_id")
          .populate("user_id")
          .populate("shop_order_id")
          .populate("reply.user_id"),
        models.Review.countDocuments(query),
      ]);

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      };
    },

    productReviews: async (
      _,
      { productId, filter, pagination },
      { models }
    ) => {
      const query = { product_id: productId };
      if (filter) {
        if (filter.status) query.status = filter.status;
        if (filter.rating) query.rating = filter.rating;
        if (filter.fromDate || filter.toDate) {
          query.createdAt = {};
          if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
          if (filter.toDate) query.createdAt.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 10 } = pagination || {};

      const [items, total] = await Promise.all([
        models.Review.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate("product_id")
          .populate("user_id")
          .populate("shop_order_id")
          .populate("reply.user_id"),
        models.Review.countDocuments(query),
      ]);

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      };
    },

    userReviews: async (
      _,
      { userId, filter, pagination },
      { models, user }
    ) => {
      if (!user || (user.id !== userId && user.role !== "admin")) {
        throw new ForbiddenError("Not authorized to view these reviews");
      }

      const query = { user_id: userId };
      if (filter) {
        if (filter.status) query.status = filter.status;
        if (filter.rating) query.rating = filter.rating;
        if (filter.fromDate || filter.toDate) {
          query.createdAt = {};
          if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
          if (filter.toDate) query.createdAt.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 10 } = pagination || {};

      const [items, total] = await Promise.all([
        models.Review.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate("product_id")
          .populate("user_id")
          .populate("shop_order_id")
          .populate("reply.user_id"),
        models.Review.countDocuments(query),
      ]);

      return {
        items,
        total,
        hasMore: offset + items.length < total,
      };
    },
  },

  Mutation: {
    createReview: async (_, { input }, { models, user }) => {
      if (!user) {
        throw new GraphQLError("You must be logged in to create a review", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const reviews = [];

      for (const reviewInput of input) {
        // Kiểm tra đơn hàng thuộc về user
        const shopOrder = await models.ShopOrder.findOne({
          _id: reviewInput.shop_order_id,
          user_id: user.id,
        }).populate({
          path: "items.variant_id",
          populate: { path: "product_id", model: "Product" },
        });

        if (!shopOrder) {
          throw new GraphQLError(
            "You can only review products from your orders",
            {
              extensions: { code: "FORBIDDEN" },
            }
          );
        }

        // Chỉ cho phép review khi đơn hàng đã giao thành công
        if (shopOrder.current_status !== "delivered") {
          throw new GraphQLError(
            "You can only review after order is delivered",
            {
              extensions: { code: "FORBIDDEN" },
            }
          );
        }

        // shopOrder đã được populate tới product_id
        const hasProduct = shopOrder.items.some(
          (item) =>
            item.variant_id?.product_id?._id.toString() ===
            String(reviewInput.product_id)
        );

        shopOrder.items.forEach((item) => {
          console.log("Variant:", item.variant_id?._id?.toString());
          console.log("Product:", item.variant_id?.product_id?._id?.toString());
          console.log("Compare with input:", String(reviewInput.product_id));
        });

        if (!hasProduct) {
          throw new GraphQLError("This product is not in your order", {
            extensions: { code: "FORBIDDEN" },
          });
        }

        // Kiểm tra trùng review
        const existingReview = await models.Review.findOne({
          product_id: reviewInput.product_id,
          user_id: user.id,
          shop_order_id: reviewInput.shop_order_id,
        });

        if (existingReview) {
          throw new GraphQLError(
            "You already reviewed this product in this order",
            { extensions: { code: "BAD_USER_INPUT" } }
          );
        }

        // Tạo review mới
        const review = new models.Review({
          product_id: reviewInput.product_id,
          user_id: user.id,
          shop_order_id: reviewInput.shop_order_id,
          rating: reviewInput.rating,
          content: reviewInput.content,
          status: "pending",
        });

        await review.save();
        reviews.push(review);

        // Update rating product ngay sau khi thêm review
        const product = await models.Product.findById(reviewInput.product_id);
        const allReviews = await models.Review.find({
          product_id: reviewInput.product_id,
          status: "approved",
        });

        product.rating.average =
          allReviews.length > 0
            ? allReviews.reduce((acc, r) => acc + r.rating, 0) /
              allReviews.length
            : 0;
        product.rating.count = allReviews.length;
        await product.save();
      }

      // Update rating shop
      const shop = await models.Shop.findById(product.shop_id);

      // Lấy tất cả product của shop
      const shopProducts = await models.Product.find({ shop_id: shop._id });

      // Lấy toàn bộ review approved của tất cả sản phẩm trong shop
      const shopProductIds = shopProducts.map((p) => p._id);
      const shopReviews = await models.Review.find({
        product_id: { $in: shopProductIds },
        status: "approved",
      });

      // Tính toán lại rating
      shop.rating.count = shopReviews.length;
      shop.rating.average =
        shopReviews.length > 0
          ? shopReviews.reduce((acc, r) => acc + r.rating, 0) /
            shopReviews.length
          : 0;

      await shop.save();

      return reviews;
    },

    updateReview: async (_, { _id, input }, { models, user }) => {
      const review = await models.Review.findById(_id);

      if (!review) {
        throw new GraphQLError("Review not found", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }

      if (
        !user ||
        (user._id !== review.user_id.toString() && user.role !== "admin")
      ) {
        throw new GraphQLError("Not authorized to update this review", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }

      Object.assign(review, input);
      await review.save();

      return review;
    },

    deleteReview: async (_, { _id }, { models, user }) => {
      const review = await models.Review.findById(_id);

      if (!review) {
        throw new GraphQLError("Review not found", {
          extensions: {
            code: "NOT_FOUND",
          },
        });
      }

      if (user._id !== review.user_id.toString() && user.role !== "admin") {
        throw new GraphQLError("Not authorized to delete this review", {
          extensions: {
            code: "FORBIDDEN",
          },
        });
      }

      await models.Review.findByIdAndDelete(_id);

      return true;
    },

    replyToReview: async (_, { input }, { models, user, shop }) => {
      if (!user) {
        throw new GraphQLError("You must be logged in to reply to reviews", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const review = await models.Review.findById(input.review_id)
        .populate("product_id")
        .populate("user_id")
        .populate("shop_order_id")
        .populate("reply.user_id");

      if (!review) {
        throw new GraphQLError("Review not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      if (
        review.product_id.shop_id.toString() !== shop._id?.toString() &&
        user.role !== "admin"
      ) {
        throw new GraphQLError(
          "You can only reply to reviews for products in your shop",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      review.reply = {
        user_id: user._id,
        content: input.content,
        createdAt: new Date(),
      };

      await review.save();

      await review.populate("reply.user_id");

      return review;
    },

    updateReviewStatus: async (_, { _id, status }, { models, user }) => {
      if (!user || user.role !== "admin") {
        throw new GraphQLError("Only admins can update review status", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      const review = await models.Review.findById(_id)
        .populate("product_id")
        .populate("user_id")
        .populate("shop_order_id")
        .populate("reply.user_id");

      if (!review) {
        throw new GraphQLError("Review not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Lưu trạng thái cũ để so sánh
      const oldStatus = review.status;

      // Cập nhật trạng thái mới
      review.status = status;
      await review.save();

      // Nếu status thay đổi thì cập nhật lại rating sản phẩm
      if (oldStatus !== status) {
        const product = await models.Product.findById(review.product_id);

        // Lấy tất cả review "approved" của sản phẩm
        const approvedReviews = await models.Review.find({
          product_id: review.product_id,
          status: "approved",
        });

        product.rating.count = approvedReviews.length;
        product.rating.average =
          approvedReviews.length > 0
            ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) /
              approvedReviews.length
            : 0;

        await product.save();
      }

      return review;
    },
  },

  Review: {
    product: (review) => review.product_id,
    user: (review) => review.user_id,
    shopOrder: (review) => review.shop_order_id,
  },
};

export default reviewResolvers;
