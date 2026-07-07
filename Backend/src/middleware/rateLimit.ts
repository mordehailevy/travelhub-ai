import rateLimit from "express-rate-limit";

// Rate limiting is disabled in tests: hundreds of requests fly by in a single
// run from the same IP, which would trip these limits within seconds and has
// nothing to do with what the tests are actually checking.
const isTest = process.env.NODE_ENV === "test";

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { message: "Too many attempts. Please try again later." },
});

export const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isTest,
  message: { message: "Too many AI requests. Please try again later." },
});
