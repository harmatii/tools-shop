// Auth.js (NextAuth v5) configuration: providers, session strategy, and callbacks.
// Exports `handlers` (used by /api/auth/[...nextauth]/route.ts) and `auth`, `signIn`, `signOut` for use throughout the app.

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { comparePasswords } from "@/lib/encrypt";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,

  // PrismaAdapter connects Auth.js to the database, handling user and session storage.
  adapter: PrismaAdapter(prisma),

  // Login providers — only email/password for now. Add OAuth providers (Google, GitHub, etc.) to this array.
  providers: [
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      // authorize() runs on every credentials sign-in attempt.
      // Return a user object on success, or null to reject the attempt.
      async authorize(credentials) {
        if (credentials == null) return null;

        const user = await prisma.user.findFirst({
          where: {
            email: credentials.email as string,
          },
        });

        // User exists AND has a password (OAuth-only users have password: null).
        if (user && user.password) {
          const isMatch = comparePasswords(credentials.password as string, user.password);

          if (isMatch) {
            return {
              id: user.id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
            };
          }
        }
        // No user, no password set, or password mismatch — reject.
        return null;
      },
    }),
  ],
  // Callbacks customize the auth flow. The two below work as a pair:
  //   - jwt:     writes custom fields ONTO the token at sign-in / sign-up / update.
  //   - session: reads those fields back OUT into the session object on every auth() call.
  // The token is the bridge between them.
  callbacks: {
    ...authConfig.callbacks,
    // session() — runs on every auth() call. Builds the object your app code reads.
    async session({ session, token }) {
      // Copy custom fields from token → session.user (default Session has no id/role).
      session.user.id = token.sub as string;
      session.user.role = token.role as string;
      session.user.name = token.name;

      return session;
    },
    // jwt() — runs at sign-in / sign-up / update. `user` is only defined on the first call after sign-in.
    async jwt({ token, user }: any) {
      // First call after sign-in only — copy DB fields onto the token so they persist in the cookie.
      if (user) {
        token.role = user.role;

        // There's no "name" column on User anymore — firstName is only known once the user has
        // completed checkout. Prefer it for the header's initial/display name, else fall back to
        // the email's local part.
        token.name = user.firstName ?? user.email!.split("@")[0];
      }

      return token;
    },
  },
});
