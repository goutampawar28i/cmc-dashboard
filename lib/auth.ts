import "server-only";
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

// Only these emails may sign in to the mentor dashboard.
// Comma-separated in the ALLOWED_MENTOR_EMAILS env var, e.g.
//   ALLOWED_MENTOR_EMAILS=narayan@jaipuria.ac.in,mentor2@jaipuria.ac.in
function getAllowedEmails(): string[] {
  return (process.env.ALLOWED_MENTOR_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const allowed = getAllowedEmails();
      // In local dev, if no allowlist is configured yet, allow everyone
      // through so you can build the UI before Google Cloud is set up.
      if (allowed.length === 0) return true;
      return !!user.email && allowed.includes(user.email.toLowerCase());
    },
    async session({ session }) {
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
