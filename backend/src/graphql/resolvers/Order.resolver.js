import { GraphQLError } from "graphql";
import mongoose, { Query } from "mongoose";
import { startSession } from "mongoose";
import Order from "../../models/Order.model.js";
import Shop from "../../models/Shop.model.js";
import Variants from "../../models/Variants.model.js";
import Voucher from "../../models/Voucher.model.js";
import User from "../../models/User.model.js";
import ShopOrder from "../../models/ShopOrder.model.js";
import Product from "../../models/Product.model.js";

import { groupOrderItems, groupShopOrders } from "../../utils/function.js";

import {
  getAddressId,
  createGHN,
  getServiceShipping,
  getShippingFee,
  createGHNOrder,
  mapAddressToGHN,
  validateGHNInput,
} from "../../utils/api.js";

function validateAddress(address, type = "Địa chỉ") {
  const missingFields = [];
  if (!address.name) missingFields.push("tên");
  if (!address.phone) missingFields.push("số điện thoại");
  if (!address.address) missingFields.push("địa chỉ cụ thể");
  if (!address.province || !address.province_id) missingFields.push("tỉnh");
  if (!address.district || !address.district_id) missingFields.push("huyện");
  if (!address.ward || !address.ward_code) missingFields.push("xã/ward");

  if (missingFields.length > 0) {
    throw new GraphQLError(
      `${type} thiếu thông tin: ${missingFields.join(", ")}`,
      {
        extensions: { code: "ADDRESS_INCOMPLETE" },
      }
    );
  }

  // Validate phone (số điện thoại chỉ chứa chữ số, 9-11 ký tự)
  const phoneRegex = /^[0-9]{9,11}$/;
  if (!phoneRegex.test(address.phone)) {
    throw new GraphQLError(`${type} có số điện thoại không hợp lệ`, {
      extensions: { code: "INVALID_PHONE" },
    });
  }
}

const orderResolvers = {
  Query: {
    checkout: async (_, { input }, { user, models }) => {
      if (!user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      console.log(user);

      const address = user.address.find(
        (addr) => addr._id.toString() === input.addressId.toString()
      );

      console.log(address);

      if (!address) {
        throw new GraphQLError("Địa chỉ không tồn tại", {
          extensions: { code: "ADDRESS_NOT_FOUND" },
        });
      }

      let totalSubtotal = 0;
      let totalDiscount = 0;
      let totalShipping = 0;
      let total = 0;

      // 2. Duyệt qua từng shop order
      const shopItems = await Promise.all(
        input.shopOrderItems.map(async (shopInput) => {
          // 2.1 Shop
          const shop = await Shop.findById(shopInput.shopId)
            .populate("products")
            .populate("vouchers");
          if (!shop) {
            throw new GraphQLError(`Shop không tồn tại: ${shopInput.shopId}`, {
              extensions: { code: "SHOP_NOT_FOUND" },
            });
          }

          // 2.2 Variants
          const variantIds = shopInput.orderItems.map((i) => i.variantId);
          const variants = await Variants.find({
            _id: { $in: variantIds },
          }).populate("product_id");

          if (variants.length !== variantIds.length) {
            throw new GraphQLError("Một hoặc nhiều variant không tồn tại", {
              extensions: { code: "VARIANT_NOT_FOUND" },
            });
          }

          for (const variant of variants) {
            if (variant.product_id.shop_id.toString() !== shop._id.toString()) {
              throw new GraphQLError(
                `Variant ${variant._id} không thuộc shop ${shop._id}`,
                { extensions: { code: "INVALID_VARIANT_SHOP" } }
              );
            }
            const orderItem = shopInput.orderItems.find(
              (i) => i.variantId.toString() === variant._id.toString()
            );
            if (variant.stock_quantity < orderItem.quantity) {
              throw new GraphQLError(
                `Variant ${variant._id} không đủ tồn kho`,
                { extensions: { code: "OUT_OF_STOCK" } }
              );
            }
          }

          // 2.3 Voucher
          let voucher = null;
          let discount = 0;
          if (shopInput.voucherId) {
            voucher = await Voucher.findById(shopInput.voucherId);
            if (
              !voucher ||
              voucher.shop_id.toString() !== shop._id.toString() ||
              voucher.status !== "active"
            ) {
              throw new GraphQLError(
                `Voucher không hợp lệ cho shop ${shop._id}`,
                { extensions: { code: "INVALID_VOUCHER" } }
              );
            }
          }

          // 2.4 Items & subtotal
          const items = shopInput.orderItems.map((orderItem) => {
            const variant = variants.find(
              (v) => v._id.toString() === orderItem.variantId.toString()
            );
            const price = variant?.selling_price || 0;
            const subtotal = price * orderItem.quantity;
            return {
              variant,
              product: variant.product_id,
              attributes: variant.attributes,
              quantity: orderItem.quantity,
              price,
              subtotal,
              weight: variant.weight * orderItem.quantity,
            };
          });
          const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

          // 2.5 Giảm giá
          // 2.5 Giảm giá
          if (voucher) {
            // ✅ Kiểm tra điều kiện đơn hàng tối thiểu
            if (voucher.min_order_value && subtotal < voucher.min_order_value) {
              throw new GraphQLError(
                `Đơn hàng tối thiểu để áp dụng voucher là ${voucher.min_order_value}`,
                { extensions: { code: "VOUCHER_MIN_ORDER_NOT_MET" } }
              );
            }

            if (voucher.type === "percentage") {
              discount = Math.min(
                (subtotal * voucher.value) / 100,
                voucher.max_discount_amount || subtotal
              );
            } else if (voucher.type === "fixed_amount") {
              discount = voucher.value;
            }
          }

          // 2.6 Phí ship (dùng trực tiếp id GHN đã lưu)
          const fromIds = {
            provinceId: shop.address.province_id,
            districtId: shop.address.district_id,
            wardCode: shop.address.ward_code,
          };
          const toIds = {
            provinceId: address.province_id,
            districtId: address.district_id,
            wardCode: address.ward_code,
          };

          const services = await getServiceShipping({
            fromDistrictId: fromIds.districtId,
            toDistrictId: toIds.districtId,
          });
          if (!services || services.length === 0) {
            throw new GraphQLError("Không có dịch vụ GHN khả dụng", {
              extensions: { code: "GHN_NO_SERVICE" },
            });
          }

          const service = services[0];
          const totalWeight = items.reduce(
            (sum, i) => sum + (i.weight || 50),
            0
          );

          console.log(
            "fromDistrictId:" + fromIds.districtId,
            "fromWardCode:" + fromIds.wardCode,
            "toDistrictId:" + toIds.districtId,
            "toWardCode:" + toIds.wardCode,
            "weight:" + totalWeight,
            "serviceId:" + service.service_id,
            "serviceTypeId:" + service.service_type_id
          );

          console.log("=======");

          const shippingFee = await getShippingFee({
            fromDistrictId: fromIds.districtId,
            fromWardCode: fromIds.wardCode,
            toDistrictId: toIds.districtId,
            toWardCode: toIds.wardCode,
            weight: totalWeight,
            serviceId: service.service_id,
            serviceTypeId: service.service_type_id,
          });

          console.log("phi ship:", shippingFee);

          // 2.7 Tổng shop
          const shopTotal = subtotal - discount + shippingFee;

          totalSubtotal += subtotal;
          totalDiscount += discount;
          totalShipping += shippingFee;
          total += shopTotal;

          return {
            shop,
            items,
            voucher,
            subtotal,
            shippingFee,
            discount,
            total: shopTotal,
          };
        })
      );

      // 3. So sánh total input
      if (input.totalAmount && input.totalAmount !== total) {
        throw new GraphQLError("Sai lệch tổng tiền", {
          extensions: { code: "INVALID_TOTAL" },
        });
      }

      return {
        address,
        shopItems,
        orderSummary: {
          subtotal: totalSubtotal,
          shippingFee: totalShipping,
          discount: totalDiscount,
          total,
        },
      };
    },

    order: async (_, { filter }, { user }) => {
      if (!user) throw new GraphQLError("Unauthorized");

      const query = {};
      if (filter?.id) query._id = new mongoose.Types.ObjectId(filter.id);
      if (filter?.orderCode) query.order_code = filter.orderCode;

      const order = await Order.findOne(query)
        .populate({
          path: "shopOrders",
          populate: [
            { path: "shop_id" },
            { path: "voucher_id" },
            {
              path: "items.variant_id",
              populate: { path: "product_id", populate: "shop_id" },
            },
          ],
        })
        .populate("user_id")
        .exec();

      if (!order) throw new GraphQLError("Không tìm thấy đơn hàng");

      order.shopOrders = order.shopOrders.map((so) => ({
        ...so.toObject(),
        items: groupOrderItems(so.items, "variant"), // hoặc "product"
      }));

      return order;
    },

    orders: async (_, { filter }, { user }) => {
      if (!user) throw new GraphQLError("Unauthorized");

      const query = {};
      if (filter?.userId)
        query.user_id = new mongoose.Types.ObjectId(filter.userId);
      if (filter?.status) query.status = filter.status;
      if (filter?.paymentStatus) query["payment.status"] = filter.paymentStatus;
      if (filter?.paymentMethod) query["payment.method"] = filter.paymentMethod;
      if (filter?.fromDate || filter?.toDate) {
        query.createdAt = {};
        if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
        if (filter.toDate) query.createdAt.$lte = filter.toDate;
      }

      const orders = await Order.find(query)
        .populate({
          path: "shopOrders",
          populate: [
            { path: "shop_id" },
            { path: "voucher_id" },
            {
              path: "items.variant_id",
              populate: { path: "product_id", populate: "shop_id" },
            },
          ],
        })
        .populate("user_id")
        .sort({ createdAt: -1 })
        .exec();

      return orders.map((order) => ({
        ...order.toObject(),
        shopOrders: order.shopOrders.map((so) => ({
          ...so.toObject(),
          items: groupOrderItems(so.items, "variant"),
        })),
      }));
    },

    shopOrder: async (_, { filter }, { user }) => {
      if (!user) throw new GraphQLError("Unauthorized");

      const query = {};
      if (filter?.id) query._id = new mongoose.Types.ObjectId(filter.id);

      const shopOrders = await ShopOrder.find(query)
        .populate("shop_id")
        .populate("order_id")
        .populate("voucher_id")
        .populate({
          path: "items.variant_id",
          populate: { path: "product_id", populate: "shop_id" },
        })
        .exec();

      return shopOrders.map((so) => ({
        ...so.toObject(),
        items: groupOrderItems(so.items, "variant"),
      }));
    },

    shopOrders: async (_, { filter }, { user }) => {
      if (!user) throw new GraphQLError("Unauthorized");

      const query = {};
      if (filter?.userId)
        query.user_id = new mongoose.Types.ObjectId(filter.userId);
      if (filter?.shopId)
        query.shop_id = new mongoose.Types.ObjectId(filter.shopId);
      if (filter?.status) query.current_status = filter.status;
      if (filter?.paymentStatus) query["payment.status"] = filter.paymentStatus;
      if (filter?.fromDate || filter?.toDate) {
        query.createdAt = {};
        if (filter.fromDate) query.createdAt.$gte = filter.fromDate;
        if (filter.toDate) query.createdAt.$lte = filter.toDate;
      }

      const shopOrders = await ShopOrder.find(query)
        .populate("shop_id")
        .populate("order_id")
        .populate("voucher_id")
        .populate({
          path: "items.variant_id",
          populate: { path: "product_id", populate: "shop_id" },
        })
        .sort({ createdAt: -1 })
        .exec();

      return shopOrders.map((so) => ({
        ...so.toObject(),
        items: groupOrderItems(so.items, "variant"),
      }));
    },
  },

  Mutation: {
    createOrder: async (_, { input }, { user }) => {
      if (!user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 1) Lấy địa chỉ user
        const address = user.address.find(
          (addr) => addr._id.toString() === input.addressId.toString()
        );
        if (!address) {
          throw new GraphQLError("Địa chỉ không tồn tại", {
            extensions: { code: "ADDRESS_NOT_FOUND" },
          });
        }

        let totalSubtotal = 0;
        let totalDiscount = 0;
        let totalShipping = 0;
        let total = 0;
        const dmy = new Intl.DateTimeFormat("vi-VN", {
          second: "2-digit",
          minute: "2-digit",
          hour: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",

          timeZone: "Asia/Ho_Chi_Minh", // tùy chọn, để cố định múi giờ
        })
          .format(new Date())
          .replace(/\D/g, ""); // "25082025"

        // 2) Tạo Order
        const order = new Order({
          order_code: `${dmy}${Math.random()
            .toString(36)
            .slice(-6)}`.toUpperCase(),
          user_id: user._id,
          shopOrders: [],
          amounts: {
            subtotal: 0,
            total_discount: 0,
            shippingFee: 0,
            total: 0,
          },
          payment: {
            method: input.paymentMethod,
            status: input.paymentMethod === "cod" ? "cod" : "pending",
          },
          status: "active",
        });
        await order.save({ session });

        const shopOrderDocs = [];

        // 3) Duyệt qua từng shopOrder
        for (const shopInput of input.shopOrderItems) {
          // 3.1 Shop
          const shop = await Shop.findById(shopInput.shopId).session(session);
          if (!shop) {
            throw new GraphQLError(`Shop không tồn tại: ${shopInput.shopId}`, {
              extensions: { code: "SHOP_NOT_FOUND" },
            });
          }

          // 3.2 Lấy variants
          const variantIds = shopInput.orderItems.map((i) => i.variantId);
          const variants = await Variants.find({ _id: { $in: variantIds } })
            .populate("product_id")
            .session(session);

          if (variants.length !== variantIds.length) {
            throw new GraphQLError("Một hoặc nhiều variant không tồn tại", {
              extensions: { code: "VARIANT_NOT_FOUND" },
            });
          }

          // 3.3 Kiểm tra tồn kho
          for (const v of variants) {
            const oi = shopInput.orderItems.find(
              (i) => i.variantId.toString() === v._id.toString()
            );
            if (v.stock_quantity < oi.quantity) {
              throw new GraphQLError(`Variant ${v._id} không đủ tồn kho`, {
                extensions: { code: "OUT_OF_STOCK" },
              });
            }
          }

          // 3.4 Voucher
          let voucher = null;
          let discount = 0;
          if (shopInput.voucherId) {
            voucher = await Voucher.findById(shopInput.voucherId).session(
              session
            );
            if (
              !voucher ||
              voucher.shop_id.toString() !== shop._id.toString() ||
              voucher.status !== "active" ||
              voucher.quantity <= 0
            ) {
              throw new GraphQLError("Voucher không hợp lệ", {
                extensions: { code: "INVALID_VOUCHER" },
              });
            }
          }

          // 3.5 Items
          const items = shopInput.orderItems.map((oi) => {
            const v = variants.find(
              (vv) => vv._id.toString() === oi.variantId.toString()
            );
            const price = v.selling_price;
            const subtotal = price * oi.quantity;
            return {
              variant_id: v._id,
              product_id: v.product_id._id,
              quantity: oi.quantity,
              price,
              subtotal,
              attributes: v.attributes,
            };
          });

          const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0);

          if (voucher) {
            if (voucher.min_order_value && subtotal < voucher.min_order_value) {
              throw new GraphQLError(
                `Đơn hàng tối thiểu để áp dụng voucher là ${voucher.min_order_value}`,
                { extensions: { code: "VOUCHER_MIN_ORDER_NOT_MET" } }
              );
            }

            if (voucher.type === "percentage") {
              discount = Math.min(
                (subtotal * voucher.value) / 100,
                voucher.max_discount_amount || subtotal
              );
            } else if (voucher.type === "fixed_amount") {
              discount = voucher.value;
            }
          }

          // 3.6 Phí ship
          const services = await getServiceShipping({
            fromDistrictId: shop.address.district_id,
            toDistrictId: address.district_id,
          });
          if (!services?.length) {
            throw new GraphQLError("Không có dịch vụ GHN khả dụng", {
              extensions: { code: "GHN_NO_SERVICE" },
            });
          }
          const service = services[0];
          const totalWeight = items.length * 50; // mặc định 200/item

          // console.log("totalWeight", totalWeight);

          const shippingFee = await getShippingFee({
            fromDistrictId: shop.address.district_id,
            fromWardCode: shop.address.ward_code,
            toDistrictId: address.district_id,
            toWardCode: address.ward_code,
            weight: totalWeight,
            serviceId: service.service_id,
            serviceTypeId: service.service_type_id,
          });

          const shopTotal = subtotal - discount + shippingFee;

          totalSubtotal += subtotal;
          totalDiscount += discount;
          totalShipping += shippingFee;
          total += shopTotal;

          // 3.7 Trừ tồn kho
          for (const oi of shopInput.orderItems) {
            const v = variants.find(
              (vv) => vv._id.toString() === oi.variantId.toString()
            );
            v.stock_quantity -= oi.quantity;
            await v.save({ session });

            const product = await Product.findById(v.product_id._id).session(
              session
            );
            product.stock = await Variants.aggregate([
              { $match: { product_id: product._id } },
              { $group: { _id: null, total: { $sum: "$stock_quantity" } } },
            ]).then((r) => r[0]?.total || 0);
            await product.save({ session });
          }

          // 3.8 Trừ voucher
          if (voucher) {
            voucher.quantity -= 1;
            await voucher.save({ session });
          }

          // 3.9 Chuẩn hoá địa chỉ from_address (fallback name + phone)
          const from_address = {
            name: shop.address?.name || shop.name,
            phone: shop.address?.phone || shop.contact?.phone,
            address: shop.address?.address,
            province: shop.address?.province,
            district: shop.address?.district,
            ward: shop.address?.ward,
            province_id: shop.address?.province_id,
            district_id: shop.address?.district_id,
            ward_code: shop.address?.ward_code,
          };

          // Validate from_address
          validateAddress(from_address, "Địa chỉ gửi từ");

          // Validate to_address
          validateAddress(address, "Địa chỉ nhận");

          // 3.10 Lưu shop order
          const shopOrder = new ShopOrder({
            order_id: order._id,
            shop_id: shop._id,
            user_id: user._id,
            order_code: order.order_code,
            items,
            voucher_id: voucher?._id,
            amounts: {
              subtotal,
              total_discount: discount,
              shippingFee,
              total: shopTotal,
            },
            shipping: {
              from_address,
              to_address: address,
              method: "GHN",
              status: "pending",
              tracking_code: null,
            },
            weight: totalWeight,
            current_status: "pending",
            status_history: [{ status: "pending", updatedAt: new Date() }],
          });
          await shopOrder.save({ session });
          shopOrderDocs.push(shopOrder);
        }

        // 4) Update tổng Order
        order.shopOrders = shopOrderDocs.map((s) => s._id);
        order.amounts = {
          subtotal: totalSubtotal,
          total_discount: totalDiscount,
          shippingFee: totalShipping,
          total,
        };
        await order.save({ session });

        // 5) Commit
        await session.commitTransaction();

        // 6) Lấy dữ liệu trả về
        let result = await Order.findById(order._id)
          .populate({
            path: "shopOrders",
            populate: [
              { path: "shop_id" },
              { path: "voucher_id" },
              {
                path: "items.variant_id",
                populate: { path: "product_id" },
              },
            ],
          })
          .populate("user_id");

        // 7) Tạo GHN
        for (const s of result.shopOrders) {
          try {
            const variantsInfo = await Variants.find({
              _id: { $in: s.items.map((i) => i.variant_id) },
            }).populate("product_id");

            console.log(variantsInfo);

            const fromAddress = mapAddressToGHN(s.shipping.from_address);
            const toAddress = mapAddressToGHN(s.shipping.to_address);

            const missing = validateGHNInput(s, fromAddress, toAddress);
            if (missing.length > 0) {
              console.error("Thiếu thông tin GHN:", missing);
              continue;
            }

            const ghnOrderCode = await createGHNOrder(
              {
                shippingFrom: fromAddress,
                shippingTo: toAddress,
                orderItems: s.items.map((i) => ({
                  variantId: i.variant_id,
                  quantity: i.quantity,
                  price: i.price,
                  weight: 200,
                })),
                payment: result.payment.method,
                price: { final: s.amounts.total },
                weight: s.weight,
                note: s.note,
                serviceId: s.shipping.service_id,
                serviceTypeId: s.shipping.service_type,
              },
              variantsInfo
            );

            s.shipping.tracking_code = ghnOrderCode;
            s.shipping.status = "pending";
            await s.save();
          } catch (err) {
            console.error("GHN order creation failed:", err.message);
          }
        }

        return result;
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        console.error("Create order error:", error);
        throw new GraphQLError("Tạo đơn hàng thất bại", {
          extensions: { code: "ORDER_ERROR", details: error.message },
        });
      } finally {
        session.endSession();
      }
    },

    updateShopOrderStatus: async (
      _,
      { shopOrderId, status },
      { user, models }
    ) => {
      if (!user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      // Lấy shopOrder theo id
      const shopOrder = await models.ShopOrder.findById(shopOrderId)
        .populate("shop_id")
        .populate("voucher_id")
        .populate({
          path: "items.variant_id",
          populate: { path: "product_id", populate: "shop_id" },
        });

      if (!shopOrder) {
        throw new GraphQLError("Không tìm thấy đơn hàng", {
          extensions: { code: "ORDER_NOT_FOUND" },
        });
      }

      shopOrder.current_status = status;
      shopOrder.status_history.push({
        status,
        updatedAt: new Date(),
      });

      // Nếu đơn hàng thành công => trừ stock và cộng sold
      if (status === "delivered") {
        for (const item of shopOrder.items) {
          const variant = item.variant_id;
          if (variant) {
            // Trừ stock biến thể
            variant.stock_quantity = Math.max(
              0,
              variant.stock_quantity - item.quantity
            );
            await variant.save();

            // Cập nhật sold và stock tổng ở Product
            const product = await models.Product.findById(variant.product_id);
            if (product) {
              product.sold += item.quantity;

              // Tính lại tồn kho tổng (tổng stock của các variant)
              const variants = await models.Variants.find({
                product_id: product._id,
              });
              const totalStock = variants.reduce(
                (acc, v) => acc + v.stock_quantity,
                0
              );

              product.stock = totalStock;
              await product.save();
            }
          }
        }
      }

      await shopOrder.save();

      return {
        ...shopOrder.toObject(),
        items: groupOrderItems(shopOrder.items, "variant"),
      };
    },

    // cập nhật hủy đơn hàng, chỉ được hủy khi chưa xác nhận, hủy luôn cả các shopOrder có trong đơn hàng đó
    cancelOrder: async (_, { orderId, reason }, { user, models }) => {
      if (!user) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const session = await mongoose.startSession();
      session.startTransaction();

      try {
        // 1) Lấy order
        const order = await models.Order.findById(orderId)
          .populate({
            path: "shopOrders",
            populate: {
              path: "items.variant_id",
              populate: { path: "product_id" },
            },
          })
          .session(session);

        if (!order) {
          throw new GraphQLError("Không tìm thấy đơn hàng", {
            extensions: { code: "ORDER_NOT_FOUND" },
          });
        }

        const allPending = order.shopOrders.every(
          (shopOrder) => shopOrder.current_status === "pending"
        );

        if (!allPending) {
          throw new GraphQLError(
            "Đơn hàng chỉ có thể hủy khi tất cả shopOrder đang ở trạng thái pending",
            {
              extensions: { code: "CANNOT_CANCEL_CONFIRMED_ORDER" },
            }
          );
        }

        // 3) Hoàn kho cho từng item
        for (const shopOrder of order.shopOrders) {
          for (const item of shopOrder.items) {
            const variant = item.variant_id;
            if (variant) {
              // Cộng lại stock cho variant
              variant.stock_quantity += item.quantity;
              await variant.save({ session });

              // Cập nhật lại stock tổng ở product
              const product = variant.product_id;
              const totalStock = await models.Variants.aggregate([
                { $match: { product_id: product._id } },
                { $group: { _id: null, total: { $sum: "$stock_quantity" } } },
              ]);
              product.stock = totalStock[0]?.total || 0;
              await product.save({ session });
            }
          }

          // 4) Cập nhật trạng thái và lý do
          shopOrder.current_status = "cancelled_by_buyer";
          shopOrder.cancel_reason = reason || "customer_request";
          shopOrder.status_history.push({
            status: "cancelled_by_buyer",
            updatedAt: new Date(),
          });
          await shopOrder.save({ session });
        }

        // 5) Update order
        order.status = "cancelled";
        order.cancellation = {
          reason: reason || "Khách hàng hủy đơn",
          cancelledAt: new Date(),
        };
        await order.save({ session });

        await session.commitTransaction();
        return order;
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction();
        }
        console.error("Cancel order error:", error);
        throw new GraphQLError("Hủy đơn hàng thất bại", {
          extensions: { code: "CANCEL_ORDER_ERROR", details: error.message },
        });
      } finally {
        session.endSession();
      }
    },
  },
};

export default orderResolvers;
