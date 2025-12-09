import slugify from "slugify";
import { GraphQLError } from "graphql";
import {
  uploadImageSingle,
  uploadImageMultiple,
  deleteImageSingle,
} from "../../utils/cloudinary.js";

function getVariantKey(attrs) {
  return attrs
    .map((a) => `${a.name}:${a.value}`)
    .sort()
    .join("|");
}
function cartesianProduct(arr) {
  return arr.reduce((a, b) => a.flatMap((d) => b.map((e) => [...d, e])), [[]]);
}

async function getAllChildCategoryIds(models, parentId) {
  const ids = [parentId];
  const children = await models.Category.find({
    parent: parentId,
    status: "active",
  }).select("_id");
  for (const child of children) {
    const childIds = await getAllChildCategoryIds(models, child._id);
    ids.push(...childIds);
  }
  return ids;
}

import ProductAuditLog from "../../models/ProductAuditLog.model.js";

const productResolvers = {
  Query: {
    product: async (_, { filter }, { models }) => {
      const { _id, slug } = filter || {};

      // Tìm product theo _id hoặc slug
      const query = _id ? { _id } : slug ? { slug } : null;

      if (!query) {
        throw new GraphQLError("Thiếu điều kiện filter (_id hoặc slug)", {
          extensions: { code: "MISSING_FILTER" },
        });
      }

      const product = await models.Product.findOne(query)
        .populate({
          path: "shop_id",
          populate: {
            path: "owner",
            model: "User",
          },
        })
        .populate("category_id");

      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: { code: "PRODUCT_NOT_FOUND" },
        });
      }

      // Lấy variants theo product_id
      const variants = await models.Variants.find({
        product_id: product._id,
      }).lean();

      // Ép kiểu về object thuần và bổ sung các field cần thiết
      const productObject = product.toObject();
      productObject.variants = variants || [];
      productObject._id = product._id.toString();

      // Đảm bảo có trường giá
      productObject.price = {
        ...productObject.price,
        min_price: productObject.price?.min_price ?? 0,
        max_price: productObject.price?.max_price ?? 0,
      };

      // Đảm bảo có category
      if (!productObject.category_id) {
        productObject.category_id = {
          _id: "",
          name: "Uncategorized",
        };
      }

      return productObject;
    },

    productAuditLogs: async (
      _,
      { productId, variantId, limit = 20, offset = 0 },
      { models }
    ) => {
      const query = { product_id: productId };
      if (variantId) query.variant_id = variantId;
      const logs = await models.ProductAuditLog.find(query)
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit)
        .lean();
      return logs.map((log) => ({
        ...log,
        _id: log._id.toString(),
      }));
    },

    products: async (_, { filter, pagination }, { models }) => {
      const query = {};

      // Thêm lọc theo tên nếu có
      if (filter?.name) {
        query.name = { $regex: filter.name, $options: "i" };
      }
      if (filter?.shopId) {
        query.shop_id = filter.shopId;
      }
      if (filter?.categoryId) {
        const categoryIds = await getAllChildCategoryIds(
          models,
          filter.categoryId
        );
        query.category_id = { $in: categoryIds };
      }

      if (filter?.status) {
        query.status = filter.status;
      }
      if (filter?.minPrice) {
        query["price.min_price"] = { $gte: filter.minPrice };
      }
      if (filter?.maxPrice) {
        query["price.max_price"] = { $lte: filter.maxPrice };
      }

      let shopIdsByProvince = null;
      if (filter?.provinceId) {
        const shops = await models.Shop.find({
          "address.province_id": filter.provinceId,
        }).select("_id");

        shopIdsByProvince = shops.map((s) => s._id);
        query.shop_id = { $in: shopIdsByProvince };
      }

      let shopIdsByDistrict = null;
      if (filter?.districtId) {
        const shops = await models.Shop.find({
          "address.district_id": filter.districtId,
        }).select("_id");

        shopIdsByDistrict = shops.map((s) => s._id);
        query.shop_id = { $in: shopIdsByDistrict };
      }

      const offset = pagination?.offset || 0;
      const limit = pagination?.limit || 100;

      const sortFields = {
        sortByPrice: "price.min_price",
        sortByName: "name",
        sortByDate: "createdAt",
        sortByRating: "rating",
        sortBySold: "sold",
      };

      let sort = { createdAt: -1 }; // mặc định

      if (filter) {
        sort = {};
        for (const key in sortFields) {
          if (filter[key]) {
            sort[sortFields[key]] = filter[key] === "ascending" ? 1 : -1;
          }
        }
        // Nếu không có tiêu chí nào được chọn thì fallback
        if (Object.keys(sort).length === 0) {
          sort = { createdAt: -1 };
        }
      }

      const total = await models.Product.countDocuments(query);

      const products = await models.Product.find(query)
        .populate("shop_id")
        .populate("category_id")
        .skip(offset)
        .limit(limit)
        .sort(sort);

      const productIds = products.map((p) => p._id);
      const variants = await models.Variants.find({
        product_id: { $in: productIds },
      }).lean();

      const productWithVariants = products.map((product) => {
        const matchedVariants = variants.filter(
          (v) => v.product_id.toString() === product._id.toString()
        );
        const obj = product.toObject();
        obj.variants = matchedVariants;
        obj._id = product._id.toString();
        return obj;
      });

      return {
        items: productWithVariants,
        total,
        hasMore: total > offset + limit,
      };
    },

    variant: async (_, { variantId }, { models }) => {
      const variant = await models.Variants.findOne({
        _id: variantId,
      });

      if (!variant) {
        throw new GraphQLError("Variant not found", {
          extensions: { code: "VARIANT_NOT_FOUND" },
        });
      }

      return variant;
    },
  },

  Mutation: {
    createProduct: async (_, { input }, { models, user, shop }) => {
      if (!user || user.role !== "seller") {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      if (!shop) {
        throw new GraphQLError("Shop not found", {
          extensions: { code: "SHOP_NOT_FOUND" },
        });
      }

      const category = await models.Category.findById(input.categoryId);
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "CATEGORY_NOT_FOUND" },
        });
      }

      // ✅ Validate thông tin sản phẩm cơ bản
      if (!input.name || !input.description || !input.images?.length) {
        throw new GraphQLError(
          "Thiếu thông tin sản phẩm (tên, mô tả hoặc ảnh)",
          {
            extensions: { code: "INVALID_INPUT" },
          }
        );
      }

      // ✅ Validate biến thể (nếu có)
      if (input.variantCombinations?.length > 0) {
        for (const [
          index,
          combination,
        ] of input.variantCombinations.entries()) {
          if (
            !combination.attributes?.length ||
            !combination.image ||
            !combination.stock_quantity ||
            !combination.sku
          ) {
            throw new GraphQLError(
              `Thiếu thông tin cho biến thể số ${
                index + 1
              } (attributes, image, stock_quantity, sku là bắt buộc)`,
              {
                extensions: { code: "INVALID_VARIANT" },
              }
            );
          }
        }
      }

      // 1. Tạo slug duy nhất
      const baseSlug = slugify(input.name, { lower: true, strict: true });
      let slug = baseSlug;
      let count = 1;
      while (await models.Product.exists({ slug })) {
        slug = `${baseSlug}-${count++}`;
      }

      // 2. Upload ảnh sản phẩm
      const productImages = await Promise.all(
        input.images.map((file) => uploadImageSingle(file))
      );

      // 3. Tạo sản phẩm trước
      const product = await models.Product.create({
        name: input.name,
        slug,
        shop_id: shop._id,
        category_id: input.categoryId,
        description: input.description,
        specifications: input.specifications,
        images: productImages,
        price: {
          ...input.price,
        },
      });

      // 4. Xử lý biến thể (nếu có)
      const prices = [];
      const variants = await Promise.all(
        (input.variantCombinations || []).map(async (combination) => {
          const variantSlug = slugify(
            `${input.name}-${combination.attributes
              .map((a) => a.value)
              .join("-")}`,
            { lower: true, strict: true }
          );

          const variantImage = await uploadImageSingle(combination.image);
          const sellingPrice = combination.price ?? input.price.regular;

          prices.push(sellingPrice);

          return await models.Variants.create({
            product_id: product._id,
            slug: variantSlug,
            image: variantImage,
            stock_quantity: combination.stock_quantity ?? 0,
            attributes: combination.attributes,
            weight: combination.weight,
            length: combination.length,
            width: combination.width,
            height: combination.height,
            sku: combination.sku,
            selling_price: sellingPrice,
          });
        })
      );

      // xử lý kho hàng
      const batches = await Promise.all(
        variants.map(async (v) => {
          const qty = Number(v.stock_quantity ?? 0);

          // import_price: ưu tiên giá bán biến thể, fallback sang input.price.regular, cuối cùng là 0
          const importPrice = Number(
            v.selling_price ?? input?.price?.regular ?? 0
          );

          const batch = await models.InventoryBatches.create({
            product_id: product._id,
            variant_id: v._id,
            shop_id: shop._id,
            batch_number: `INIT-${Date.now()}-${String(v._id).slice(-6)}`, // tránh trùng
            quantity: qty,
            remaining_quantity: qty,
            import_price: importPrice,
            // import_date KHÔNG cần truyền vì đã default: Date.now trong schema
          });

          // Ghi nhật ký kho (audit)
          await models.InventoryLog.create({
            shop_id: shop._id,
            product_id: product._id,
            variant_id: v._id,
            batch_id: batch._id,
            action_type: "import",
            quantity_change: qty,
            old_value: 0,
            new_value: qty,
            note: "Khởi tạo kho khi tạo sản phẩm",
            user_id: user._id,
          });

          return batch;
        })
      );

      const stockQuantity = variants.reduce(
        (total, v) => total + (v.stock_quantity || 0),
        0
      );

      await product.updateOne({
        variants: variants.map((v) => v._id),
        stock: stockQuantity,
      });

      // 5. Cập nhật min/max giá nếu có biến thể
      if (prices.length > 0) {
        const min_price = Math.min(...prices);
        const max_price = Math.max(...prices);

        await product.updateOne({
          price: {
            ...input.price,
            regular: min_price,
            min_price,
            max_price,
          },
        });
      }

      // 6. Ghi nhận lịch sử tạo sản phẩm
      await ProductAuditLog.create({
        product_id: product._id,
        action_type: "product_create",
        changes: Object.keys(product._doc).map((field) => ({
          field,
          old_value: null,
          new_value: product[field],
        })),
      });

      return product;
    },

    updateProductStatus: async (_, { productId, status }, { models, user }) => {
      if (!user)
        throw new GraphQLError("user not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      const product = await models.Product.findById(productId);
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "PRODUCT_NOT_FOUND" },
        });
      const shop = await models.Shop.findById(product.shop_id);
      if (
        !shop ||
        (shop.owner.toString() !== user._id.toString() && user.role !== "admin")
      ) {
        throw new Error("Not authorized to update this product");
      }

      const oldStatus = product.status;
      product.status = status;
      product.updatedAt = new Date();

      await ProductAuditLog.create({
        product_id: product._id,
        action_type: "product_status_update",
        changes: [
          {
            field: "status",
            old_value: oldStatus,
            new_value: status,
          },
        ],
      });

      await product.save();

      return product;
    },

    // tách logic xử lý thông tin sản phẩm và biến thể ra riêng
    updateProduct: async (_, { productId, input }, { models, user, shop }) => {
      if (!user || user.role !== "seller") {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      if (!shop) {
        throw new GraphQLError("Shop not found", {
          extensions: { code: "SHOP_NOT_FOUND" },
        });
      }

      const product = await models.Product.findById(productId);
      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: { code: "PRODUCT_NOT_FOUND" },
        });
      }

      if (!product.shop_id.equals(shop._id)) {
        throw new GraphQLError(
          "You do not have permission to update this product",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      // Kiểm tra danh mục (nếu thay đổi)
      if (input.categoryId) {
        const category = await models.Category.findById(input.categoryId);
        if (!category) {
          throw new GraphQLError("Category not found", {
            extensions: { code: "CATEGORY_NOT_FOUND" },
          });
        }
      }

      const updates = {};
      const changes = [];

      // 1. Nếu tên thay đổi → tạo slug mới
      if (input.name && input.name !== product.name) {
        const baseSlug = slugify(input.name, { lower: true, strict: true });
        let slug = baseSlug;
        let count = 1;
        while (
          await models.Product.exists({ slug, _id: { $ne: product._id } })
        ) {
          slug = `${baseSlug}-${count++}`;
        }
        updates.slug = slug;
        changes.push({
          field: "slug",
          old_value: product.slug,
          new_value: slug,
        });
      }

      // 2. Upload ảnh nếu có
      if (input.images && input.images.length > 0) {
        const uploadedImages = await Promise.all(
          input.images.map((file) => uploadImageSingle(file))
        );
        updates.images = uploadedImages;
        changes.push({
          field: "images",
          old_value: product.images,
          new_value: uploadedImages,
        });
      }

      // 3. So sánh và cập nhật các trường khác
      const fieldsToUpdate = [
        "name",
        "description",
        "specifications",
        "seo",
        "categoryId",
        "price",
      ];

      fieldsToUpdate.forEach((field) => {
        const dbField = field === "categoryId" ? "category_id" : field;

        if (
          input[field] !== undefined &&
          JSON.stringify(input[field]) !== JSON.stringify(product[dbField])
        ) {
          updates[dbField] = input[field];
          changes.push({
            field: dbField,
            old_value: product[dbField],
            new_value: input[field],
          });
        }
      });

      // 4. Cập nhật
      if (Object.keys(updates).length > 0) {
        await models.Product.updateOne({ _id: productId }, { $set: updates });
      }

      // 5. Ghi log thay đổi
      if (changes.length > 0) {
        await models.ProductAuditLog.create({
          product_id: product._id,
          action_type: "product_update",
          changes,
        });
      }

      return await models.Product.findById(productId);
    },

    updateVariant: async (_, { variantId, input }, { models, user, shop }) => {
      if (!user || (user.role !== "seller" && user.role !== "admin")) {
        throw new GraphQLError("Unauthorized", {
          extensions: { code: "UNAUTHORIZED" },
        });
      }

      const variant = await models.Variants.findById(variantId);
      if (!variant) {
        throw new GraphQLError("Variant not found", {
          extensions: { code: "VARIANT_NOT_FOUND" },
        });
      }

      // Lấy sản phẩm để kiểm tra quyền sở hữu
      const product = await models.Product.findById(variant.product_id);
      if (!product) {
        throw new GraphQLError("Product not found", {
          extensions: { code: "PRODUCT_NOT_FOUND" },
        });
      }

      // Chỉ chủ shop mới được update
      if (product.shop_id.toString() !== shop._id?.toString()) {
        throw new GraphQLError(
          "You do not have permission to update this variant",
          {
            extensions: { code: "FORBIDDEN" },
          }
        );
      }

      const updates = {};
      const changes = [];

      // Cập nhật các trường đơn giản
      const fields = [
        "slug",
        "selling_price",
        "stock_quantity",
        "weight",
        "length",
        "width",
        "height",
        "sku",
      ];
      fields.forEach((field) => {
        if (input[field] !== undefined && input[field] !== variant[field]) {
          updates[field] = input[field];
          changes.push({
            field,
            old_value: variant[field],
            new_value: input[field],
          });
        }
      });

      // Cập nhật attributes nếu có
      if (input.attributes) {
        updates.attributes = input.attributes;
        changes.push({
          field: "attributes",
          old_value: variant.attributes,
          new_value: input.attributes,
        });
      }

      // Cập nhật ảnh nếu có
      if (input.image) {
        let uploadedImage;
        if (typeof input.image === "string" && input.image.startsWith("http")) {
          uploadedImage = input.image;
        } else {
          await deleteImageSingle(variant.image);
          uploadedImage = await uploadImageSingle(input.image);
        }
        updates.image = uploadedImage;
        changes.push({
          field: "image",
          old_value: variant.image,
          new_value: uploadedImage,
        });
      }

      // Thực hiện update variant
      if (Object.keys(updates).length > 0) {
        await models.Variants.updateOne({ _id: variantId }, { $set: updates });
      }

      // Nếu có thay đổi => ghi log
      if (changes.length > 0) {
        await models.ProductAuditLog.create({
          product_id: product._id,
          variant_id: variant._id,
          action_type: "variant_update",
          changes,
        });
      }

      // Sau khi update variant => đồng bộ lại giá và tồn kho product
      const allVariants = await models.Variants.find({
        product_id: product._id,
      });

      if (allVariants.length > 0) {
        // Tính min - max price
        const prices = allVariants.map((v) => v.selling_price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Tính tổng stock
        const totalStock = allVariants.reduce(
          (acc, v) => acc + (v.stock_quantity || 0),
          0
        );

        await models.Product.updateOne(
          { _id: product._id },
          {
            $set: {
              "price.regular": minPrice,
              "price.min_price": minPrice,
              "price.max_price": maxPrice,
              stock: totalStock,
            },
          }
        );
      }

      // Trả về sản phẩm chứa variants vừa cập nhật
      const updatedProduct = await models.Product.findById(product._id).lean();
      const variants = await models.Variants.find({
        product_id: product._id,
      }).lean();

      updatedProduct.variants = variants;
      updatedProduct.id = updatedProduct._id.toString();
      return updatedProduct;
    },

    deleteProduct: async (_, { _id }, { models, user }) => {
      if (!user)
        throw new GraphQLError("user not found", {
          extensions: { code: "USER_NOT_FOUND" },
        });
      const product = await models.Product.findById(_id);
      if (!product)
        throw new GraphQLError("Product not found", {
          extensions: { code: "PRODUCT_NOT_FOUND" },
        });

      const shop = await models.Shop.findById(product.shop_id);
      if (!shop || shop.owner.toString() !== user._id.toString()) {
        throw new Error("Not authorized to delete this product");
      }

      await ProductAuditLog.create({
        product_id: product._id,
        action_type: "product_delete",
        changes: Object.keys(product._doc).map((field) => ({
          field,
          old_value: product[field],
          new_value: null,
        })),
      });

      product.status = "deleted";
      await product.save();

      return product;
    },
  },

  Product: {
    async rating(product, _, { models }) {
      const reviews = await models.Review.find({ product: product.id });
      const total = reviews.reduce((sum, r) => sum + r.rating, 0);
      return {
        average: reviews.length > 0 ? total / reviews.length : 0,
        count: reviews.length,
      };
    },
    price(product) {
      const toFloat = (val) => {
        if (!val) return 0;
        if (typeof val === "object" && "$numberDecimal" in val) {
          return parseFloat(val.$numberDecimal);
        }
        return parseFloat(val);
      };
      return {
        regular: toFloat(product.price?.min_price),
        min_price: toFloat(product.price?.min_price),
        max_price: toFloat(product.price?.max_price),
      };
    },
  },
};
export default productResolvers;
