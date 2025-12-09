import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import {
  uploadImageSingle,
  uploadImageMultiple,
  deleteImageSingle,
} from "../../utils/cloudinary.js";

const shopResolvers = {
  Query: {
    shop: async (_, { filter }, { models }) => {
      if (!filter) {
        throw new GraphQLError("Vui lòng nhập điều kiện truy vấn", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      let shop;

      if (filter._id) {
        shop = await models.Shop.findById(filter._id).populate("owner");
      } else if (filter.owner) {
        shop = await models.Shop.findOne({ owner: filter.owner }).populate(
          "owner"
        );
      } else {
        throw new GraphQLError("Cần truyền vào _id hoặc owner để tìm shop", {
          extensions: { code: "INVALID_INPUT" },
        });
      }

      if (!shop) {
        throw new GraphQLError("Shop không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const products = await models.Product.find({ shop_id: shop._id });

      return {
        ...shop.toObject(),
        products,
      };
    },

    myShop: async (_, __, { models, user, shop }) => {
      if (!user) {
        throw new GraphQLError("Bạn phải đăng nhập để xem thông tin shop", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (!shop) {
        throw new GraphQLError("Bạn chưa có cửa hàng nào", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      const shopDetails = await models.Shop.findById(shop._id);

      const products = await models.Product.find({
        shop_id: shopDetails._id,
      });

      const shopOwner = await models.User.findById(shopDetails.owner);
      // console.log(products);

      return {
        _id: shopDetails._id,
        name: shopDetails.name,
        owner: shopOwner,
        description: shopDetails.description,
        logo: shopDetails.logo,
        slug: shopDetails.slug,
        coverImage: shopDetails.coverImage,
        address: shopDetails.address,
        contact: shopDetails.contact,
        businessLicense: shopDetails.businessLicense,
        rating: shopDetails.rating,
        status: shopDetails.status,
        createdAt: shopDetails.createdAt,

        products,
      };
    },

    shops: async (_, { filter, pagination }, { models }) => {
      const query = {};
      if (filter) {
        // Handle filter conditions
        if (filter.status) query.status = filter.status;
        if (filter.ownerId) query.owner = filter.ownerId;
        if (filter.search) {
          query.name = { $regex: filter.search, $options: "i" };
        }
      }

      const total = await models.Shop.countDocuments(query);
      const shops = await models.Shop.find(query)
        .populate("owner")
        .populate("products")
        .populate("vouchers")
        .skip(pagination?.offset || 0)
        .limit(pagination?.limit || 100)
        .sort({ createdAt: -1 });

      return {
        items: shops,
        total,
        hasMore: total > (pagination?.offset || 0) + (pagination?.limit || 10),
      };
    },

    shopProducts: async (_, { shopId }, { models }) => {
      const products = await models.Product.find({ shop_id: shopId })
        .populate("category_id")
        .populate("shop_id")
        .sort({ createdAt: -1 });

      return {
        items: products.map((p) => ({
          ...p.toObject(),
          _id: p._id.toString(),
        })),
        total: products.length,
        hasMore: false, // hoặc tính theo pagination nếu có
      };
    },
  },
  Mutation: {
    updateShop: async (_, { _id, input }, { models, user }) => {
      // Check if user is authenticated
      if (!user) {
        throw new GraphQLError(
          "Bạn phải đăng nhập để cập nhật thông tin shop",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      const shop = await models.Shop.findById(_id);
      if (!shop) {
        throw new GraphQLError("Shop không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Check if the user is the owner of the shop
      if (shop.owner.toString() !== user._id.toString()) {
        throw new GraphQLError(
          "Bạn không có quyền cập nhật thông tin shop này",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      if (input.logo) {
        // Upload logo if provided
        await deleteImageSingle(shop.logo);
        const logoUrl = await uploadImageSingle(input.logo);
        input.logo = logoUrl;
      }

      if (input.coverImage) {
        // Upload cover image if provided
        await deleteImageSingle(shop.coverImage);
        const coverImageUrl = await uploadImageSingle(input.coverImage);
        input.coverImage = coverImageUrl;
      }

      // Update shop
      Object.assign(shop, input, { updatedAt: new Date() });
      await shop.save();

      const updatedShop = await models.Shop.findById(shop._id)
        .populate("owner")
        .populate("products")
        .populate("vouchers");

      return updatedShop;
    },

    updateShopStatus: async (
      _,
      { updateShopStatusId, status },
      { models, user }
    ) => {
      // Check if user is authenticated
      if (!user) {
        throw new GraphQLError(
          "Bạn phải đăng nhập để cập nhật trạng thái shop",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      const shop = await models.Shop.findById(updateShopStatusId);
      if (!shop) {
        throw new GraphQLError("Shop không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Check if the user is the owner of the shop or admin
      if (
        shop.owner.toString() !== user._id.toString() &&
        user.role !== "admin"
      ) {
        throw new GraphQLError(
          "Bạn không có quyền cập nhật trạng thái shop này",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      // Use a single, correct update operation to update the status
      const updatedShop = await models.Shop.findByIdAndUpdate(
        updateShopStatusId, // Correctly use the ID passed in the arguments
        { status: status, updatedAt: new Date() }, // Update the status field
        { new: true }
      )
        .populate("owner")
        .populate("products")
        .populate("vouchers");

      if (status === "active") {
        await models.User.findByIdAndUpdate(shop.owner, {
          role: "seller",
          updatedAt: new Date(),
        });
      }

      return updatedShop;
    },

    addBusinessLicense: async (
      _,
      { shopId, businessLicense },
      { models, user }
    ) => {
      // Kiểm tra đăng nhập
      if (!user) {
        throw new GraphQLError(
          "Bạn phải đăng nhập để thêm giấy phép kinh doanh",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      // Tìm shop
      const shop = await models.Shop.findById(shopId);
      if (!shop) {
        throw new GraphQLError("Shop không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Kiểm tra quyền sở hữu shop
      if (shop.owner.toString() !== user._id.toString()) {
        throw new GraphQLError(
          "Bạn không có quyền thêm giấy phép kinh doanh cho shop này",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      if (!businessLicense.images) {
        throw new GraphQLError("Vui lòng tải ít nhất 1 ảnh giấy phép", {
          extensions: { code: "FORBIDDEN" },
        });
      }

      // Upload hình ảnh nếu có
      let imageUrls = [];
      if (businessLicense.images && businessLicense.images.length > 0) {
        imageUrls = await uploadImageMultiple(businessLicense.images);
      }

      // Thêm giấy phép vào mảng
      shop.businessLicense.push({
        name: businessLicense.name,
        code: businessLicense.code,
        description: businessLicense.description,
        images: imageUrls,
      });

      // Lưu lại shop
      await shop.save();

      const updatedShop = await models.Shop.findById(shop._id)
        .populate("owner")
        .populate("products")
        .populate("vouchers");

      return updatedShop;
    },

    updateBusinessLicense: async (
      _,
      { businessLicenseId, businessLicense },
      { models, user, shop }
    ) => {
      // 1. Kiểm tra đăng nhập
      if (!user) {
        throw new GraphQLError(
          "Bạn phải đăng nhập để cập nhật giấy phép kinh doanh",
          { extensions: { code: "UNAUTHENTICATED" } }
        );
      }

      // 2. Nếu chưa có shop từ context thì tìm shop dựa trên businessLicenseId
      if (!shop) {
        shop = await models.Shop.findOne({
          "businessLicense._id": new mongoose.Types.ObjectId(businessLicenseId),
        });
      }

      if (!shop) {
        throw new GraphQLError("Không tìm thấy giấy phép kinh doanh", {
          extensions: { code: "LICENSE_NOT_FOUND" },
        });
      }

      // 3. Kiểm tra quyền sở hữu
      if (shop.owner.toString() !== user._id.toString()) {
        throw new GraphQLError(
          "Bạn không có quyền cập nhật giấy phép kinh doanh cho shop này",
          { extensions: { code: "FORBIDDEN" } }
        );
      }

      // 4. Upload hình ảnh nếu có
      let imageUrls;
      if (businessLicense.images && businessLicense.images.length > 0) {
        const urls = await uploadImageMultiple(businessLicense.images);
        imageUrls = urls;
      }

      // 5. Build dữ liệu cần update
      const setFields = { updatedAt: new Date() };
      if (businessLicense.name !== undefined)
        setFields["businessLicense.$[license].name"] = businessLicense.name;
      if (businessLicense.code !== undefined)
        setFields["businessLicense.$[license].code"] = businessLicense.code;
      if (businessLicense.description !== undefined)
        setFields["businessLicense.$[license].description"] =
          businessLicense.description;
      if (imageUrls !== undefined)
        setFields["businessLicense.$[license].images"] = imageUrls;

      // 6. Thực hiện update
      const res = await models.Shop.updateOne(
        { _id: shop._id },
        { $set: setFields },
        {
          arrayFilters: [
            {
              "license._id": new mongoose.Types.ObjectId(businessLicenseId),
            },
          ],
        }
      );

      // 7. Kiểm tra kết quả update
      if (res.modifiedCount === 0) {
        throw new GraphQLError(
          "Không tìm thấy giấy phép hoặc dữ liệu không thay đổi",
          {
            extensions: { code: "LICENSE_NOT_FOUND_OR_NO_CHANGE" },
          }
        );
      }

      // Sau khi updateOne thành công
      const updatedShop = await models.Shop.findById(shop._id)
        .populate("owner")
        .populate("products")
        .populate("vouchers");

      return updatedShop;
    },

    deleteBusinessLicense: async (
      _,
      { shopId, businessLicenseId },
      { models, user }
    ) => {
      // Check if user is authenticated
      if (!user) {
        throw new GraphQLError(
          "Bạn phải đăng nhập để xóa giấy phép kinh doanh",
          {
            extensions: { code: "UNAUTHENTICATED" },
          }
        );
      }

      const shop = await models.Shop.findById(shopId);
      if (!shop) {
        throw new GraphQLError("Shop không tồn tại", {
          extensions: { code: "NOT_FOUND" },
        });
      }

      // Check if the user is the owner of the shop
      if (shop.owner.toString() !== user._id.toString()) {
        throw new GraphQLError(
          "Bạn không có quyền xóa giấy phép kinh doanh của shop này",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      const exists = shop.businessLicense.find(
        (license) => license._id?.toString() === businessLicenseId
      );
      if (!exists) {
        throw new GraphQLError("Giấy phép kinh doanh không tồn tại", {
          extensions: { code: "LICENSE_NOT_FOUND" },
        });
      }

      // Find and remove the business license
      shop.businessLicense = shop.businessLicense.filter(
        (license) => license._id.toString() !== businessLicenseId
      );
      shop.updatedAt = new Date();
      await shop.save();

      const updatedShop = await models.Shop.findById(shop._id)
        .populate("owner")
        .populate("products")
        .populate("vouchers");

      return updatedShop;
    },
  },

  Shop: {
    products: async (parent, _, { models }) => {
      const products = await models.Product.find({ shop_id: parent._id });
      return products;
    },
    vouchers: async (parent, _, { models }) => {
      const vouchers = await models.Voucher.find({ shop_id: parent._id });
      return vouchers;
    },
  },
};

export default shopResolvers;
