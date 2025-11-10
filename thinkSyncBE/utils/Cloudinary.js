import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { log } from "../utils/Logger.js";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFile) => {
  if (!localFile || !localFile.path) return null;

  const filePath = localFile.path;

  try {
    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    log(`Image uploaded to Cloudinary: ${response.url}`);

    fs.unlinkSync(filePath);

    return response.url;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    fs.unlinkSync(filePath);
    return null;
  }
};

export { uploadOnCloudinary };
