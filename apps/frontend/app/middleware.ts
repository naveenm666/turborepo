// middleware.ts

import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/auth/signin", // Redirect to sign-in if not authenticated
  },
});

// Protect specific routes
export const config = {
  matcher: ["/chat", "/dashboard"], // Adjust paths to your protected routes
};



