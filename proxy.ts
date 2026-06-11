import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Creates a lightweight NextAuth instance from the Edge-safe config.
// This keeps Prisma and bcrypt out of the Edge bundle, staying under Vercel's 1 MB limit.
export default NextAuth(authConfig).auth;