import multer from "multer";
import fs from "fs";
import path from "path";

//Currently in local public/temp folder is there but for
//dev enviroment the folder isnt working so we create it if not exists
//This is to avoid errors when uploading files
const tempDir = path.join(process.cwd(), "public", "temp");

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
  console.log(`✅ Created temp upload folder: ${tempDir}`);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

export const upload = multer({ storage });
