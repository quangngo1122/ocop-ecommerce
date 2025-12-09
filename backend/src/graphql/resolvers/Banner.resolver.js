import { GraphQLError } from "graphql";
import {
  uploadImageSingle,
  deleteImageSingle,
} from "../../utils/cloudinary.js";

const bannerResolvers = {
  Query: {
    banner: async (_, { _id }, { models }) => {
      try {
        const banner = await models.Banner.findById(_id);
        if (!banner) {
          throw new GraphQLError("Banner not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        return banner;
      } catch (error) {
        console.error("Get banner error:", error);
        throw new GraphQLError("Failed to fetch banner", {
          extensions: { code: "FETCH_ERROR", details: error.message },
        });
      }
    },
    banners: async (_, { filter, pagination }, { models }) => {
      try {
        // Xây dựng query filter
        const query = {};
        if (filter) {
          if (filter.title) {
            query.title = { $regex: filter.title, $options: "i" };
          }
          if (filter.status) {
            query.status = filter.status;
          }
        }
        // Thiết lập pagination
        const page = Math.max(0, pagination?.offset || 0);
        const limit = Math.min(50, pagination?.limit || 100);

        // Đếm tổng số records
        const total = await models.Banner.countDocuments(query);

        // Query danh sách với sort
        const items = await models.Banner.find(query)
          .skip(page * limit)
          .limit(limit)
          .sort({ createdAt: -1 });

        return {
          items,
          total,
          hasMore: total > (page + 1) * limit,
        };
      } catch (error) {
        console.error("List banners error:", error);
        throw new GraphQLError("Failed to fetch banners", {
          extensions: { code: "FETCH_ERROR", details: error.message },
        });
      }
    },
  },
  Mutation: {
    createBanner: async (_, { input }, { models }) => {
      console.log("toi day");
      try {
        console.log("toi day 1");

        const { title, image, link, status } = input;

        if (!image) {
          throw new GraphQLError("Image is required", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        console.log("toi day 2");

        const imageUrl = await uploadImageSingle(image);

        // console.log("Uploaded image URL:", imageUrl);

        if (!imageUrl) {
          throw new GraphQLError("Image upload failed", {
            extensions: { code: "UPLOAD_FAILED" },
          });
        }

        const newBanner = await models.Banner.create({
          title,
          image: imageUrl,
          link,
          status,
        });

        return newBanner;
      } catch (error) {
        console.error("Create banner error:", error);
        throw new GraphQLError("Failed to create banner", {
          extensions: {
            code: error?.extensions?.code || "CREATE_ERROR",
            details: error.message,
          },
        });
      }
    },

    updateBanner: async (_, { _id, input }, { models }) => {
      try {
        let updateData = { ...input };

        // Nếu có ảnh mới thì xử lý upload trước
        if (input.image) {
          const file = await input.image; // giải Promise
          await deleteImageSingle(input.image);
          const imageUrl = await uploadImageSingle(file);

          if (!imageUrl) {
            throw new GraphQLError("Image upload failed", {
              extensions: { code: "UPLOAD_FAILED" },
            });
          }
          updateData.image = imageUrl; // gán URL string
        }

        const banner = await models.Banner.findByIdAndUpdate(
          _id,
          { $set: updateData },
          { new: true, runValidators: true }
        );

        if (!banner) {
          throw new GraphQLError("Banner not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }

        return banner;
      } catch (error) {
        console.error("Update banner error:", error);
        throw new GraphQLError("Failed to update banner", {
          extensions: { code: "UPDATE_ERROR", details: error.message },
        });
      }
    },

    deleteBanner: async (_, { _id }, { models }) => {
      try {
        const banner = await models.Banner.findByIdAndDelete(_id);
        await deleteImageSingle(banner.image);
        if (!banner) {
          throw new GraphQLError("Banner not found", {
            extensions: { code: "NOT_FOUND" },
          });
        }
        return true;
      } catch (error) {
        console.error("Delete banner error:", error);
        throw new GraphQLError("Failed to delete banner", {
          extensions: { code: "DELETE_ERROR", details: error.message },
        });
      }
    },
  },
};

export default bannerResolvers;
