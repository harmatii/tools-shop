// Auth.js (NextAuth v5) configuration: providers, session strategy, and callbacks.
// Exports `handlers` (used by /api/auth/[...nextauth]/route.ts) and `auth`, `signIn`, `signOut` for use throughout the app.

import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/db/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import { compareSync } from "bcrypt-ts-edge";
import type { NextAuthConfig } from "next-auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const config = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
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
          const isMatch = compareSync(credentials.password as string, user.password);

          if (isMatch) {
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
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
    // session() — runs on every auth() call. Builds the object your app code reads.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, user, trigger, token }: any) {
      // Copy custom fields from token → session.user (default Session has no id/role).
      session.user.id = token.sub;
      session.user.role = token.role;
      session.user.name = token.name;

      // When the client calls `update(session)`, refresh the name from the latest user object.
      if (trigger === "update") {
        session.user.name = user.name;
      }

      return session;
    },
    // jwt() — runs at sign-in / sign-up / update. `user` is only defined on the first call after sign-in.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async jwt({ token, user, trigger, session }: any) {
      // First call after sign-in only — copy DB fields onto the token so they persist in the cookie.
      if (user) {
        token.role = user.role;

        // Fallback: if the DB has the "NO_NAME" default, derive a name from the email's local part.
        if (user.name === "NO_NAME") {
          token.name = user.email!.split("@")[0];

          // Persist the derived name back to the DB so this fix-up only runs once per user.
          await prisma.user.update({
            where: { id: user.id },
            data: { name: token.name },
          });
        }
      }

      return token;
    },
    authorized({ request, auth }: any) {
      // Every visitor needs a session cart ID — it links their cart in the DB to this browser, even before sign-in.
      if (!request.cookies.get("sessionCartId")) {
        // UUID identifies this guest's cart row in the DB without requiring a login.
        const sessionCartId = crypto.randomUUID();

        // request.headers is read-only — clone it to get a mutable copy, required by NextResponse.next.
        const newRequestHeaders = new Headers(request.headers);

        // Pass-through response: request continues to the page normally. Constructed this way so we can attach the cookie below.
        const response = NextResponse.next({
          request: {
            headers: newRequestHeaders,
          },
        });

        // Adds Set-Cookie to the response — browser stores the ID and sends it back on every subsequent request.
        response.cookies.set("sessionCartId", sessionCartId);

        return response;
      } else {
        return true;
      }
    },
  },
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
