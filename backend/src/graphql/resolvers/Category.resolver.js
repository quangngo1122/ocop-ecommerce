import { GraphQLError } from "graphql";
import slugify from "slugify";

const categoryResolvers = {
  Query: {
    categories: async (_, { filter, pagination }, { models }) => {
      try {
        const query = {};
        if (filter) {
          if (filter.name) {
            query.name = { $regex: filter.name, $options: "i" };
          }
          if (filter.slug) {
            query.slug = filter.slug;
          }
          if (filter._id) {
            query._id = filter.id;
          }
        }

        const page = Math.max(0, pagination?.offset || 0);
        const limit = Math.min(50, pagination?.limit || 100);

        const total = await models.Category.countDocuments(query);

        const categories = await models.Category.find(query)
          .populate("parent")
          .skip(page)
          .limit(limit)
          .sort({ createdAt: -1 });

        return {
          items: categories,
          total,
          hasMore: total > page + limit,
        };
      } catch (error) {
        console.error("List categories error:", error);
        throw new GraphQLError("Failed to fetch categories", {
          extensions: { code: "FETCH_ERROR", details: error.message },
        });
      }
    },

    category: async (_, { _id }, { models }) => {
      try {
        const category = await models.Category.findById(_id).populate("parent");
        return category || null;
      } catch (error) {
        console.error("Get category error:", error);
        throw new GraphQLError("Failed to fetch category", {
          extensions: { code: "FETCH_ERROR", details: error.message },
        });
      }
    },

    parentCategories: async (_, { pagination }, { models }) => {
      try {
        const query = { parent: null };

        const page = Math.max(0, pagination?.offset || 0);
        const limit = Math.min(50, pagination?.limit || 100);

        const total = await models.Category.countDocuments(query);

        const categories = await models.Category.find(query)
          .skip(page)
          .limit(limit)
          .sort({ createdAt: -1 });

        return {
          items: categories,
          total,
          hasMore: total > page + limit,
        };
      } catch (error) {
        console.error("Get parent categories error:", error);
        throw new GraphQLError("Failed to fetch parent categories", {
          extensions: { code: "FETCH_ERROR", details: error.message },
        });
      }
    },
  },

  Mutation: {
    createCategory: async (_, { input }, { models }) => {
      try {
        if (!input.name) {
          throw new GraphQLError("Name is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const slug =
          input.slug || slugify(input.name, { lower: true, strict: true });

        // Check if category with same slug exists
        const existingCategory = await models.Category.findOne({ slug });
        if (existingCategory) {
          throw new GraphQLError("Category with this name already exists", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const category = await models.Category.create({
          name: input.name,
          slug,
          parent: input.parentId || null,
          status: input.status || "active",
        });

        return category;
      } catch (error) {
        console.error("Create category error:", error);
        throw new GraphQLError(error.message || "Failed to create category");
      }
    },
    updateCategory: async (_, { _id, input }, { models }) => {
      const category = await models.Category.findById(_id);
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      // Xử lý cập nhật parent (danh mục cha)
      if (Object.prototype.hasOwnProperty.call(input, "parentId")) {
        category.parent = input.parentId || null;
      }
      // Cập nhật các trường khác
      if (input.name !== undefined) category.name = input.name;
      if (input.slug !== undefined) category.slug = input.slug;
      if (input.status !== undefined) category.status = input.status;
      await category.save();
      return category;
    },
    deleteCategory: async (_, { _id }, { models }) => {
      const category = await models.Category.findById(_id);
      if (!category) {
        throw new GraphQLError("Category not found", {
          extensions: { code: "NOT_FOUND" },
        });
      }
      await category.deleteOne();
      return category;
    },
  },

  Category: {
    children: async (parent, _, { models }) => {
      try {
        if (!parent?._id) return [];
        const children = await models.Category.find({ parent: parent._id });
        return children || [];
      } catch (error) {
        console.error("Get children error:", error);
        return [];
      }
    },
  },
};

export default categoryResolvers;
