"use server";

import { supabase } from "@/lib/supabase";

type InvoiceItem = {
  description: string;
  qty: number;
  rate: number;
  taxPercent: number;
  cgst: number;
  sgst: number;
  total: number;
};

export async function saveInvoice(data: {
  shopCode: string;
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerGst: string;
  subtotal: number;
  cgst: number;
  sgst: number;
  grandTotal: number;
  items: InvoiceItem[];
}) {
  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("code", data.shopCode)
    .single();

  if (!shop) throw new Error("Shop not found");

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      invoice_number: data.invoiceNumber,
      shop_id: shop.id,
      customer_name: data.customerName,
      customer_address: data.customerAddress,
      customer_gst: data.customerGst,
      subtotal: data.subtotal,
      cgst: data.cgst,
      sgst: data.sgst,
      grand_total: data.grandTotal,
    })
    .select("id")
    .single();

  if (error || !invoice) throw new Error(error?.message || "Invoice save failed");

  const itemsToInsert = data.items.map((item) => ({
    invoice_id: invoice.id,
    description: item.description,
    qty: item.qty,
    rate: item.rate,
    tax_percent: item.taxPercent,
    cgst: item.cgst,
    sgst: item.sgst,
    total: item.total,
    amount: item.total,
    gst_percent: item.taxPercent,
  }));

  const { error: itemError } = await supabase
    .from("invoice_items")
    .insert(itemsToInsert);

  if (itemError) throw new Error(itemError.message);

  await supabase
    .from("invoice_sequences")
    .update({ last_number: Number(data.invoiceNumber.slice(-4)) })
    .eq("shop_id", shop.id);

  return { success: true, invoiceId: invoice.id };
}