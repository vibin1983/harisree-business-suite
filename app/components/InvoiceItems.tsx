"use client";

import { useMemo, useState } from "react";

type Row = {
  description: string;
  qty: string;
  rate: string;
  tax: string;
};

const money = (value: number) => `₹${value.toFixed(2)}`;

export default function InvoiceItems() {
  const [rows, setRows] = useState<Row[]>([
    { description: "", qty: "1", rate: "0", tax: "18" },
  ]);

  const updateRow = (index: number, field: keyof Row, value: string) => {
    setRows((current) =>
      current.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((current) => [
      ...current,
      { description: "", qty: "1", rate: "0", tax: "18" },
    ]);
  };

  const deleteRow = (index: number) => {
    setRows((current) =>
      current.length === 1 ? current : current.filter((_, i) => i !== index)
    );
  };

  const totals = useMemo(() => {
    return rows.reduce(
      (sum, row) => {
        const qty = Number(row.qty) || 0;
        const rate = Number(row.rate) || 0;
        const tax = Number(row.tax) || 0;

        const base = qty * rate;
        const cgst = (base * tax) / 200;
        const sgst = (base * tax) / 200;
        const total = base + cgst + sgst;

        return {
          subtotal: sum.subtotal + base,
          cgst: sum.cgst + cgst,
          sgst: sum.sgst + sgst,
          grandTotal: sum.grandTotal + total,
        };
      },
      { subtotal: 0, cgst: 0, sgst: 0, grandTotal: 0 }
    );
  }, [rows]);

  const input = "w-full outline-none text-black text-lg font-medium text-right";
  const textInput = "w-full outline-none text-black text-lg font-medium text-left";
  const cell = "border-2 border-gray-600 p-2";

  return (
    <>
      <tbody>
        {rows.map((row, index) => {
          const qty = Number(row.qty) || 0;
          const rate = Number(row.rate) || 0;
          const tax = Number(row.tax) || 0;
          const base = qty * rate;
          const cgst = (base * tax) / 200;
          const sgst = (base * tax) / 200;
          const total = base + cgst + sgst;

          return (
            <tr key={index}>
              <td className={cell}>
                <input
                  value={row.description}
                  onChange={(e) => updateRow(index, "description", e.target.value)}
                  className={textInput}
                  placeholder="Item description"
                />
              </td>

              <td className={`${cell} w-20`}>
                <input
                  value={row.qty}
                  onChange={(e) => updateRow(index, "qty", e.target.value)}
                  className={input}
                />
              </td>

              <td className={`${cell} w-28`}>
                <input
                  value={row.rate}
                  onChange={(e) => updateRow(index, "rate", e.target.value)}
                  className={input}
                />
              </td>

              <td className={`${cell} w-24`}>
                <input
                  value={row.tax}
                  onChange={(e) => updateRow(index, "tax", e.target.value)}
                  className={input}
                />
              </td>

              <td className={`${cell} w-28 text-right text-black font-bold text-lg`}>
                {money(cgst)}
              </td>

              <td className={`${cell} w-28 text-right text-black font-bold text-lg`}>
                {money(sgst)}
              </td>

              <td className={`${cell} w-32 text-right text-black font-bold text-lg`}>
                {money(total)}
              </td>

              <td className={`${cell} w-16 text-center`}>
                <button
                  type="button"
                  onClick={() => deleteRow(index)}
                  className="text-red-700 font-bold"
                >
                  X
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>

      <tfoot>
        <tr>
          <td colSpan={8} className="pt-4">
            <button
              type="button"
              onClick={addRow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold"
            >
              + Add Item
            </button>
          </td>
        </tr>
      </tfoot>

      <div className="mt-8 flex justify-end">
        <div className="w-80">
          <div className="flex justify-between text-lg font-bold text-black border-b py-2">
            <span>Subtotal</span>
            <span>{money(totals.subtotal)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-black border-b py-2">
            <span>CGST Total</span>
            <span>{money(totals.cgst)}</span>
          </div>

          <div className="flex justify-between text-lg font-bold text-black border-b py-2">
            <span>SGST Total</span>
            <span>{money(totals.sgst)}</span>
          </div>

          <div className="flex justify-between text-xl font-bold text-black border-b-2 border-gray-600 py-3">
            <span>Grand Total</span>
            <span>{money(totals.grandTotal)}</span>
          </div>
        </div>
      </div>
    </>
  );
}