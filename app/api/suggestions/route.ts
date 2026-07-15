import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type CustomerSuggestion = {
  id: string | number;
  name: string | null;
  address: string | null;
  gst_number: string | null;
  phone: string | null;
};

type ItemSuggestion = {
  id: string | number;
  description: string;
  hsn: string | null;
  default_gst: number | null;
  shop_code: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const shopCode = searchParams.get("shopCode") || "HPS";

  const { data: shop } = await supabase
    .from("shops")
    .select("id")
    .eq("code", shopCode)
    .single();

  const [{ data: customerRows }, { data: invoiceCustomers }, { data: itemRows }] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, address, gst_number, phone")
        .order("id", { ascending: false })
        .limit(200),
      shop
        ? supabase
            .from("invoices")
            .select("id, customer_name, customer_address, customer_gst")
            .eq("shop_id", shop.id)
            .not("customer_name", "is", null)
            .order("id", { ascending: false })
            .limit(200)
        : Promise.resolve({ data: [] }),
      supabase
        .from("items")
        .select("id, description, hsn, default_gst, shop_code")
        .eq("shop_code", shopCode)
        .order("id", { ascending: false })
        .limit(300),
    ]);

  let previousInvoiceItems: Array<{
    id: number;
    description: string | null;
    tax_percent: number | null;
    gst_percent: number | null;
  }> = [];

  if (shop) {
    const { data: invoiceIds } = await supabase
      .from("invoices")
      .select("id")
      .eq("shop_id", shop.id)
      .order("id", { ascending: false })
      .limit(100);

    const ids = (invoiceIds ?? []).map((invoice) => invoice.id);
    if (ids.length > 0) {
      const { data } = await supabase
        .from("invoice_items")
        .select("id, description, tax_percent, gst_percent")
        .in("invoice_id", ids)
        .not("description", "is", null)
        .order("id", { ascending: false })
        .limit(500);
      previousInvoiceItems = data ?? [];
    }
  }

  const customerMap = new Map<string, CustomerSuggestion>();
  for (const customer of customerRows ?? []) {
    if (!customer.name?.trim()) continue;
    customerMap.set(customer.name.trim().toLowerCase(), customer);
  }
  for (const invoice of invoiceCustomers ?? []) {
    const name = invoice.customer_name?.trim();
    if (!name) continue;
    const key = name.toLowerCase();
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        id: `invoice-${invoice.id}`,
        name,
        address: invoice.customer_address,
        gst_number: invoice.customer_gst,
        phone: null,
      });
    }
  }

  const itemMap = new Map<string, ItemSuggestion>();
  for (const item of itemRows ?? []) {
    if (!item.description?.trim()) continue;
    itemMap.set(item.description.trim().toLowerCase(), item);
  }
  for (const item of previousInvoiceItems) {
    const description = item.description?.trim();
    if (!description) continue;
    const key = description.toLowerCase();
    if (!itemMap.has(key)) {
      itemMap.set(key, {
        id: `invoice-item-${item.id}`,
        description,
        hsn: null,
        default_gst: item.tax_percent ?? item.gst_percent ?? 18,
        shop_code: shopCode,
      });
    }
  }

  return NextResponse.json({
    customers: Array.from(customerMap.values()),
    items: Array.from(itemMap.values()),
  });
}
