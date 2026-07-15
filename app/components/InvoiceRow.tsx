"use client";

import { useMemo, useState } from "react";

export default function InvoiceRow() {
  const [qty, setQty] = useState("1");
  const [rate, setRate] = useState("0");
  const [tax, setTax] = useState("18");

  const numbers = useMemo(() => {
    const q = Number(qty) || 0;
    const r = Number(rate) || 0;
    const t = Number(tax) || 0;

    const base = q * r;
    const cgst = (base * t) / 200;
    const sgst = (base * t) / 200;
    const total = base + cgst + sgst;

    return { cgst, sgst, total };
  }, [qty, rate, tax]);

  const input =
    "w-full outline-none text-black text-lg font-medium text-right";

  const money = (value: number) =>
    `₹${value.toFixed(2)}`;

  return (
    <tr>
      <td className="border-2 border-gray-600 p-2">
        <input
          className="w-full outline-none text-black text-lg font-medium text-left"
          placeholder="Item description"
        />
      </td>

      <td className="border-2 border-gray-600 p-2 w-20">
        <input
          value={qty}
          onChange={(e) => setQty(e.target.value)}
          className={input}
        />
      </td>

      <td className="border-2 border-gray-600 p-2 w-28">
        <input
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className={input}
        />
      </td>

      <td className="border-2 border-gray-600 p-2 w-24">
        <input
          value={tax}
          onChange={(e) => setTax(e.target.value)}
          className={input}
        />
      </td>

      <td className="border-2 border-gray-600 p-2 w-28 text-right text-black font-bold text-lg">
        {money(numbers.cgst)}
      </td>

      <td className="border-2 border-gray-600 p-2 w-28 text-right text-black font-bold text-lg">
        {money(numbers.sgst)}
      </td>

      <td className="border-2 border-gray-600 p-2 w-32 text-right text-black font-bold text-lg">
        {money(numbers.total)}
      </td>
    </tr>
  );
}