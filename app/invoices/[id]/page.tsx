import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getShopDetails } from "@/lib/shopDetails";
import { amountToWords } from "@/utils/amountInWords";
import PrintButton from "@/app/components/PrintButton";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const money = (value: unknown) => `₹${Number(value || 0).toFixed(2)}`;

export default async function InvoiceDetailPage({ params }: PageProps) {
  const { id } = await params;

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", id)
    .single();

  if (invoiceError || !invoice) {
    return (
      <main className="min-h-screen bg-slate-100 p-8">
        <div className="mx-auto max-w-4xl bg-white p-8 text-black">
          <p className="text-xl font-bold">Invoice not found.</p>
          <Link href="/invoices" className="mt-5 inline-block font-bold text-blue-700 underline">
            Back to Saved Invoices
          </Link>
        </div>
      </main>
    );
  }

  const [{ data: items }, { data: shopRow }] = await Promise.all([
    supabase
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("id", { ascending: true }),
    supabase
      .from("shops")
      .select("code")
      .eq("id", invoice.shop_id)
      .single(),
  ]);

  const shop = getShopDetails(shopRow?.code ?? "HPS");
  const invoiceDate = invoice.invoice_date
    ? new Date(`${invoice.invoice_date}T00:00:00`).toLocaleDateString("en-IN")
    : new Date(invoice.created_at).toLocaleDateString("en-IN");
  const amountInWords = amountToWords(invoice.grand_total);

  return (
    <main className="min-h-screen bg-slate-100 p-3 md:p-8 print:bg-white print:p-0">
      <div className="no-print mx-auto mb-4 flex max-w-5xl flex-wrap justify-end gap-3">
        <Link
          href="/invoices"
          className="rounded-lg bg-blue-700 px-6 py-3 text-lg font-bold text-white hover:bg-blue-800"
        >
          Back
        </Link>
        <Link
          href="/"
          className="rounded-lg bg-gray-700 px-6 py-3 text-lg font-bold text-white hover:bg-gray-800"
        >
          Home
        </Link>
        <PrintButton />
      </div>

      <article className="invoice-print mx-auto max-w-5xl border-2 border-black bg-white text-black shadow-lg print:shadow-none">
        <header className="border-b-2 border-black p-4 print:p-2.5">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between print:flex-row print:items-start print:justify-between">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-extrabold tracking-wide md:text-4xl print:text-xl">
                {shop.name}
              </h1>
              {shop.addressLines.map((line) => (
                <p key={line} className="text-base font-semibold md:text-lg print:text-xs print:leading-4">
                  {line}
                </p>
              ))}
              <p className="text-base font-semibold md:text-lg print:text-xs print:leading-4">
                Phone: {shop.phone}
              </p>
            </div>
            <div className="shrink-0 border border-black px-3 py-2 text-right md:min-w-[230px] print:min-w-[190px] print:px-2 print:py-1">
              <p className="text-sm font-bold print:text-[10px] print:leading-3">GSTIN</p>
              <p className="whitespace-nowrap text-base font-extrabold md:text-lg print:text-xs print:leading-4">
                {shop.gstin}
              </p>
            </div>
          </div>
        </header>

        <div className="border-b-2 border-black p-3 text-center print:p-1.5">
          <h2 className="text-2xl font-extrabold print:text-lg">RETAIL INVOICE</h2>
        </div>

        <section className="grid grid-cols-1 border-b-2 border-black md:grid-cols-2 print:grid-cols-2">
          <div className="space-y-2 border-b-2 border-black p-4 md:border-b-0 md:border-r-2 print:border-b-0 print:border-r-2 print:p-2 print:space-y-1">
            <p className="text-lg font-bold print:text-xs"><span className="inline-block w-40 print:w-24">Invoice No.</span>: {invoice.invoice_number}</p>
            <p className="text-lg font-bold print:text-xs"><span className="inline-block w-40 print:w-24">Date</span>: {invoiceDate}</p>
            <p className="text-lg font-bold print:text-xs"><span className="inline-block w-40 print:w-24">Shop</span>: {shop.name}</p>
          </div>
          <div className="space-y-2 p-4 print:p-2 print:space-y-1">
            <h3 className="mb-3 text-xl font-extrabold print:mb-1 print:text-sm">Receiver (Billed To)</h3>
            <p className="text-lg font-semibold print:text-xs"><span className="font-bold">Name:</span> {invoice.customer_name || "-"}</p>
            <p className="whitespace-pre-wrap text-lg font-semibold print:text-xs"><span className="font-bold">Address:</span> {invoice.customer_address || "-"}</p>
            <p className="text-lg font-semibold print:text-xs"><span className="font-bold">GSTIN:</span> {invoice.customer_gst || "-"}</p>
          </div>
        </section>

        <div className="invoice-table-wrap overflow-x-auto print:overflow-visible">
          <table className="invoice-items-table w-full min-w-[900px] table-fixed border-collapse print:min-w-0">
            <thead>
              <tr className="bg-gray-200 print:bg-gray-100">
                <th className="w-[39%] border-r-2 border-b-2 border-black p-3 text-left text-base font-extrabold print:p-1.5 print:text-[10px]">Description</th>
                <th className="w-[8%] border-r-2 border-b-2 border-black p-3 text-base font-extrabold print:p-1.5 print:text-[10px]">Qty</th>
                <th className="w-[11%] border-r-2 border-b-2 border-black p-3 text-base font-extrabold print:p-1.5 print:text-[10px]">Rate</th>
                <th className="w-[9%] border-r-2 border-b-2 border-black p-3 text-base font-extrabold print:p-1.5 print:text-[10px]">Tax %</th>
                <th className="w-[11%] border-r-2 border-b-2 border-black p-3 text-base font-extrabold print:p-1.5 print:text-[10px]">CGST</th>
                <th className="w-[11%] border-r-2 border-b-2 border-black p-3 text-base font-extrabold print:p-1.5 print:text-[10px]">SGST</th>
                <th className="w-[12%] border-b-2 border-black p-3 text-base font-extrabold print:p-1.5 print:text-[10px]">Total</th>
              </tr>
            </thead>
            <tbody>
              {items?.map((item) => (
                <tr key={item.id}>
                  <td className="min-h-[60px] break-words whitespace-pre-wrap border-r-2 border-b-2 border-black p-2 align-top text-base font-semibold print:min-h-0 print:p-1.5 print:text-[10px] print:leading-3">
                    {item.description}
                  </td>
                  <td className="border-r-2 border-b-2 border-black p-2 text-right align-top text-base font-semibold print:p-1.5 print:text-[10px]">{item.qty}</td>
                  <td className="border-r-2 border-b-2 border-black p-2 text-right align-top text-base font-semibold print:p-1.5 print:text-[10px]">{money(item.rate)}</td>
                  <td className="border-r-2 border-b-2 border-black p-2 text-right align-top text-base font-semibold print:p-1.5 print:text-[10px]">{Number(item.tax_percent ?? item.gst_percent ?? 0).toFixed(2)}</td>
                  <td className="border-r-2 border-b-2 border-black p-2 text-right align-top text-base font-semibold print:p-1.5 print:text-[10px]">{money(item.cgst)}</td>
                  <td className="border-r-2 border-b-2 border-black p-2 text-right align-top text-base font-semibold print:p-1.5 print:text-[10px]">{money(item.sgst)}</td>
                  <td className="border-b-2 border-black p-2 text-right align-top text-base font-extrabold print:p-1.5 print:text-[10px]">{money(item.total || item.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2">
          <div className="min-h-[150px] border-b-2 border-black p-4 md:border-b-0 md:border-r-2 print:min-h-[85px] print:border-b-0 print:border-r-2 print:p-2">
            <p className="text-lg font-bold print:text-xs">Amount in Words</p>
            <p className="mt-2 text-lg font-semibold italic print:mt-1 print:text-xs">{amountInWords}</p>
          </div>
          <div>
            <div className="flex justify-between border-b-2 border-black p-3 text-lg font-bold print:p-1.5 print:text-xs"><span>Subtotal</span><span>{money(invoice.subtotal)}</span></div>
            <div className="flex justify-between border-b-2 border-black p-3 text-lg font-bold print:p-1.5 print:text-xs"><span>Total CGST</span><span>{money(invoice.cgst)}</span></div>
            <div className="flex justify-between border-b-2 border-black p-3 text-lg font-bold print:p-1.5 print:text-xs"><span>Total SGST</span><span>{money(invoice.sgst)}</span></div>
            <div className="flex justify-between p-3 text-2xl font-extrabold print:p-2 print:text-base"><span>Grand Total</span><span>{money(invoice.grand_total)}</span></div>
          </div>
        </section>

        <footer className="min-h-[120px] border-t-2 border-black p-4 text-right print:min-h-[75px] print:p-2">
          <p className="text-lg font-bold print:text-xs">For {shop.name}</p>
          <p className="mt-16 text-lg font-bold print:mt-10 print:text-xs">Authorised Signatory</p>
        </footer>
      </article>
    </main>
  );
}
