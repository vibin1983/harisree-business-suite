"use client";

export default function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="no-print bg-green-700 hover:bg-green-800 text-white px-6 py-3 rounded-lg text-lg font-bold"
    >
      Print / Save PDF
    </button>
  );
}
