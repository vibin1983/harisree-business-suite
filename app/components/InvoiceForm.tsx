"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getShopDetails } from "@/lib/shopDetails";

type Row = {
  description: string;
  qty: string;
  rate: string;
  tax: string;
};

type CustomerSuggestion = {
  id: number;
  name: string | null;
  address: string | null;
  gst_number: string | null;
  phone: string | null;
};

type ItemSuggestion = {
  id: number;
  description: string;
  default_gst: number | null;
};

const emptyRow = (): Row => ({
  description: "",
  qty: "1",
  rate: "0",
  tax: "18",
});

export default function InvoiceForm({
  shopCode,
  invoiceNumber,
}: {
  shopCode: string;
  invoiceNumber: string;
}) {
  const router = useRouter();
  const shop = getShopDetails(shopCode);
  const [customerName, setCustomerName] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customers, setCustomers] = useState<CustomerSuggestion[]>([]);
  const [items, setItems] = useState<ItemSuggestion[]>([]);
  const [activeItemRow, setActiveItemRow] = useState<number | null>(null);
  const [customerFocused, setCustomerFocused] = useState(false);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<Row[]>([emptyRow()]);

  const loadSuggestions = async () => {
    try {
      const response = await fetch(`/api/suggestions?shopCode=${encodeURIComponent(shopCode)}`);
      if (!response.ok) return;
      const result = await response.json();
      setCustomers(result.customers ?? []);
      setItems(result.items ?? []);
    } catch {
      // Suggestions are a convenience; billing should still work if loading fails.
    }
  };

  useEffect(() => {
    loadSuggestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopCode]);

  const money = (value: number) => `₹${value.toFixed(2)}`;

  const updateRow = (index: number, field: keyof Row, value: string) => {
    setRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => setRows((currentRows) => [...currentRows, emptyRow()]);

  const deleteRow = (index: number) => {
    setRows((currentRows) =>
      currentRows.length === 1
        ? currentRows
        : currentRows.filter((_, rowIndex) => rowIndex !== index)
    );
  };

  const totals = useMemo(() => {
    return rows.reduce(
      (sum, row) => {
        const qty = Number(row.qty) || 0;
        const rate = Number(row.rate) || 0;
        const tax = Number(row.tax) || 0;
        const subtotal = qty * rate;
        const cgst = (subtotal * tax) / 200;
        const sgst = (subtotal * tax) / 200;
        return {
          subtotal: sum.subtotal + subtotal,
          cgst: sum.cgst + cgst,
          sgst: sum.sgst + sgst,
          grandTotal: sum.grandTotal + subtotal + cgst + sgst,
        };
      },
      { subtotal: 0, cgst: 0, sgst: 0, grandTotal: 0 }
    );
  }, [rows]);

  const customerMatches = useMemo(() => {
    const query = customerName.trim().toLowerCase();
    if (!query) return customers.slice(0, 8);
    return customers
      .filter((customer) => customer.name?.toLowerCase().includes(query))
      .slice(0, 8);
  }, [customerName, customers]);

  const itemMatches = (description: string) => {
    const query = description.trim().toLowerCase();
    if (!query) return items.slice(0, 8);
    return items
      .filter((item) => item.description.toLowerCase().includes(query))
      .slice(0, 8);
  };

  const selectCustomer = (customer: CustomerSuggestion) => {
    setCustomerName(customer.name ?? "");
    setCustomerAddress(customer.address ?? "");
    setCustomerGst(customer.gst_number ?? "");
    setCustomerFocused(false);
  };

  const selectItem = (index: number, item: ItemSuggestion) => {
    setRows((currentRows) =>
      currentRows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              description: item.description,
              tax: String(item.default_gst ?? 18),
            }
          : row
      )
    );
    setActiveItemRow(null);
  };

  const clearForm = () => {
    setCustomerName("");
    setCustomerGst("");
    setCustomerAddress("");
    setRows([emptyRow()]);
    setMessage("");
  };

  const handleSave = async () => {
    const validRows = rows.filter((row) => row.description.trim() !== "");
    if (validRows.length === 0) {
      setMessage("Please enter at least one item.");
      return;
    }

    setSaving(true);
    setMessage("Saving...");

    const invoiceItems = validRows.map((row) => {
      const qty = Number(row.qty) || 0;
      const rate = Number(row.rate) || 0;
      const taxPercent = Number(row.tax) || 0;
      const subtotal = qty * rate;
      const cgst = (subtotal * taxPercent) / 200;
      const sgst = (subtotal * taxPercent) / 200;
      return {
        description: row.description.trim(),
        qty,
        rate,
        taxPercent,
        cgst,
        sgst,
        total: subtotal + cgst + sgst,
      };
    });

    try {
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopCode,
          invoiceNumber,
          customerName,
          customerAddress,
          customerGst,
          subtotal: totals.subtotal,
          cgst: totals.cgst,
          sgst: totals.sgst,
          grandTotal: totals.grandTotal,
          items: invoiceItems,
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Invoice save failed");

      setMessage(`Saved successfully: ${invoiceNumber}`);
      await loadSuggestions();
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Invoice save failed");
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = "block mb-2 text-lg font-bold text-black";
  const inputStyle =
    "w-full border-2 border-gray-700 rounded p-3 text-lg font-semibold text-black bg-white";
  const readonlyStyle =
    "w-full border-2 border-gray-700 rounded p-3 bg-gray-100 text-lg font-bold text-black";
  const headerStyle =
    "border-2 border-gray-700 p-3 text-black font-bold text-lg";
  const cellStyle = "border-2 border-gray-700 p-2 align-top";
  const numberInputStyle =
    "w-full outline-none text-black text-lg font-semibold text-right bg-white";

  return (
    <>
      <section className="mb-8 border-2 border-gray-700 p-5 bg-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-black">
              {shop.name}
            </h2>
            {shop.addressLines.map((line) => (
              <p key={line} className="text-base md:text-lg font-semibold text-black">
                {line}
              </p>
            ))}
            <p className="text-base md:text-lg font-semibold text-black">
              Phone: {shop.phone}
            </p>
          </div>
          <div className="md:text-right border-2 border-gray-700 p-3 min-w-[250px]">
            <p className="text-lg font-bold text-black">GSTIN</p>
            <p className="text-xl md:text-2xl font-extrabold text-black break-all">
              {shop.gstin}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={labelStyle}>Shop</label>
          <input value={shopCode} readOnly className={readonlyStyle} />
        </div>
        <div>
          <label className={labelStyle}>Invoice Number</label>
          <input value={invoiceNumber} readOnly className={readonlyStyle} />
        </div>
        <div>
          <label className={labelStyle}>Date</label>
          <input
            value={new Date().toLocaleDateString("en-IN")}
            readOnly
            className={readonlyStyle}
          />
        </div>

        <div className="relative md:col-span-2">
          <label className={labelStyle}>Receiver Name</label>
          <input
            value={customerName}
            onFocus={() => setCustomerFocused(true)}
            onChange={(event) => {
              setCustomerName(event.target.value);
              setCustomerFocused(true);
            }}
            onBlur={() => window.setTimeout(() => setCustomerFocused(false), 150)}
            className={inputStyle}
            autoComplete="off"
            placeholder="Start typing a previous customer name"
          />
          {customerFocused && customerMatches.length > 0 && (
            <div className="absolute z-40 mt-1 w-full max-h-72 overflow-y-auto border-2 border-gray-700 bg-white shadow-xl">
              {customerMatches.map((customer) => (
                <button
                  key={customer.id}
                  type="button"
                  onMouseDown={() => selectCustomer(customer)}
                  className="block w-full border-b border-gray-300 p-3 text-left hover:bg-blue-50"
                >
                  <span className="block text-lg font-bold text-black">
                    {customer.name}
                  </span>
                  {(customer.address || customer.gst_number) && (
                    <span className="block text-sm font-semibold text-gray-700">
                      {[customer.address, customer.gst_number].filter(Boolean).join(" | ")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className={labelStyle}>Receiver GST Number</label>
          <input
            value={customerGst}
            onChange={(event) => setCustomerGst(event.target.value)}
            className={inputStyle}
          />
        </div>

        <div className="md:col-span-3">
          <label className={labelStyle}>Receiver Address</label>
          <textarea
            rows={3}
            value={customerAddress}
            onChange={(event) => setCustomerAddress(event.target.value)}
            className={inputStyle}
          />
        </div>
      </div>

      <hr className="my-8 border-gray-500" />

      <div className="overflow-x-auto pb-72 md:pb-56">
        <table className="w-full min-w-[1050px] border-2 border-gray-700 border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-300">
              <th className={`${headerStyle} text-left w-[43%]`}>Description</th>
              <th className={`${headerStyle} w-[7%]`}>Qty</th>
              <th className={`${headerStyle} w-[10%]`}>Rate</th>
              <th className={`${headerStyle} w-[8%]`}>Tax %</th>
              <th className={`${headerStyle} w-[10%]`}>CGST</th>
              <th className={`${headerStyle} w-[10%]`}>SGST</th>
              <th className={`${headerStyle} w-[11%]`}>Total</th>
              <th className={`${headerStyle} w-[5%]`}>Del</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const qty = Number(row.qty) || 0;
              const rate = Number(row.rate) || 0;
              const tax = Number(row.tax) || 0;
              const subtotal = qty * rate;
              const cgst = (subtotal * tax) / 200;
              const sgst = (subtotal * tax) / 200;
              const total = subtotal + cgst + sgst;
              const matches = itemMatches(row.description);

              return (
                <tr key={index}>
                  <td className={`${cellStyle} relative`}>
                    <textarea
                      rows={4}
                      value={row.description}
                      onFocus={() => setActiveItemRow(index)}
                      onChange={(event) => {
                        updateRow(index, "description", event.target.value);
                        setActiveItemRow(index);
                      }}
                      onBlur={() => window.setTimeout(() => setActiveItemRow(null), 150)}
                      className="w-full min-h-[110px] outline-none text-black text-lg font-semibold text-left resize-y whitespace-pre-wrap break-words bg-white"
                      placeholder="Start typing an item description"
                      autoComplete="off"
                    />
                    {activeItemRow === index && matches.length > 0 && (
                      <div className="absolute left-0 right-0 top-full z-50 max-h-72 overflow-y-auto border-2 border-gray-700 bg-white shadow-2xl">
                        {matches.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={() => selectItem(index, item)}
                            className="block w-full border-b border-gray-300 p-3 text-left text-lg font-semibold text-black hover:bg-blue-50 whitespace-normal break-words"
                          >
                            {item.description}
                          </button>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className={cellStyle}>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={row.qty}
                      onChange={(event) => updateRow(index, "qty", event.target.value)}
                      className={numberInputStyle}
                    />
                  </td>
                  <td className={cellStyle}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.rate}
                      onChange={(event) => updateRow(index, "rate", event.target.value)}
                      className={numberInputStyle}
                    />
                  </td>
                  <td className={cellStyle}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={row.tax}
                      onChange={(event) => updateRow(index, "tax", event.target.value)}
                      className={numberInputStyle}
                    />
                  </td>
                  <td className={`${cellStyle} text-right text-black font-bold text-lg`}>
                    {money(cgst)}
                  </td>
                  <td className={`${cellStyle} text-right text-black font-bold text-lg`}>
                    {money(sgst)}
                  </td>
                  <td className={`${cellStyle} text-right text-black font-bold text-lg`}>
                    {money(total)}
                  </td>
                  <td className={`${cellStyle} text-center`}>
                    <button
                      type="button"
                      onClick={() => deleteRow(index)}
                      className="text-red-700 font-extrabold text-xl"
                      title="Delete item"
                    >
                      X
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <button
        type="button"
        onClick={addRow}
        className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-lg text-lg font-bold"
      >
        + Add Item
      </button>

      <div className="mt-8 flex justify-end">
        <div className="w-full md:w-96 border-2 border-gray-700 p-4">
          <div className="flex justify-between text-lg font-bold text-black border-b py-2">
            <span>Subtotal</span><span>{money(totals.subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-black border-b py-2">
            <span>CGST Total</span><span>{money(totals.cgst)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-black border-b py-2">
            <span>SGST Total</span><span>{money(totals.sgst)}</span>
          </div>
          <div className="flex justify-between text-xl font-extrabold text-black border-b-2 border-gray-700 py-3">
            <span>Grand Total</span><span>{money(totals.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-green-700 hover:bg-green-800 disabled:bg-gray-400 text-white px-8 py-3 rounded-lg text-lg font-bold"
        >
          {saving ? "Saving..." : "Save Invoice"}
        </button>
        <button
          type="button"
          onClick={clearForm}
          disabled={saving}
          className="bg-gray-700 hover:bg-gray-800 text-white px-8 py-3 rounded-lg text-lg font-bold"
        >
          Clear
        </button>
      </div>

      {message && (
        <p className="mt-6 text-xl font-bold text-blue-800 text-right">{message}</p>
      )}
    </>
  );
}
