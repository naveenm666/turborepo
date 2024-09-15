// app/auth/signin/page.tsx

'use client';

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

export default function SignIn() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  return (
    <div className="flex flex-col justify-center items-center h-screen">
      <h1>Sign In</h1>
      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Sign in with Google
      </button>
    </div>
  );
}




