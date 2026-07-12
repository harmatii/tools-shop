// Auth.js (NextAuth v5) configuration: providers, session strategy, and callbacks.
// Exports `handlers` (used by /api/auth/[...nextauth]/route.ts) and `auth`, `signIn`, `signOut` for use throughout the app.

import NextAuth from "next-auth";
import { cookies } from "next/headers";
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
    async jwt({ token, user, trigger }: any) {
      // First call after sign-in only — copy DB fields onto the token so they persist in the cookie.
      if (user) {
        token.id = user.id;
        token.role = user.role;

        // There's no "name" column on User anymore — firstName is only known once the user has
        // completed checkout. Prefer it for the header's initial/display name, else fall back to
        // the email's local part.
        token.name = user.firstName ?? user.email!.split("@")[0];

        // If the user added items to the cart before logging in, we move that cart to their
        // account after they signIn signUp so the items are not lost.
        if (trigger === "signIn" || trigger === "signUp") {
          // Read the guest-cart ID from the browser's cookies (every guest gets one while browsing).
          const cookiesObject = await cookies();
          const sessionCartId = cookiesObject.get("sessionCartId")?.value;

          if (sessionCartId) {
            // Look up the actual cart row that belongs to that guest ID.
            const sessionCart = await prisma.cart.findFirst({
              where: { sessionCartId },
            });

            if (sessionCart) {
              // The account may still have an old cart from a previous session — we drop it,
              // because the cart the user just built as a guest is the one they expect to see.
              await prisma.cart.deleteMany({
                where: { userId: user.id },
              });

              // Stamp the user's ID onto the guest cart — same row, new owner.
              await prisma.cart.update({
                where: { id: sessionCart.id },
                data: { userId: user.id },
              });
            }
          }
        }
      }

      return token;
    },
  },
});
