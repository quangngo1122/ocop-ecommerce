import cloudinary from "../config/cloudinary.config.js";

export const uploadImageSingle = async (file) => {
  try {
    const { createReadStream } = await file;
    const stream = createReadStream();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "OCOP-ECOMMERCE",
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            resolve(result.secure_url);
          }
        }
      );
      stream.pipe(uploadStream);
    });
  } catch (error) {
    console.error("Upload failed:", error.message);
    throw new Error(error.message);
  }
};

export const uploadVideoSingle = async (file) => {
  try {
    const fileObj = typeof file.then === "function" ? await file : file;
    const { createReadStream } = fileObj;
    const stream = createReadStream();
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "videos",
          resource_type: "video",
          eager: [
            { format: "mp4", quality: "auto" },
            { format: "jpg", quality: "auto" },
          ],
          eager_async: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
          } else {
            const duration = Math.round(result.duration);
            const thumbnailUrl = result.eager.find(
              (t) => t.format === "jpg"
            ).secure_url;
            resolve({
              url: result.secure_url,
              duration,
              thumbnailUrl,
            });
          }
        }
      );
      stream.pipe(uploadStream);
    });
  } catch (error) {
    throw new Error(error.message);
  }
};

export const uploadImageMultiple = async (files) => {
  const uploadedFiles = await Promise.all(
    files.map(async (file) => {
      const { createReadStream, filename, mimetype } = await file;

      // Upload từng file lên Cloudinary
      const stream = createReadStream();
      return new Promise((resolve, reject) => {
        const cloudStream = cloudinary.uploader.upload_stream(
          { folder: "OCOP-ECOMMERCE" }, // Folder tùy chỉnh
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve({ url: result.secure_url });
            }
          }
        );
        stream.pipe(cloudStream);
      });
    })
  );
  const urls = uploadedFiles.map((file) => file.url);
  return urls;
};

export const deleteImageSingle = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const deleteImageMultiple = async (urls) => {
  const publicIds = urls
    .filter((url) => {
      if (!url || !url.includes("cloudinary.com")) {
        console.log(`Skipping invalid Cloudinary URL: ${url}`);
        return false;
      }
      return true;
    })
    .map((url) => {
      try {
        const arrUrl = url.split("/");
        if (arrUrl.length < 9) {
          console.log(`Invalid Cloudinary URL format: ${url}`);
          return null;
        }
        return `${arrUrl[7]}/${arrUrl[8].split(".")[0]}`;
      } catch (error) {
        console.log(`Error processing URL: ${url}`, error);
        return null;
      }
    })
    .filter((id) => id !== null);

  if (publicIds.length === 0) {
    console.log("No valid Cloudinary URLs to delete");
    return { deleted: {} };
  }

  try {
    const result = await cloudinary.api.delete_resources(publicIds);
    console.log("Images deleted:", result);
    return result;
  } catch (error) {
    console.error("Error deleting images:", error);
    throw error;
  }
};
