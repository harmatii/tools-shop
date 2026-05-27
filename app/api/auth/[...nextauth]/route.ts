// Catch-all route handler that wires Auth.js into Next.js's App Router.
// Re-exports the GET and POST handlers from auth.ts to receive requests at /api/auth/*.
import { handlers } from "@/auth";
export const { GET, POST } = handlers;
