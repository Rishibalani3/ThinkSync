import { ApiError } from "../utils/ApiError.js";
import { ApiResponce } from "../utils/ApiResponse.js";
import { prisma } from "../config/db.js";

const createPost = async (req, res) => {
  const { content, type, hashtags, mentions, link } = req.body;
  console.log(req.body, "req.body");
};

export { createPost };
