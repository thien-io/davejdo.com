"use client";

import { useState } from "react";
import { loginAction } from "../actions/auth";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await loginAction(formData);
    setPending(false);
    if (result?.error) setError(result.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form
        action={onSubmit}
        className="w-full max-w-sm space-y-6 border border-neutral-800 rounded-2xl p-8 bg-neutral-950"
      >
        <div>
          <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-neutral-500 mb-2">
            Admin
          </div>
          <h1 className="font-display text-4xl">SIGN IN</h1>
        </div>
        <div className="space-y-4">
          <input
            name="email"
            type="email"
            required
            placeholder="email"
            className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4b97c]"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="password"
            className="w-full bg-black border border-neutral-800 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[#d4b97c]"
          />
        </div>
        {error ? <p className="text-sm text-red-400 font-mono">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-[#d4b97c] text-black font-medium py-3 rounded-lg disabled:opacity-50"
        >
          {pending ? "…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
