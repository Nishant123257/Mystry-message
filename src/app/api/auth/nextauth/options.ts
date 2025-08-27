import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbconnect from "@/lib/dbconnect";
import UserModel from "@/Modal/users";

interface SafeUser {
  id: string;
  email: string;
  username: string;
}

interface Credentials {
  identifier: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id:"credentials",
      name:"Credentials",
      credentials: {
        identifier: { label: "Email or Username", type: "text" }, // ✅ match with usage below
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials?: Credentials): Promise<SafeUser | null> {
        if (!credentials) return null; // ✅ handle possibly undefined

        await dbconnect();

        try {
          const user = await UserModel.findOne({
            $or:[
              { email: credentials.identifier },
              { username: credentials.identifier }
            ]
          });

          if (!user) {
            console.error("No user found with this email/username");
            return null;
          }

          if (!user.isVerified) {
            console.error("User is not verified. Please verify your email");
            return null;
          }

          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (isPasswordCorrect) {
            console.error("Incorrect password");
            return null;
          }

          // ✅ only return safe fields
          return {
            id: user.id.toString(),
            email: user.email,
            username: user.username,
          };
        } catch (err) {
          if (err instanceof Error) {
            throw new Error(err.message);
          }
          throw new Error("Login failed");
        }
      },
    })
  ],
  callbacks:{
     async session({ session, token }) {
      if(token){
        session.user._id=token._id?.toString();
        session.user.isVerified=token.isVerified;
      }
      return session
    },
    async jwt({ token, user}) {
      if(user){
        token._id=user._id?.toString()
        token.isVerified=user.isVerified;
        token.isAcceptingMessages=user.isAcceptingMessages;
        token.username=user.username
      }
      return token
    }
  },
  pages:{
    signIn:'/sign-in'
  },
  session:{
    strategy:"jwt"
  },
  secret:process.env.NEXTAUTH_SECRET,

};
