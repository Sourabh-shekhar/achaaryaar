import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import User from "@/models/User";
import { connectDB } from "@/lib/mongodb";

export const authOptions: NextAuthOptions = {
  providers: [
    // =====================================================
    // CUSTOMER LOGIN
    // =====================================================

    CredentialsProvider({
      id: "credentials",
      name: "credentials",

      credentials: {
        email: {},
        password: {},
      },

      async authorize(credentials) {
        await connectDB();

        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();

        const password = String(credentials?.password || "");

        if (!email || !password) {
          throw new Error("Email and password are required");
        }

        const user = await User.findOne({
          email,
        });

        if (!user) {
          throw new Error("No user found");
        }

        const isValid = await bcrypt.compare(
          password,
          user.password
        );

        if (!isValid) {
          throw new Error("Wrong password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: email,
        };
      },
    }),

    // =====================================================
    // ADMIN LOGIN
    // =====================================================

    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin",

      credentials: {
        password: {
          label: "Admin password",
          type: "password",
        },
      },

      async authorize(credentials) {
        const adminPassword = process.env.ADMIN_PASSWORD;
        const adminEmail = process.env.ADMIN_EMAIL;

        console.log(
          "[admin-login] ADMIN_PASSWORD:",
          adminPassword
            ? `set (length ${adminPassword.length})`
            : "MISSING"
        );

        console.log(
          "[admin-login] ADMIN_EMAIL:",
          adminEmail || "MISSING"
        );

        if (!adminPassword) {
          throw new Error(
            "Admin login is not configured"
          );
        }

        if (!adminEmail) {
          throw new Error(
            "Admin email is not configured"
          );
        }

        if (
          !credentials?.password ||
          credentials.password !== adminPassword
        ) {
          throw new Error("Wrong password");
        }

        // Admin gets a fixed identity.
        // The email is important because /api/orders
        // expects session.user.email to exist.
        return {
          id: "admin",
          name: "Admin",
          email: adminEmail.trim().toLowerCase(),
        };
      },
    }),
  ],

  // =====================================================
  // SESSION
  // =====================================================

  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  // =====================================================
  // CALLBACKS
  // =====================================================

  callbacks: {
    // ---------------------------------------------------
    // JWT CALLBACK
    // ---------------------------------------------------

    async jwt({ token, user, account }) {
      // When a user logs in, copy their information
      // into the JWT.
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }

      // Admin login
      if (account?.provider === "admin-credentials") {
        token.role = "admin";
      }

      // Customer login
      if (account?.provider === "credentials") {
        token.role = "customer";
      }

      return token;
    },

    // ---------------------------------------------------
    // SESSION CALLBACK
    // ---------------------------------------------------

    async session({ session, token }) {
      if (session.user) {
        const sessionUser = session.user as typeof session.user & {
          id?: string;
          role?: string;
        };

        // ------------------------------------------------
        // EMAIL
        // ------------------------------------------------
        //
        // IMPORTANT:
        // Always restore email from JWT.
        // This fixes:
        // "User email not found."
        //

        if (typeof token.email === "string") {
          sessionUser.email = token.email;
        }

        // ------------------------------------------------
        // NAME
        // ------------------------------------------------

        if (typeof token.name === "string") {
          sessionUser.name = token.name;
        }

        // ------------------------------------------------
        // ID
        // ------------------------------------------------
        //
        // IMPORTANT:
        // Don't assign undefined because NextAuth's
        // default User type may require id to be a string.
        //

        if (typeof token.id === "string") {
          sessionUser.id = token.id;
        }

        // ------------------------------------------------
        // ROLE
        // ------------------------------------------------

        sessionUser.role =
          typeof token.role === "string"
            ? token.role
            : "customer";
      }

      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };