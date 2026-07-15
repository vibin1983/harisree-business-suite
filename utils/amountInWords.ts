const ONES = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const TENS = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function belowHundred(value: number): string {
  if (value < 20) return ONES[value];
  return `${TENS[Math.floor(value / 10)]}${value % 10 ? ` ${ONES[value % 10]}` : ""}`;
}

function belowThousand(value: number): string {
  const hundreds = Math.floor(value / 100);
  const remainder = value % 100;

  return [
    hundreds ? `${ONES[hundreds]} Hundred` : "",
    remainder ? belowHundred(remainder) : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function integerToIndianWords(value: number): string {
  if (value === 0) return "Zero";

  const parts: string[] = [];
  let remainder = Math.floor(value);

  const crore = Math.floor(remainder / 10_000_000);
  remainder %= 10_000_000;

  const lakh = Math.floor(remainder / 100_000);
  remainder %= 100_000;

  const thousand = Math.floor(remainder / 1_000);
  remainder %= 1_000;

  if (crore) parts.push(`${integerToIndianWords(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (remainder) parts.push(belowThousand(remainder));

  return parts.join(" ");
}

export function amountToWords(value: unknown): string {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue) || numericValue < 0) return "Rupees Zero Only";

  let rupees = Math.floor(numericValue);
  let paise = Math.round((numericValue - rupees) * 100);

  if (paise === 100) {
    rupees += 1;
    paise = 0;
  }

  const rupeeWords = integerToIndianWords(rupees);
  const paiseWords = paise ? ` and ${integerToIndianWords(paise)} Paise` : "";

  return `Rupees ${rupeeWords}${paiseWords} Only`;
}
