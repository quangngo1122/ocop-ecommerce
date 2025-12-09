import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import ShopOrder from "../../models/ShopOrder.model.js";
import Order from "../../models/Order.model.js";

import { startSession } from "mongoose";

const toDecimal = (num) => mongoose.Types.Decimal128.fromString(num.toFixed(2));
const getVoucherDiscount = (voucher, subtotal) => {
  if (!voucher || voucher.status !== "active") return 0;
  const now = new Date();
  if (now < voucher.start_date || now > voucher.end_date) return 0;

  if (voucher.min_order_value && subtotal < parseFloat(voucher.min_order_value))
    return 0;

  let discount = 0;
  if (voucher.type === "percentage") {
    discount = (parseFloat(voucher.value) / 100) * subtotal;
  } else if (voucher.type === "fixed_amount") {
    discount = parseFloat(voucher.value);
  }

  if (voucher.max_discount_amount) {
    discount = Math.min(discount, parseFloat(voucher.max_discount_amount));
  }

  return discount;
};

const orderResolvers = {
  Query: {
    order: async (_, { _id }, { models, user }) => {
      if (!user) {
        throw new AuthenticationError("You must be logged in to view orders");
      }

      const order = await models.Order.findById(_id);
      if (!order) throw new Error("Order not found");

      const shopOrders = await models.ShopOrder.find({ order_id: order._id })
        .populate("user_id")
        .populate({
          path: "items.variant_id",
          populate: {
            path: "product_id",
          },
        });

      if (!order) {
        throw new Error("Order not found");
      }

      if (
        user._id !== order.user_id.toString() &&
        shopOrders.some(
          (so) => so.shop_id.toString() === user.shop_id?.toString()
        )
      ) {
        throw new GraphQLError("Not authorized to view this order", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      return order;
    },

    // shopOrder: async (_, { id }, { models, user }) => {
    //   if (!user) {
    //     throw new AuthenticationError("You must be logged in to view orders");
    //   }

    //   const shopOrder = await models.ShopOrder.findById(id)
    //     .populate("order_id")
    //     .populate("shop_id")
    //     .populate("items.product");

    //   if (!shopOrder) {
    //     throw new Error("Shop order not found");
    //   }

    //   // Only allow user to view their own orders, or shop owners to view their shop's orders
    //   if (
    //     user.id !== shopOrder.order.user_id.toString() &&
    //     user.shop_id?.toString() !== shopOrder.shop_id.toString()
    //   ) {
    //     throw new ForbiddenError("Not authorized to view this order");
    //   }

    //   return shopOrder;
    // },

    shopOrder: async (_, { _id }, { models, user }) => {
      if (!user) {
        throw new GraphQLError("Bạn cần đăng nhập để xem đơn hàng", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const shopOrder = await models.ShopOrder.findById(_id)
        .populate("order_id")
        .populate("shop_id")
        .lean();

      if (!shopOrder) {
        throw new GraphQLError("Shop order not found", {
          extensions: { code: "SHOP_ORDER_NOT_FOUND" },
        });
      }

      // Lấy tất cả variant_id trong items
      const variantIds = shopOrder.items.map((item) => item.variant_id);

      // Lấy variants và products liên quan
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate("product_id")
        .lean();

      // Map lại items để trả về product info
      const items = shopOrder.items.map((item) => {
        const variant = variants.find(
          (v) => v._id.toString() === item.variant_id.toString()
        );
        const product = variant?.product_id;
        return {
          ...item,
          price: item.price,
          product: product
            ? { _id: product._id?.toString(), name: product.name }
            : null, // hoặc trả về object rỗng nếu typedef cho phép
          variant: variant,
        };
      });

      return {
        ...shopOrder,
        items,
      };
    },

    // userOrders: async (_, { filter, pagination }, { models, user }) => {
    //   if (!user) {
    //     throw new GraphQLError("Bạn cần đăng nhập để xem đơn hàng", {
    //       extensions: { code: "UNAUTHENTICATED" },
    //     });
    //   }

    //   const query = { user_id: user._id };

    //   if (filter) {
    //     if (filter.status) query.status = filter.status;
    //     if (filter.paymentStatus) query.payment_status = filter.paymentStatus;
    //     if (filter.fromDate || filter.toDate) {
    //       query.createdAt = {};
    //       if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
    //       if (filter.toDate) query.createdAt.$lte = filter.toDate;
    //     }
    //   }

    //   const { offset = 0, limit = 10 } = pagination || {};

    //   const [orders, total] = await Promise.all([
    //     models.Order.find(query)
    //       .sort({ createdAt: -1 })
    //       .skip(offset)
    //       .limit(limit)
    //       .lean(),
    //     models.Order.countDocuments(query),
    //   ]);

    //   const mappedOrders = await Promise.all(
    //     orders.map(async (order) => {
    //       const shopOrders = await models.ShopOrder.find({
    //         order_id: order._id,
    //       })
    //         .populate({
    //           path: "items.variant_id",
    //           populate: { path: "product_id", model: "Product" },
    //         })
    //         .populate("shop_id")
    //         .lean();

    //       return {
    //         ...order,
    //         shopOrders,
    //       };
    //     })
    //   );

    //   return {
    //     items: mappedOrders,
    //     total,
    //     hasMore: offset + mappedOrders.length < total,
    //   };
    // },

    shopOrders: async (_, { filter, pagination }, { models, user }) => {
      if (!user) {
        throw new GraphQLError(
          "Bạn cần đăng nhập để xem đơn hàng của cửa hàng",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      const query = {};

      if (filter) {
        if (filter.shopId) query.shop_id = filter.shopId;
        if (filter.status) query.status = filter.status;
        if (filter.paymentStatus) query.payment_status = filter.paymentStatus;
        if (filter.fromDate || filter.toDate) {
          query.createdAt = {};
          if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
          if (filter.toDate) query.createdAt.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 10 } = pagination || {};

      const [shopOrders, total] = await Promise.all([
        models.ShopOrder.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate("user_id")
          .populate("order_id")
          .populate("shop_id")
          .lean(),
        models.ShopOrder.countDocuments(query),
      ]);

      // Map lại từng shopOrder để lấy thông tin sản phẩm qua variant
      const mappedOrders = await Promise.all(
        shopOrders.map(async (shopOrder) => {
          const variantIds = shopOrder.items.map((item) => item.variant_id);
          const variants = await models.Variants.find({
            _id: { $in: variantIds },
          })
            .populate("product_id")
            .lean();

          const items = shopOrder.items.map((item) => {
            const variant = variants.find(
              (v) => v._id.toString() === item.variant_id.toString()
            );
            const product = variant?.product_id;
            return {
              ...item,
              product: product
                ? { _id: product._id?.toString(), name: product.name }
                : null,
              variant: variant,
              price: item.price,
              total: item.total,
            };
          });

          return {
            ...shopOrder,
            items,
            _id: shopOrder._id?.toString(),
          };
        })
      );

      return {
        items: mappedOrders,
        total,
        hasMore: offset + mappedOrders.length < total,
      };
    },

    myOrders: async (_, { filter, pagination }, { models, user }) => {
      if (!user) {
        throw new GraphQLError("Bạn cần đăng nhập để xem đơn hàng", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // Ép user._id về ObjectId
      const query = { user_id: new mongoose.Types.ObjectId(user._id) };

      if (filter) {
        if (filter.status) query.status = filter.status;
        if (filter.paymentStatus) {
          query["payment.status"] = filter.paymentStatus;
        }
        if (filter.fromDate || filter.toDate) {
          query.createdAt = {};
          if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
          if (filter.toDate) query.createdAt.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 10 } = pagination || {};

      const [orders, total] = await Promise.all([
        models.Order.find(query)
          .sort({ createdAt: -1 })
          .populate({
            path: "shopOrders",
            model: "ShopOrder",
            populate: {
              path: "items.variant_id",
              model: "Variants",
              populate: {
                path: "product_id",
                model: "Product",
              },
            },
          })
          .skip(offset)
          .limit(limit)
          .lean(),
        models.Order.countDocuments(query),
      ]);

      // Map lại để gắn variant trực tiếp vào items
      const mappedOrders = orders.map((order) => {
        const shopOrders = order.shopOrders.map((shopOrder) => {
          const items = shopOrder.items.map((item) => ({
            ...item,
            variant: item.variant_id, // ✅ gắn variant luôn
          }));
          return { ...shopOrder, items };
        });
        return { ...order, shopOrders };
      });

      return {
        items: mappedOrders,
        total,
        hasMore: offset + mappedOrders.length < total,
      };
    },

    myShopOrders: async (_, { filter, pagination }, { models, user, shop }) => {
      if (!user) {
        throw new GraphQLError(
          "Bạn cần đăng nhập để xem đơn hàng của cửa hàng",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      if (!shop) {
        throw new GraphQLError("Bạn cần có cửa hàng để xem đơn hàng", {
          extensions: { code: "SHOP_NOT_FOUND" },
        });
      }

      const query = { shop_id: shop._id };

      if (filter) {
        if (filter.status) query.status = filter.status;
        if (filter.paymentStatus) query.payment_status = filter.paymentStatus;
        if (filter.fromDate || filter.toDate) {
          query.createdAt = {};
          if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
          if (filter.toDate) query.createdAt.$lte = filter.toDate;
        }
      }

      const { offset = 0, limit = 10 } = pagination || {};

      const [shopOrders, total] = await Promise.all([
        models.ShopOrder.find(query)
          .sort({ createdAt: -1 })
          .skip(offset)
          .limit(limit)
          .populate("order_id")
          .populate("shop_id")
          .lean(),
        models.ShopOrder.countDocuments(query),
      ]);

      // Map lại từng shopOrder để lấy thông tin sản phẩm qua variant
      const mappedOrders = await Promise.all(
        shopOrders.map(async (shopOrder) => {
          const variantIds = shopOrder.items.map((item) => item.variant_id);
          const variants = await models.Variants.find({
            _id: { $in: variantIds },
          })
            .populate("product_id")
            .lean();

          const items = shopOrder.items.map((item) => {
            const variant = variants.find(
              (v) => v._id.toString() === item.variant_id.toString()
            );
            const product = variant?.product_id;
            return {
              ...item,
              product: product
                ? { _id: product._id?.toString(), name: product.name }
                : null,
              variant: variant,
              price: item.price,
              total: item.total,
            };
          });

          return {
            ...shopOrder,
            items,
            _id: shopOrder._id?.toString(),
          };
        })
      );

      return {
        items: mappedOrders,
        total,
        hasMore: offset + mappedOrders.length < total,
      };
    },
  },

  Mutation: {
    createOrder: async (_, { input }, { models, user }) => {
      if (!user) {
        throw new GraphQLError("Bạn cần đăng nhập để đặt hàng", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // console.log(JSON.stringify(input));

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        const userInfo = await models.User.findById(user._id).session(session);
        const orderNumber = `OD${Date.now()}`;
        let subtotalAll = 0;
        let shippingAll = 0;
        let discountAll = 0;

        const shopOrderDocs = [];

        for (const shopOrderInput of input.shopOrders) {
          const { shopId, items, shipping, voucherCode, note } = shopOrderInput;

          // Lấy thông tin shop & voucher
          const shop = await models.Shop.findById(shopId).session(session);
          if (!shop) {
            throw new GraphQLError(`Cửa hàng với ID ${shopId} không tồn tại`, {
              extensions: { code: "SHOP_NOT_FOUND" },
            });
          }
          const voucher = voucherCode
            ? await models.Voucher.findOne({
                code: voucherCode,
                shop_id: shopId,
              }).session(session)
            : null;

          // Lấy thông tin biến thể
          const variantIds = items.map((item) => item.variantId);
          const variants = await models.Variants.find({
            _id: { $in: variantIds },
          }).session(session);

          // Tính subtotal
          let shopSubtotal = 0;
          const shopItems = [];

          for (const item of items) {
            const variant = variants.find((v) => v._id.equals(item.variantId));
            if (!variant)
              throw new GraphQLError("Biến thể không tồn tại", {
                code: "NOT_FOUND",
              });

            if (variant.stock_quantity < item.quantity) {
              throw new GraphQLError(`Biến thể ${variant.slug} không đủ hàng`, {
                code: "OUT_OF_STOCK",
              });
            }

            const price = variant.selling_price;
            const total = price * item.quantity;
            shopSubtotal += total;

            // Cập nhật tồn kho
            variant.stock_quantity -= item.quantity;
            await variant.save({ session });

            shopItems.push({
              variant_id: variant._id,
              quantity: item.quantity,
              price: toDecimal(price),
              discount: toDecimal(0),
            });
          }

          // Tính giảm giá
          const shopDiscount = getVoucherDiscount(voucher, shopSubtotal);
          const shippingFee = 30000; // Giả sử phí vận chuyển cố định là 30000 VND

          // Tổng cộng
          const shopTotal = shopSubtotal + shippingFee - shopDiscount;

          subtotalAll += shopSubtotal;
          shippingAll += shippingFee;
          discountAll += shopDiscount;

          // Tạo mã đơn hàng shop
          const shopOrderCode = `SOD${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`;

          // Tạo shopOrder document
          const shopOrderDoc = new ShopOrder({
            user_id: user._id,
            order_id: null, // Sẽ gán sau khi tạo order chính
            shop_id: shopId,
            order_code: shopOrderCode,
            shipping: {
              from_address: shop.address,
              to_address: shipping,
              method: "standard",
              status: "pending",
            },
            items: shopItems,
            amounts: {
              subtotal: toDecimal(shopSubtotal),
              shippingFee: toDecimal(shippingFee),
              total_discount: toDecimal(shopDiscount),
              total: toDecimal(shopTotal),
            },
            current_status: "pending",
            status_history: [
              {
                status: "pending",
                updatedAt: new Date(),
              },
            ],
            discount: voucher
              ? [
                  {
                    value: toDecimal(shopDiscount),
                    discount_code: voucher.code,
                  },
                ]
              : [],
            note: note || "",
          });

          shopOrderDocs.push(shopOrderDoc);
        }

        // Tạo order chính
        const order = new Order({
          user_id: user._id,
          order_code: orderNumber,
          amounts: {
            subtotal: toDecimal(subtotalAll),
            shippingFee: toDecimal(shippingAll),
            total_discount: toDecimal(discountAll),
            total: toDecimal(subtotalAll + shippingAll - discountAll),
          },
          payment: {
            method: input.paymentMethod,
            status: "pending",
          },
          status: "pending",
        });

        await order.save({ session });

        // Gán order_id cho mỗi shopOrder
        for (const doc of shopOrderDocs) {
          doc.order_id = order._id;
        }

        await ShopOrder.insertMany(shopOrderDocs, { session });

        await session.commitTransaction();
        session.endSession();

        return order;
      } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error("❌ createOrder error:", error);
        throw new GraphQLError(error.message, {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },

    updateShopOrderStatus: async (
      _,
      { shopOrderId, status },
      { models, user, shop }
    ) => {
      if (!user) {
        throw new GraphQLError("Bạn cần đăng nhập để cập nhật đơn hàng", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      const shopOrder = await models.ShopOrder.findById(shopOrderId);
      if (!shopOrder) {
        throw new GraphQLError("Shop order not found", {
          extensions: { code: "SHOP_ORDER_NOT_FOUND" },
        });
      }

      if (shopOrder.shop_id.toString() !== shop._id?.toString()) {
        throw new GraphQLError("Not authorized to update this order", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const validStatuses = [
        "pending",
        "confirmed",
        "preparing",
        "transit",
        "delivered",
        "failed",
        "cancelled_by_shop",
        "cancelled_by_buyer",
      ];

      if (!validStatuses.includes(status)) {
        throw new GraphQLError("Invalid status", {
          extensions: { code: "INVALID_STATUS" },
        });
      }

      // ✅ Cập nhật current_status
      shopOrder.current_status = status;

      // ✅ Thêm lịch sử trạng thái
      shopOrder.status_history.push({
        status,
        updatedAt: new Date(),
      });

      shopOrder.updatedAt = new Date();
      await shopOrder.save();

      return shopOrder;
    },
  },

  OrderItem: {
    variant: async (parent, _, { models }) => {
      if (!parent.variant_id) return null;
      return models.Variants.findById(parent.variant_id).populate("product_id");
    },
  },

  Order: {
    user: (order, _, { models }) => models.User.findById(order.user_id),
    shopOrders: (order, _, { models }) =>
      models.ShopOrder.find({ order_id: order._id }),
  },

  ShopOrder: {
    order: (shopOrder, _, { models }) =>
      models.Order.findById(shopOrder.order_id),
    shop: (shopOrder, _, { models }) => models.Shop.findById(shopOrder.shop_id),
    items: async (shopOrder, _, { models }) => {
      // Lấy tất cả variant_id trong items
      const variantIds = shopOrder.items.map((item) => item.variant_id);
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate("product_id")
        .lean();

      return shopOrder.items.map((item) => {
        const variant = variants.find(
          (v) => v._id.toString() === item.variant_id.toString()
        );
        const product = variant?.product_id;
        return {
          ...item,
          product: product
            ? { _id: product._id?.toString(), name: product.name }
            : null,
          variant: variant,
          price: item.price,
          total: item.total,
        };
      });
    },
    voucher: (shopOrder, _, { models }) =>
      shopOrder.voucher_id
        ? models.Voucher.findById(shopOrder.voucher_id)
        : null,
    discount: (shopOrder) => {
      // Nếu có trường amounts.total_discount thì lấy từ đó
      if (shopOrder.amounts && shopOrder.amounts.total_discount) {
        // Xử lý kiểu Decimal128 nếu cần
        if (shopOrder.amounts.total_discount.$numberDecimal) {
          return parseFloat(shopOrder.amounts.total_discount.$numberDecimal);
        }
        if (typeof shopOrder.amounts.total_discount === "object") {
          return parseFloat(shopOrder.amounts.total_discount.toString());
        }
        return shopOrder.amounts.total_discount;
      }
      // Nếu có trường discount là mảng, lấy tổng value
      if (Array.isArray(shopOrder.discount) && shopOrder.discount.length > 0) {
        return shopOrder.discount.reduce((sum, d) => {
          if (d.value && d.value.$numberDecimal) {
            return sum + parseFloat(d.value.$numberDecimal);
          }
          if (typeof d.value === "object") {
            return sum + parseFloat(d.value.toString());
          }
          return sum + (d.value || 0);
        }, 0);
      }
      // Không có giảm giá thì trả về 0
      return 0;
    },
    shipping: (shopOrder) => {
      // Trả về đúng cấu trúc typedef
      if (!shopOrder.shipping) return null;
      return {
        from_address: shopOrder.shipping.from_address,
        to_address: shopOrder.shipping.to_address,
      };
    },
  },
};

export default orderResolvers;
