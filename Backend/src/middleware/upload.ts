import multer from "multer";
import path from "path";
import fs from "fs";

// Seed images still live here and are served via express.static — admin
// uploads no longer write to this directory (see cloudinaryClient.ts), since
// an ephemeral host's filesystem doesn't survive redeploys.
const uploadsDir = path.join(__dirname, "..", "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"));
    }
  },
});

export { uploadsDir };
