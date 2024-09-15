import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      httpOptions: {
        timeout: 10000,  // Set timeout to 10 seconds
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',  // Optional: custom sign-in page
  },
});

export { handler as GET, handler as POST };
