"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Login failed");

      router.replace("/");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-extrabold text-blue-700 text-center">
          Harisree Business Suite
        </h1>
        <p className="mt-2 mb-8 text-center text-lg font-semibold text-gray-700">
          Sign in to continue
        </p>

        <label className="block text-lg font-bold text-black mb-2">
          Username
        </label>
        <input
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          className="w-full border-2 border-gray-600 rounded-lg p-3 text-lg font-semibold text-black mb-5"
          required
        />

        <label className="block text-lg font-bold text-black mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="w-full border-2 border-gray-600 rounded-lg p-3 text-lg font-semibold text-black"
          required
        />

        {message && (
          <p className="mt-4 text-center text-lg font-bold text-red-700">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-3 rounded-lg text-xl font-bold"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
