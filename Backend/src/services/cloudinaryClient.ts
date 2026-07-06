import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env";

let configured = false;

function getCloudinary() {
  if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
    throw new Error(
      "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET to Backend/.env to persist admin-uploaded images."
    );
  }
  if (!configured) {
    cloudinary.config({
      cloud_name: env.cloudinaryCloudName,
      api_key: env.cloudinaryApiKey,
      api_secret: env.cloudinaryApiSecret,
    });
    configured = true;
  }
  return cloudinary;
}

export async function uploadImageBuffer(buffer: Buffer, mimetype: string): Promise<string> {
  const client = getCloudinary();
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const result = await client.uploader.upload(dataUri, { folder: "travelhub-vacations" });
  return result.secure_url;
}

export async function deleteImageByUrl(url: string): Promise<void> {
  const client = getCloudinary();
  const match = url.match(/\/travelhub-vacations\/([^./]+)\./);
  if (!match) return;
  await client.uploader.destroy(`travelhub-vacations/${match[1]}`).catch(() => undefined);
}

export function isCloudinaryUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://");
}
