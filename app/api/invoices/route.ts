import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

type InvoiceItemPayload = {
  description: string;
  qty: number;
  rate: number;
  taxPercent: number;
  cgst: number;
  sgst: number;
  total: number;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("code", body.shopCode)
      .single();

    if (shopError || !shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 400 });
    }

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        invoice_number: body.invoiceNumber,
        shop_id: shop.id,
        customer_name: body.customerName || null,
        customer_address: body.customerAddress || null,
        customer_gst: body.customerGst || null,
        subtotal: body.subtotal,
        cgst: body.cgst,
        sgst: body.sgst,
        grand_total: body.grandTotal,
      })
      .select("id")
      .single();

    if (invoiceError || !invoice) {
      return NextResponse.json(
        { error: invoiceError?.message || "Invoice save failed" },
        { status: 400 }
      );
    }

    const items: InvoiceItemPayload[] = Array.isArray(body.items) ? body.items : [];
    const itemsToInsert = items.map((item) => ({
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

    if (itemError) {
      await supabase.from("invoices").delete().eq("id", invoice.id);
      return NextResponse.json({ error: itemError.message }, { status: 400 });
    }

    // Remember or refresh the receiver details for future suggestions.
    if (body.customerName?.trim()) {
      const customerName = body.customerName.trim();
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .ilike("name", customerName)
        .limit(1)
        .maybeSingle();

      if (existingCustomer) {
        await supabase
          .from("customers")
          .update({
            name: customerName,
            address: body.customerAddress || null,
            gst_number: body.customerGst || null,
          })
          .eq("id", existingCustomer.id);
      } else {
        await supabase.from("customers").insert({
          name: customerName,
          address: body.customerAddress || null,
          gst_number: body.customerGst || null,
        });
      }
    }

    // Remember item descriptions and their latest tax rate. This is not inventory.
    for (const item of items) {
      const description = item.description.trim();
      if (!description) continue;

      const { data: existingItem } = await supabase
        .from("items")
        .select("id")
        .eq("shop_code", body.shopCode)
        .ilike("description", description)
        .limit(1)
        .maybeSingle();

      if (existingItem) {
        await supabase
          .from("items")
          .update({ description, default_gst: item.taxPercent })
          .eq("id", existingItem.id);
      } else {
        await supabase.from("items").insert({
          shop_code: body.shopCode,
          description,
          default_gst: item.taxPercent,
        });
      }
    }

    await supabase
      .from("invoice_sequences")
      .update({ last_number: Number(body.invoiceNumber.slice(-4)) })
      .eq("shop_id", shop.id);

    return NextResponse.json({ success: true, invoiceId: invoice.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
