import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";



import User from "@/models/User";

import { connectDB } from "@/lib/mongodb";



export const authOptions: NextAuthOptions = {

    providers: [

        // Regular customer login — unchanged. Looks up a User by email and
        // checks their hashed password.
        CredentialsProvider({

            id: "credentials",
            name: "credentials",



            credentials: {

                email: {},

                password: {},

            },



            async authorize(credentials) {

                await connectDB();



                const user = await User.findOne({

                    email: credentials?.email,

                });



                if (!user) {

                    throw new Error("No user found");

                }



                const isValid = await bcrypt.compare(

                    credentials!.password,

                    user.password

                );



                if (!isValid) {

                    throw new Error("Wrong password");

                }



                return {

                    id: user._id.toString(),

                    name: user.name,

                    email: user.email,

                };

            },

        }),

        // Admin login — a single shared password (set in ADMIN_PASSWORD),
        // separate from customer accounts. No User lookup, no email needed.
        // Anyone who knows the password gets an "admin" role on their
        // session, which the /api/products routes check for.
        CredentialsProvider({

            id: "admin-credentials",
            name: "Admin",

            credentials: {
                password: { label: "Admin password", type: "password" },
            },

            async authorize(credentials) {
                const adminPassword = process.env.ADMIN_PASSWORD;

                if (!adminPassword) {
                    throw new Error("Admin login is not configured");
                }

                if (!credentials?.password || credentials.password !== adminPassword) {
                    throw new Error("Wrong password");
                }

                // No real user record — just a fixed identity representing
                // "whoever currently knows the admin password".
                return {
                    id: "admin",
                    name: "Admin",
                    email: "admin@achaaryaar.com",
                };
            },

        }),

    ],



    session: {

        strategy: "jwt",

    },



    pages: {

        signIn: "/login",

    },



    // These callbacks carry the user's Mongo _id (for customers) and an
    // admin role flag (for admin logins) from the JWT into the session, so
    // API routes and pages know who's logged in and whether they're admin.
    callbacks: {

        async jwt({ token, user, account }) {

            if (user) {

                token.id = user.id;

            }

            if (account?.provider === "admin-credentials") {

                token.role = "admin";

            }

            return token;

        },



        async session({ session, token }) {

            if (session.user) {

                (session.user as typeof session.user & { id?: string; role?: string }).id =

                    token.id as string;

                (session.user as typeof session.user & { id?: string; role?: string }).role =

                    (token.role as string) || "customer";

            }

            return session;

        },

    },



    secret: process.env.NEXTAUTH_SECRET,

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };