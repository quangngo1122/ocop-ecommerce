import { graphql, GraphQLError } from "graphql";
import { uploadImageSingle } from "../../utils/cloudinary.js";

const userResolvers = {
  Query: {
    users: async (_, __, { models }) => {
      return await models.User.find({});
    },
    user: async (_, { _id }, { models }) => {
      const user = await models.User.findById(_id);
      if (!user) {
        throw new GraphQLError("Không tìm thấy người dùng", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return user;
    },
    userByFirebaseUid: async (_, { firebaseUid }, { models }) => {
      const user = await models.User.findOne({ firebaseUid });
      if (!user) {
        throw new GraphQLError(
          "Không tìm thấy người dùng với Firebase UID này",
          { extensions: { code: "NOT_FOUND" } }
        );
      }
      return {
        ...user.toObject(),
        _id: user._id.toString(),
      };
    },
    userByEmail: async (_, { email }, { models }) => {
      const user = await models.User.findOne({ email });
      if (!user) {
        throw new GraphQLError("Không tìm thấy người dùng với email này", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return {
        ...user.toObject(),
        _id: user._id.toString(),
      };
    },
    address: async (_, { userId, addressId }, { models }) => {
      const user = await models.User.findById(userId);
      if (!user)
        throw new GraphQLError("Không tìm thấy người dùng", {
          extensions: { code: "NOT_FOUND" },
        });
      if (!Array.isArray(user.address))
        throw new GraphQLError("Không có địa chỉ", {
          extensions: { code: "NOT_FOUND" },
        });
      const addr = user.address.find(
        (a) => a && a._id && a._id.toString() === addressId
      );
      if (!addr)
        throw new GraphQLError("Địa chỉ không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });

      return addr;
    },
    addresses: async (_, { userId }, { models }) => {
      const user = await models.User.findById(userId);
      if (!user)
        throw new GraphQLError("Không tìm thấy người dùng", {
          extensions: { code: "NOT_FOUND" },
        });
      return user.address || [];
    },
    myCart: async (_, { filter, pagination }, { models, user }) => {
      // 1. Kiểm tra đăng nhập
      if (!user) {
        throw new GraphQLError("Bạn cần đăng nhập", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      // 2. Lấy giỏ hàng từ user
      let cart = user.cart || [];
      if (cart.length === 0) return [];

      // ✅ 3. Lọc theo isChecked (nếu có)
      if (filter?.isChecked !== undefined) {
        cart = cart.filter((item) => item.isChecked === filter.isChecked);
      }

      // ✅ 4. Phân trang (offset, limit)
      const { offset = 0, limit } = pagination || {};
      if (typeof limit === "number") {
        cart = cart.slice(offset, offset + limit);
      } else if (offset > 0) {
        cart = cart.slice(offset);
      }

      // 5. Lấy danh sách Variant từ cart
      const variantIds = cart.map((item) => item.VariantId);
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate({
          path: "product_id",
          populate: {
            path: "shop_id",
          },
        })
        .lean();

      // 6. Ghép dữ liệu cart với thông tin variant và product
      const enrichedCart = cart.map((item) => {
        const variant = variants.find(
          (v) => v._id.toString() === item.VariantId.toString()
        );
        const product = variant?.product_id;
        const shop = product?.shop_id;
        const shopId = shop?._id?.toString();

        return {
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          price: variant?.selling_price,
          stock_quantity: variant?.stock_quantity,
          isChecked: item.isChecked, // ✅ thêm vào
          createdAt: item.createdAt,
          product,
          shop,
          shopId,
          attributes: variant?.attributes || [],
        };
      });

      // 7. Gom nhóm theo shopId
      const grouped = {};
      for (const item of enrichedCart) {
        if (!item.shopId) continue;
        if (!grouped[item.shopId]) {
          grouped[item.shopId] = {
            shop: item.shop,
            items: [],
          };
        }
        grouped[item.shopId].items.push({
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          stock_quantity: item.stock_quantity,
          price: item.price,
          isChecked: item.isChecked, // ✅ trả về luôn
          product: item.product,
          attributes: item.attributes,
        });
      }

      // 8. Trả về mảng ShopCart
      return Object.values(grouped);
    },
  },

  Mutation: {
    createUser: async (_, { input }, { models }) => {
      // Validate gender
      if (input.gender && !["male", "female"].includes(input.gender)) {
        throw new GraphQLError(
          "Giới tính không hợp lệ. Chỉ chấp nhận 'male' hoặc 'female'.",
          { extensions: { code: "BAD_USER_INPUT" } }
        );
      }
      // Validate dateOfBirth
      if (input.dateOfBirth && isNaN(Date.parse(input.dateOfBirth))) {
        throw new GraphQLError("Ngày sinh không hợp lệ.", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }
      let avatarUrl = input.avatar;
      if (
        input.avatar &&
        typeof input.avatar === "object" &&
        input.avatar.createReadStream
      ) {
        avatarUrl = await uploadImageSingle(input.avatar);
      }
      const user = new models.User({ ...input, avatar: avatarUrl });
      await user.save();
      return user;
    },

    updateUser: async (_, { _id, input }, { models }) => {
      // Validate gender
      if (input.gender && !["male", "female"].includes(input.gender)) {
        throw new UserInputError(
          "Giới tính không hợp lệ. Chỉ chấp nhận 'male' hoặc 'female'."
        );
      }
      // Validate dateOfBirth
      if (input.dateOfBirth && isNaN(Date.parse(input.dateOfBirth))) {
        throw new UserInputError("Ngày sinh không hợp lệ.");
      }
      let updateData = { ...input };
      if (input.avatar) {
        updateData.avatar = await uploadImageSingle(input.avatar);
      }
      const user = await models.User.findByIdAndUpdate(
        _id,
        { $set: updateData },
        { new: true, runValidators: true }
      );
      if (!user) {
        throw new GraphQLError("User not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      return user;
    },

    deleteUser: async (_, { _id }, { models }) => {
      const user = await models.User.findByIdAndDelete(_id);
      return !!user;
    },
    // Thêm địa chỉ mới
    addAddress: async (_, { userId, input }, { models }) => {
      const user = await models.User.findById(userId);
      if (!user) throw new UserInputError("Không tìm thấy người dùng");
      if (!user.address) user.address = [];
      // Nếu thêm địa chỉ mặc định, bỏ isDefault của các địa chỉ khác
      if (input.isDefault) {
        user.address.forEach((addr) => (addr.isDefault = false));
      }
      user.address.push({ ...input });
      await user.save();
      return user.address;
    },
    // Sửa địa chỉ
    updateAddress: async (_, { userId, addressId, input }, { models }) => {
      const user = await models.User.findById(userId);
      if (!user) throw new UserInputError("Không tìm thấy người dùng");
      if (!Array.isArray(user.address))
        throw new GraphQLError("Không có địa chỉ", {
          extensions: { code: "NOT_FOUND" },
        });
      const idx = user.address.findIndex(
        (a) => a && a._id && a._id.toString() === addressId
      );
      if (idx === -1) throw new UserInputError("Địa chỉ không tồn tại");
      if (input.isDefault) {
        user.address.forEach((addr) => (addr.isDefault = false));
      }
      user.address[idx] = { ...user.address[idx], ...input };
      await user.save();
      return user.address;
    },
    // Xóa địa chỉ (không cho xóa địa chỉ mặc định)
    deleteAddress: async (_, { userId, addressId }, { models }) => {
      const user = await models.User.findById(userId);
      if (!user) throw new UserInputError("Không tìm thấy người dùng");
      if (!Array.isArray(user.address))
        throw new GraphQLError("Không có địa chỉ", {
          extensions: { code: "NOT_FOUND" },
        });
      const idx = user.address.findIndex(
        (a) => a && a._id && a._id.toString() === addressId
      );
      if (idx === -1) throw new UserInputError("Địa chỉ không tồn tại");
      if (user.address[idx].isDefault)
        throw new GraphQLError("Không thể xóa địa chỉ mặc định", {
          extensions: { code: "FORBIDDEN" },
        });
      user.address.splice(idx, 1);
      await user.save();
      return user.address;
    },
    // Đặt địa chỉ mặc định
    setDefaultAddress: async (_, { userId, addressId }, { models }) => {
      const user = await models.User.findById(userId);
      if (!user)
        throw new GraphQLError("Không tìm thấy người dùng", {
          extensions: { code: "NOT_FOUND" },
        });
      if (!Array.isArray(user.address))
        throw new GraphQLError("Không có địa chỉ", {
          extensions: { code: "NOT_FOUND" },
        });
      const idx = user.address.findIndex(
        (a) => a && a._id && a._id.toString() === addressId
      );
      if (idx === -1)
        throw new GraphQLError("Địa chỉ không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });
      // Đặt địa chỉ này là mặc định, các địa chỉ khác không còn là mặc định
      user.address.forEach((addr, i) => {
        addr.isDefault = i === idx;
      });
      await user.save();
      return user.address;
    },
    // Thêm sản phẩm vào giỏ hàng
    // addToCart: async (_, { userId, input }, { models, user }) => {
    //   if (!user)
    //     throw new GraphQLError(
    //       "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng",
    //       {
    //         extensions: { code: "UNAUTHORIZED" },
    //       }
    //     );

    //   // Tìm thông tin variant
    //   const variant = await models.Variants.findById(input.VariantId);
    //   if (!variant)
    //     throw new GraphQLError("Không tìm thấy biến thể sản phẩm", {
    //       extensions: { code: "NOT_FOUND" },
    //     });
    //   const sellingPrice = variant.selling_price || 0;
    //   if (!user.cart) user.cart = [];

    //   // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
    //   const existingItem = user.cart.find(
    //     (item) => item.VariantId.toString() === input.VariantId
    //   );

    //   if (existingItem) {
    //     // Nếu đã có, cập nhật số lượng và giá
    //     existingItem.quantity += input.quantity;
    //     existingItem.price = existingItem.quantity * sellingPrice;
    //   } else {
    //     // Nếu chưa có, thêm mới
    //     user.cart.push({
    //       VariantId: input.VariantId,
    //       quantity: input.quantity,
    //       price: input.quantity * sellingPrice,
    //       createdAt: new Date(),
    //     });
    //   }

    //   await user.save();
    //   return user.cart;
    // },
    addToCart: async (_, { input }, { models, user }) => {
      if (!user) {
        throw new GraphQLError(
          "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng",
          {
            extensions: { code: "UNAUTHORIZED" },
          }
        );
      }

      // Tìm variant và product
      const variant = await models.Variants.findById(input.VariantId).populate(
        "product_id"
      );
      if (!variant || !variant.product_id) {
        throw new GraphQLError("Không tìm thấy biến thể hoặc sản phẩm", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const product = variant.product_id;
      const shopId = product.shop_id.toString();
      const sellingPrice = variant.selling_price || 0;

      if (!user.cart) user.cart = [];

      const existingItem = user.cart.find(
        (item) => item.VariantId.toString() === input.VariantId
      );

      if (existingItem) {
        existingItem.quantity += input.quantity;
        existingItem.price = existingItem.quantity * sellingPrice;
      } else {
        user.cart.push({
          VariantId: input.VariantId,
          quantity: input.quantity,
          price: input.quantity * sellingPrice,
          createdAt: new Date(),
        });
      }

      await user.save();

      const cart = user.cart || [];
      const variantIds = cart.map((item) => item.VariantId);
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate({
          path: "product_id",
          populate: {
            path: "shop_id",
          },
        })
        .lean();

      // Gom nhóm theo shop
      const grouped = {};
      for (const item of cart) {
        const variant = variants.find(
          (v) => v._id.toString() === item.VariantId.toString()
        );
        const product = variant?.product_id;
        const shop = product?.shop_id;
        const shopId = shop?._id?.toString();

        if (!shopId) continue;

        if (!grouped[shopId]) {
          grouped[shopId] = {
            shop,
            items: [],
          };
        }

        grouped[shopId].items.push({
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          price: item.price,
          product,
        });
      }

      return Object.values(grouped); // Trả về dạng [ShopCart!]!
    },

    // Dò nhiều sản phẩm nếu sản phẩm nào chưa có thì thêm vào giỏ hàng, nếu có rồi thì cập nhật số lượng
    addListToCart: async (_, { userId, input }, { models, user }) => {
      if (!user) {
        throw new GraphQLError(
          "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng",
          {
            extensions: { code: "UNAUTHORIZED" },
          }
        );
      }

      if (!Array.isArray(input) || input.length === 0) {
        throw new GraphQLError("Danh sách sản phẩm không hợp lệ", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      if (!user.cart) user.cart = [];

      for (const item of input) {
        const { VariantId, quantity } = item;

        if (!VariantId || !quantity || quantity <= 0) continue;

        const variant = await models.Variants.findById(VariantId).populate(
          "product_id"
        );
        if (!variant || !variant.product_id) continue;

        const sellingPrice = variant.selling_price || 0;

        const existingItem = user.cart.find(
          (ci) => ci.VariantId.toString() === VariantId
        );

        if (existingItem) {
          existingItem.quantity += quantity;
          existingItem.price = existingItem.quantity * sellingPrice;
        } else {
          user.cart.push({
            VariantId,
            quantity,
            price: quantity * sellingPrice,
            createdAt: new Date(),
          });
        }
      }

      await user.save();

      // Trả về giỏ hàng dạng nhóm theo Shop (giống myCart)
      const cart = user.cart || [];
      const variantIds = cart.map((item) => item.VariantId);
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate({
          path: "product_id",
          populate: { path: "shop_id" },
        })
        .lean();

      const grouped = {};
      for (const item of cart) {
        const variant = variants.find(
          (v) => v._id.toString() === item.VariantId.toString()
        );
        const product = variant?.product_id;
        const shop = product?.shop_id;
        const shopId = shop?._id?.toString();

        if (!shopId) continue;

        if (!grouped[shopId]) {
          grouped[shopId] = {
            shop,
            items: [],
          };
        }

        grouped[shopId].items.push({
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          price: item.price,
          product,
        });
      }

      return Object.values(grouped); // Trả về dạng [ShopCart!]!
    },

    // Cập nhật số lượng sản phẩm trong giỏ hàng
    updateCartItem: async (
      _,
      { cartId, quantity, isChecked },
      { models, user }
    ) => {
      if (!user)
        throw new GraphQLError("Bạn cần đăng nhập", {
          extensions: { code: "UNAUTHENTICATED" },
        });

      // Tìm item trong cart
      const itemIndex = user.cart.findIndex(
        (item) => item._id.toString() === cartId
      );
      if (itemIndex === -1)
        throw new GraphQLError("Không tìm thấy sản phẩm trong giỏ hàng", {
          extensions: { code: "NOT_FOUND" },
        });

      const cartItem = user.cart[itemIndex];

      // Cập nhật số lượng (nếu có truyền)
      if (typeof quantity === "number") {
        if (quantity < 1) {
          throw new GraphQLError("Số lượng phải >= 1", {
            extensions: { code: "BAD_REQUEST" },
          });
        }

        cartItem.quantity = quantity;

        // Lấy lại giá bán từ variant
        const variant = await models.Variants.findById(cartItem.VariantId);
        if (!variant) {
          throw new GraphQLError("Không tìm thấy biến thể sản phẩm", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        cartItem.price = quantity * (variant.selling_price || 0);
      }

      // Cập nhật trạng thái isChecked (nếu có truyền)
      if (typeof isChecked === "boolean") {
        cartItem.isChecked = isChecked;
      }

      // Lưu thay đổi
      await user.save();

      // Build enrichedCart giống myCart
      const cart = user.cart || [];
      if (cart.length === 0) return [];

      const variantIds = cart.map((item) => item.VariantId);
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate({
          path: "product_id",
          populate: { path: "shop_id" },
        })
        .lean();

      const enrichedCart = cart.map((item) => {
        const variant = variants.find(
          (v) => v._id.toString() === item.VariantId.toString()
        );
        const product = variant?.product_id;
        const shop = product?.shop_id;

        return {
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          price: item.price,
          isChecked: item.isChecked,
          createdAt: item.createdAt,
          product,
          shop,
          shopId: shop?._id?.toString(),
          attributes: variant?.attributes || [],
        };
      });

      // Nhóm theo shop
      const grouped = {};
      for (const item of enrichedCart) {
        if (!item.shopId) continue;
        if (!grouped[item.shopId]) {
          grouped[item.shopId] = {
            shop: item.shop,
            items: [],
          };
        }
        grouped[item.shopId].items.push({
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          price: item.price,
          isChecked: item.isChecked,
          product: item.product,
          attributes: item.attributes,
        });
      }

      return Object.values(grouped);
    },

    // Xóa sản phẩm khỏi giỏ hàng
    removeFromCart: async (_, { cartId }, { models, user }) => {
      if (!user)
        throw new GraphQLError("Không tìm thấy người dùng", {
          extensions: { code: "NOT_FOUND" },
        });

      const itemIndex = user.cart.findIndex(
        (item) => item._id.toString() === cartId
      );
      if (itemIndex === -1)
        throw new GraphQLError("Sản phẩm không tồn tại trong giỏ hàng", {
          extensions: { code: "NOT_FOUND" },
        });

      // Xóa sản phẩm khỏi giỏ hàng
      user.cart.splice(itemIndex, 1);
      await user.save();

      // Gom nhóm lại theo shop (giống myCart)
      const cart = user.cart || [];
      const variantIds = cart.map((item) => item.VariantId);
      const variants = await models.Variants.find({ _id: { $in: variantIds } })
        .populate({
          path: "product_id",
          populate: { path: "shop_id" },
        })
        .lean();

      const grouped = {};
      for (const item of cart) {
        const variant = variants.find(
          (v) => v._id.toString() === item.VariantId.toString()
        );
        const product = variant?.product_id;
        const shop = product?.shop_id;
        const shopId = shop?._id?.toString();

        if (!shopId) continue;

        if (!grouped[shopId]) {
          grouped[shopId] = {
            shop,
            items: [],
          };
        }

        grouped[shopId].items.push({
          _id: item._id,
          VariantId: item.VariantId,
          quantity: item.quantity,
          price: item.price,
          product,
        });
      }

      // Đảm bảo items luôn là mảng (không null)
      const result = Object.values(grouped).map((group) => ({
        ...group,
        items: group.items || [],
      }));

      return result;
    },
  },
};

export default userResolvers;
