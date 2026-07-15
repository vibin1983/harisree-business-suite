import { supabase } from "@/lib/supabase";

export async function getNextInvoiceNumber(shopCode: string) {
  const { data: shop, error: shopError } = await supabase
    .from("shops")
    .select("id, invoice_prefix")
    .eq("code", shopCode)
    .single();

  if (shopError || !shop) {
    throw new Error("Shop not found");
  }

  const { data: sequence, error: sequenceError } = await supabase
    .from("invoice_sequences")
    .select("financial_year, last_number")
    .eq("shop_id", shop.id)
    .single();

  if (sequenceError || !sequence) {
    throw new Error("Invoice sequence not found");
  }

  const nextNumber = sequence.last_number + 1;
  const paddedNumber = String(nextNumber).padStart(4, "0");

  return `${shop.invoice_prefix}${sequence.financial_year}${paddedNumber}`;
}