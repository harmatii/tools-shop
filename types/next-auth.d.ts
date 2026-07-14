import type { DefaultSession } from "next-auth";

// Extends the built-in Auth.js types with the custom fields we add in auth.ts callbacks.
// Without this file, session.user.id and session.user.role are unknown to TypeScript.

declare module "next-auth" {
  interface User {
    role?: string; // returned from authorize() and written onto the JWT in jwt()
  }

  interface Session {
    user: {
      id: string; // copied from token.sub in session()
      role: string; // copied from token.role in session()
    } & DefaultSession["user"]; // keeps the default fields: name, email, image
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string; // written onto the token in jwt() at sign-in
  }
}
