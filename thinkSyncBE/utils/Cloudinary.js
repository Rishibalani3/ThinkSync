import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { log } from "../utils/Logger.js";
import path from "path";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const uploadOnCloudinary = async (localFileOrPath) => {
  let filePath = null;

  if (!localFileOrPath) return null;

  if (typeof localFileOrPath === "string") {
    filePath = localFileOrPath;
  } else if (localFileOrPath.path) {
    filePath = localFileOrPath.path;
  } else if (localFileOrPath.filepath) {
    filePath = localFileOrPath.filepath;
  } else {
    return null;
  }

  try {
    log(`Uploading to Cloudinary from path: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      console.error(
        "uploadOnCloudinary: file does not exist at path:",
        filePath
      );
      return null;
    }

    const response = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    log("Cloudinary upload response:", {
      public_id: response.public_id,
      secure_url: response.secure_url,
      url: response.url,
      format: response.format,
      bytes: response.bytes,
    });

    try {
      fs.unlinkSync(filePath);
      log("Deleted temp file:", filePath);
    } catch (errUnlink) {
      console.warn("Failed to delete temp file:", filePath, errUnlink);
    }

    return response.secure_url || response.url || null;
  } catch (error) {
    console.error("Cloudinary upload error:", error);

    try {
      if (filePath && fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        log("Deleted temp file after failed upload:", filePath);
      }
    } catch (err) {
      console.warn("Failed to delete temp file after error:", err);
    }

    return null;
  }
};

export { uploadOnCloudinary };
