// Lightweight Auth.js config — Edge-safe, no Prisma or bcrypt.
// Used by middleware.ts to avoid bundling Node.js-only dependencies into the Edge runtime.
// auth.ts extends this config with the Prisma adapter and CredentialsProvider.

import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";

export const authConfig = {
  pages: {
    signIn: "/sign-in",
    error: "/sign-in",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  // CredentialsProvider lives in auth.ts — it uses bcrypt which isn't Edge-safe.
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
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