import NextAuth, { type DefaultSession } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"
import { db } from "./db"
import { users } from "./db/schema"
import { eq } from "drizzle-orm"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role?: string
    } & DefaultSession["user"]
  }

  interface User {
    role?: string
  }
}

function parsePositiveInt(value: string | undefined, fallback: number) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback
}

// Session time limiter (seconds). Idle = logout after inactivity,
// absolute = forced re-login regardless of activity.
const SESSION_IDLE_SECONDS = parsePositiveInt(
  process.env.AUTH_SESSION_IDLE_SECONDS,
  60 * 60,
)
const SESSION_ABSOLUTE_SECONDS = parsePositiveInt(
  process.env.AUTH_SESSION_ABSOLUTE_SECONDS,
  60 * 60 * 8,
)

export const { handlers, signIn, signOut, auth } = NextAuth({
  basePath: "/auth",
  session: { strategy: "jwt", maxAge: SESSION_ABSOLUTE_SECONDS },
  pages: {
    signIn: "/auth/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        
        const user = await db.query.users.findFirst({
          where: eq(users.email, credentials.email as string)
        });

        if (!user || !user.password) return null;
        
        // In a real application, you should use bcrypt or argon2 to verify the password
        if (user.password !== credentials.password) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        };
      }
    })
  ],
  callbacks: {
    async signIn({ user, account }) {
      // OAuth users aren't persisted by Auth.js (JWT strategy, no adapter),
      // so upsert them into our own users table here. New OAuth accounts
      // always get the default "user" role.
      if (account?.provider === "google") {
        const email = user.email;
        if (!email) return false;

        let dbUser = await db.query.users.findFirst({
          where: eq(users.email, email),
        });

        if (!dbUser) {
          const inserted = await db
            .insert(users)
            .values({
              name: user.name ?? null,
              email,
              image: user.image ?? null,
              role: "user",
            })
            .returning();
          dbUser = inserted[0];
        }

        // Link the sign-in to our DB record (reuses existing role if the
        // email was already registered via credentials).
        user.id = dbUser.id;
        user.role = dbUser.role;
      }
      return true;
    },
    jwt({ token, user }) {
      const now = Math.floor(Date.now() / 1000);

      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.sessionStartedAt = now;
        token.lastActiveAt = now;
        return token;
      }

      const startedAt =
        typeof token.sessionStartedAt === "number" ? token.sessionStartedAt : now;
      const lastActiveAt =
        typeof token.lastActiveAt === "number" ? token.lastActiveAt : now;

      // Returning null makes Auth.js clean the session cookie, forcing re-login.
      if (
        now - startedAt > SESSION_ABSOLUTE_SECONDS ||
        now - lastActiveAt > SESSION_IDLE_SECONDS
      ) {
        return null as unknown as JWT;
      }

      token.lastActiveAt = now;
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
      }
      return session;
    }
  }
})
