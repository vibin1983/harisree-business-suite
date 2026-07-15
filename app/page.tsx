import Link from "next/link";
import { supabase } from "@/lib/supabase";
import LogoutButton from "@/app/components/LogoutButton";

export default async function Home() {
  const { data: shops, error } = await supabase
    .from("shops")
    .select("*")
    .order("id");

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-full max-w-[750px]">
        <div className="flex justify-end mb-4">
          <LogoutButton />
        </div>
        <h1 className="text-4xl font-bold text-center text-blue-700">
          Harisree Business Suite
        </h1>

        <p className="text-center text-gray-600 mt-3 text-lg font-semibold">
          Multi-Shop GST Billing Application
        </p>

        <Link
          href="/invoices"
          className="block mt-8 w-full rounded-lg bg-purple-600 text-white py-4 text-xl text-center font-bold hover:bg-purple-700"
        >
          Saved Invoices
        </Link>

        <h2 className="mt-10 mb-4 text-2xl font-bold text-black">
          New Invoice
        </h2>

        {error && (
          <p className="mt-6 text-red-600 font-bold">
            Error: {error.message}
          </p>
        )}

        <div className="space-y-4">
          {shops?.map((shop) => (
            <Link
              key={shop.id}
              href={`/invoice/new?shop=${shop.code}`}
              className="block w-full rounded-lg bg-blue-600 text-white py-4 text-xl text-center font-bold hover:bg-blue-700"
            >
              {shop.name}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}