import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function InvoicesPage() {
  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, invoice_number, invoice_date, customer_name, grand_total")
    .order("id", { ascending: false });

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-blue-700">
            Saved Invoices
          </h1>

          <Link
            href="/"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-bold"
          >
            Home
          </Link>
        </div>

        {error && (
          <p className="text-red-600 font-bold">
            {error.message}
          </p>
        )}

        <table className="w-full border-2 border-gray-600 border-collapse">
          <thead>
            <tr className="bg-gray-300">
              <th className="border-2 border-gray-600 p-3 text-black font-bold text-lg">
                Invoice No
              </th>
              <th className="border-2 border-gray-600 p-3 text-black font-bold text-lg">
                Date
              </th>
              <th className="border-2 border-gray-600 p-3 text-black font-bold text-lg">
                Customer
              </th>
              <th className="border-2 border-gray-600 p-3 text-black font-bold text-lg">
                Grand Total
              </th>
              <th className="border-2 border-gray-600 p-3 text-black font-bold text-lg">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {invoices?.map((invoice) => (
              <tr key={invoice.id}>
                <td className="border-2 border-gray-600 p-3 text-black font-bold">
                  {invoice.invoice_number}
                </td>
                <td className="border-2 border-gray-600 p-3 text-black">
                  {invoice.invoice_date}
                </td>
                <td className="border-2 border-gray-600 p-3 text-black">
                  {invoice.customer_name || "-"}
                </td>
                <td className="border-2 border-gray-600 p-3 text-black text-right font-bold">
                  ₹{Number(invoice.grand_total || 0).toFixed(2)}
                </td>
                <td className="border-2 border-gray-600 p-3 text-center">
                  <Link
                    href={`/invoices/${invoice.id}`}
                    className="text-blue-700 font-bold underline"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}