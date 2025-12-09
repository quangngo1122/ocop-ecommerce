import admin from "../../config/firebase-admin.js";
import stream from "stream";
import { GraphQLError } from "graphql";
import {
  uploadImageSingle,
  uploadImageMultiple,
} from "../../utils/cloudinary.js";
import slugify from "slugify";

const mapProviderToEnum = (firebaseProvider) => {
  const providerMap = {
    "google.com": "google",
    "facebook.com": "facebook",
    password: "email",
  };
  return providerMap[firebaseProvider] || "email";
};

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];

const validateFile = async (filePromise) => {
  const file = await filePromise;
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    // console.log(file.mimetype);
    throw new GraphQLError("Định dạng file không hợp lệ", {
      extensions: { code: "BAD_USER_INPUT" },
    });
  }
  return file;
};

const validateFileSize = (file, maxSize = 5 * 1024 * 1024) => {
  // 5MB
  return new Promise((resolve, reject) => {
    let size = 0;
    const readStream = file.createReadStream();

    readStream.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxSize) {
        reject(
          new GraphQLError("File vượt quá dung lượng cho phép (5MB)", {
            extensions: { code: "BAD_USER_INPUT" },
          })
        );
      }
    });

    readStream.on("end", () => resolve(file));
    readStream.on("error", reject);
  });
};
const authResolvers = {
  Query: {
    getCurrentUser: async (_, __, { token, models }) => {
      if (!token) {
        throw new GraphQLError("Không tìm thấy token xác thực", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const user = await models.User.findOne({
          firebaseUid: decodedToken.uid,
        });

        if (!user) {
          throw new GraphQLError("Không tìm thấy người dùng", {
            extensions: { code: "UNAUTHENTICATED" },
          });
        }

        return {
          ...user.toObject(),
          _id: user._id.toString(),
          status: user.isActive ? "active" : "inactive",
          role: user.role.toUpperCase(),
        };
      } catch (error) {
        console.error("Get current user error:", error);
        throw new GraphQLError("Token không hợp lệ hoặc đã hết hạn", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }
    },
  },

  Mutation: {
    register: async (_, { input }, { models }) => {
      const { firebaseUid } = input;

      if (!firebaseUid) {
        throw new GraphQLError("Firebase UID là bắt buộc", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      try {
        if (!admin.apps.length) {
          throw new GraphQLError("Firebase chưa được cấu hình", {
            extensions: { code: "FIREBASE_CONFIG_ERROR" },
          });
        }

        let firebaseUser;
        try {
          firebaseUser = await admin.auth().getUser(firebaseUid);
        } catch (error) {
          console.error("Firebase get user error:", error);
          throw new GraphQLError("Không tìm thấy tài khoản Firebase", {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        const currentProviders = firebaseUser.providerData.map(
          (p) => p.providerId
        );
        const isGoogleLogin = currentProviders.includes("google.com");

        let user = await models.User.findOne({ firebaseUid });
        const existingUserWithEmail = await models.User.findOne({
          email: firebaseUser.email,
        });

        if (
          !user &&
          isGoogleLogin &&
          existingUserWithEmail &&
          existingUserWithEmail.provider === "email"
        ) {
          return {
            user: null,
            firebaseInfo: {
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              phoneNumber: firebaseUser.phoneNumber,
              providerId: "google.com",
            },
            needsAccountLinking: true,
            existingProvider: existingUserWithEmail.provider,
            accessToken: null,
            refreshToken: null,
          };
        }

        if (!user && !existingUserWithEmail) {
          user = await models.User.create({
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName:
              firebaseUser.displayName || firebaseUser.email.split("@")[0],
            phoneNumber: firebaseUser.phoneNumber || "",
            role: "user",
            isActive: true,
            provider: isGoogleLogin ? "google" : "email",
            providerIds: currentProviders,
            avatar:
              firebaseUser.photoURL ||
              "https://res.cloudinary.com/dtexmphc4/image/upload/v1750046642/default_avatar_ynxrjq.avif",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
        }

        if (user) {
          user.providerIds = currentProviders;
          await user.save();

          const customToken = await admin
            .auth()
            .createCustomToken(user.firebaseUid, {
              role: user.role,
              userId: user._id.toString(),
            });

          return {
            user: {
              ...user.toObject(),
              _id: user._id.toString(),
              status: user.isActive ? "active" : "inactive",
              role: user.role.toUpperCase(),
            },
            firebaseInfo: null,
            accessToken: customToken,
            refreshToken: null,
            needsAccountLinking: false,
          };
        }

        return {
          user: null,
          firebaseInfo: {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            phoneNumber: firebaseUser.phoneNumber,
            providerId: isGoogleLogin ? "google.com" : "password",
          },
          needsAccountLinking: true,
          existingProvider: existingUserWithEmail?.provider || null,
          accessToken: null,
          refreshToken: null,
        };
      } catch (error) {
        console.error("Register error:", error);
        if (error) {
          throw new GraphQLError(error.message, {
            extensions: { code: error.extensions?.code || "REGISTER_FAILED" },
          });
        }

        if (error.code === "auth/configuration-not-found") {
          throw new GraphQLError("Lỗi cấu hình Firebase", {
            extensions: { code: "FIREBASE_CONFIG_ERROR" },
          });
        }

        throw new GraphQLError("Đăng ký thất bại. Vui lòng thử lại sau.", {
          extensions: { code: "REGISTER_FAILED" },
        });
      }
    },

    linkGoogleAccount: async (_, __, { models, token }) => {
      if (!token) {
        throw new GraphQLError("Token xác thực không được cung cấp", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        const firebaseUser = await admin.auth().getUser(decodedToken.uid);

        const isGoogleLinked = firebaseUser.providerData.some(
          (provider) => provider.providerId === "google.com"
        );

        if (!isGoogleLinked) {
          throw new GraphQLError("Tài khoản Google chưa được liên kết", {
            extensions: { code: "GOOGLE_NOT_LINKED" },
          });
        }

        const user = await models.User.findOne({
          firebaseUid: decodedToken.uid,
        });

        if (!user) {
          throw new GraphQLError("Người dùng không tồn tại", {
            extensions: { code: "USER_NOT_FOUND" },
          });
        }

        const currentProviders = firebaseUser.providerData.map(
          (p) => p.providerId
        );

        if (!user.providerIds.includes("google.com")) {
          user.providerIds.push("google.com");
        }

        if (!user.avatar && firebaseUser.photoURL) {
          user.avatar = firebaseUser.photoURL;
        }

        await user.save();

        return {
          user: {
            ...user.toObject(),
            _id: user._id.toString(),
            status: user.isActive ? "active" : "inactive",
            role: user.role.toUpperCase(),
          },
          accessToken: token,
          refreshToken: null,
        };
      } catch (error) {
        console.error("Link Google error:", error);
        if (
          error instanceof UserInputError ||
          error instanceof AuthenticationError
        ) {
          throw error;
        }
        throw new GraphQLError("Không thể liên kết tài khoản Google", {
          extensions: { code: "LINK_GOOGLE_ERROR" },
        });
      }
    },

    registerSeller: async (_, { input }, { models, user, token }) => {
      console.log("tới đây 1");
      if (!user) {
        throw new GraphQLError("Bạn phải đăng nhập để đăng ký bán hàng", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      if (user.role === "seller") {
        throw new GraphQLError("Tài khoản đã là người bán hàng", {
          extensions: { code: "AccountWasSeller" },
        });
      }

      const existingShop = await models.Shop.findOne({ owner: user._id });
      if (existingShop) {
        throw new GraphQLError("Cửa hàng này đã tồn tại", {
          extensions: { code: "ExistShop" },
        });
      }

      if (!input.name || !input.description) {
        throw new GraphQLError("Tên và mô tả cửa hàng là bắt buộc", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!input.logo) {
        throw new GraphQLError("Logo cửa hàng là bắt buộc", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!input.coverImage) {
        throw new GraphQLError("Ảnh bìa cửa hàng là bắt buộc", {
          extensions: { code: "BAD_USER_INPUT" },
        });
      }

      if (!input.businessLicense?.length) {
        throw new GraphQLError(
          "Vui lòng cung cấp ít nhất 1 giấy phép kinh doanh",
          {
            extensions: { code: "BAD_USER_INPUT" },
          }
        );
      }
      console.log("tới đây 2");

      console.log("📦 Input nhận từ client:", input.logo, input.coverImage);

      // ✅ Upload logo
      if (input.logo) {
        console.log("tới đây 2.1");
        input.logo = await uploadImageSingle(input.logo);
        console.log("tới đây 2.2");
      }

      console.log("tới đây 3");

      if (input.coverImage) {
        input.coverImage = await uploadImageSingle(input.coverImage);
      }

      console.log("tới đây 4");

      input.businessLicense = await Promise.all(
        input.businessLicense.map(async (license) => {
          if (!license.name || !license.code || !license.description) {
            throw new GraphQLError("Giấy phép phải có đủ tên, mô tả, mã", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

          let uploadedImages = [];
          if (license.images?.length > 0) {
            uploadedImages = await uploadImageMultiple(license.images);
          } else {
            throw new GraphQLError("Mỗi giấy phép phải có ít nhất 1 ảnh", {
              extensions: { code: "BAD_USER_INPUT" },
            });
          }

          return {
            name: license.name,
            code: license.code,
            description: license.description,
            images: uploadedImages,
          };
        })
      );

      console.log("tới đây 5");

      const address = {
        name: input.address?.name || null,
        phone: input.address?.phone || null,
        address: input.address?.address || null, // địa chỉ chi tiết
        province: input.address?.province || null,
        district: input.address?.district || null,
        ward: input.address?.ward || null,
        province_id:
          input.address?.provinceId || input.address?.province_id || null,
        district_id:
          input.address?.districtId || input.address?.district_id || null,
        ward_code: input.address?.wardCode || input.address?.ward_code || null,
      };

      const baseSlug = slugify(input.name, { lower: true, strict: true });
      let slug = baseSlug;
      let count = 1;
      while (await models.Shop.exists({ slug })) {
        slug = `${baseSlug}-${count++}`;
      }
      input.slug = slug;
      console.log("tới đây 4");
      const shop = new models.Shop({
        ...input,
        address,
        owner: user._id,
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      await shop.save();

      // ✅ Thêm đoạn này
      const updatedUser = await models.User.findByIdAndUpdate(user._id);

      let refreshToken = null;
      if (user.firebaseUid && admin?.auth) {
        refreshToken = await admin.auth().createCustomToken(user.firebaseUid, {
          role: "seller",
          userId: user._id.toString(),
        });
      }

      return {
        auth: {
          user: {
            ...updatedUser.toObject(),
            _id: updatedUser._id.toString(),
            status: updatedUser.isActive ? "active" : "inactive",
            role: updatedUser.role.toUpperCase(),
          },
          accessToken: token || null,
          refreshToken,
          firebaseInfo: null,
          needsAccountLinking: false,
        },
        shop,
      };
    },

    // -------------------------------------------------------------
  },
};

export default authResolvers;
