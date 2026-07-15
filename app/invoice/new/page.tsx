import InvoiceForm from "@/app/components/InvoiceForm";
import { getNextInvoiceNumber } from "@/utils/invoice";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ shop?: string }>;
}

export default async function NewInvoicePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const shopCode = params.shop ?? "HPS";
  const invoiceNumber = await getNextInvoiceNumber(shopCode);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
<div className="flex items-center justify-between mb-8">
  <h1 className="text-3xl font-bold text-blue-700">
    New GST Invoice
  </h1>

  <Link
    href="/"
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg font-bold"
  >
    Home
  </Link>
</div>

        <InvoiceForm shopCode={shopCode} invoiceNumber={invoiceNumber} />
      </div>
    </main>
  );
}