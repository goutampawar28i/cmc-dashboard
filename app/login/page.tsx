"use client";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="card w-full max-w-sm p-8 text-center">
        <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-ink text-white text-sm font-semibold">
          CMC
        </div>
        <h1 className="text-lg font-semibold text-ink">Corporate Outreach Dashboard</h1>
        <p className="mt-1 text-sm text-muted">
          Restricted to authorized mentor accounts.
        </p>
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="btn-primary mt-6 w-full justify-center"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}
