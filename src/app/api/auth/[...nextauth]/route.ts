import NextAuth from "next-auth";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";



import User from "@/models/User";

import { connectDB } from "@/lib/mongodb";



export const authOptions: NextAuthOptions = {

    providers: [

        CredentialsProvider({

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

    ],



    session: {

        strategy: "jwt",

    },



    pages: {

        signIn: "/login",

    },



    // These two callbacks carry the user's Mongo _id from the JWT
    // into the session, so API routes know which user is logged in.
    callbacks: {

        async jwt({ token, user }) {

            if (user) {

                token.id = user.id;

            }

            return token;

        },



        async session({ session, token }) {

            if (session.user) {

                (session.user as typeof session.user & { id?: string }).id =

                    token.id as string;

            }

            return session;

        },

    },



    secret: process.env.NEXTAUTH_SECRET,

};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };