import dotenv from "dotenv";

dotenv.config();

export const AUTH_SECRET = process.env.AUTH_SECRET || "dev_secret_change_me";
export const COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "lioc_session";
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION_SECONDS
  ? Number(process.env.JWT_EXPIRATION_SECONDS)
  : 60 * 60 * 24 * 7; // 7 days
