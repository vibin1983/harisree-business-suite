"use client";

export default function LogoutButton() {
  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={logout}
      className="rounded-lg bg-gray-700 px-5 py-3 text-lg font-bold text-white hover:bg-gray-800"
    >
      Logout
    </button>
  );
}
