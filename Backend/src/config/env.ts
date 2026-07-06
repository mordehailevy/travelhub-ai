import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGO_URI: isProduction
    ? z.string().min(1, "MONGO_URI is required in production")
    : z.string().default("mongodb://localhost:27017/travelhub"),
  JWT_SECRET: isProduction
    ? z.string().min(32, "JWT_SECRET must be at least 32 characters in production")
    : z.string().default("dev-secret-change-me"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  OPENAI_API_KEY: z.string().default(""),
  OPENAI_MODEL: z.string().default("gpt-4o-mini"),
  CLIENT_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("[env] Invalid environment configuration:");
  for (const issue of parsed.error.issues) {
    console.error(`  - ${issue.path.join(".")}: ${issue.message}`);
  }
  throw new Error("Missing or invalid required environment variables. See errors above.");
}

const data = parsed.data;

export const env = {
  port: data.PORT,
  mongoUri: data.MONGO_URI,
  jwtSecret: data.JWT_SECRET,
  jwtExpiresIn: data.JWT_EXPIRES_IN,
  openaiApiKey: data.OPENAI_API_KEY,
  openaiModel: data.OPENAI_MODEL,
  clientOrigin: data.CLIENT_ORIGIN,
};
