export type ShopDetails = {
  code: "HPS" | "HHA" | "HEL";
  name: string;
  addressLines: string[];
  phone: string;
  gstin: string;
};

export const SHOP_DETAILS: Record<string, ShopDetails> = {
  HHA: {
    code: "HHA",
    name: "HARISREE HOME APPLIANCES",
    addressLines: [
      "Branch: Shop No:40/54 & 40/55, Vyapar Mandir, Palarivattom,",
      "Cochin: 682025",
    ],
    phone: "9048807591, 7356858334",
    gstin: "32AADFH3246A1Z5",
  },
  HPS: {
    code: "HPS",
    name: "HARISREE PLUMBING AND SERVICES",
    addressLines: [
      "Branch: Shop No:40/60, Vyapar Mandir, Palarivattom,",
      "Cochin: 682025",
    ],
    phone: "9048807591, 7356858334",
    gstin: "32DEUPM4145H1Z9",
  },
  HEL: {
    code: "HEL",
    name: "HARISREE ELECTRICALS",
    addressLines: [
      "Branch: Shop No:40/54 & 40/55, Vyapar Mandir, Palarivattom,",
      "Cochin: 682025",
    ],
    phone: "9048807591, 7356858334",
    gstin: "32AADFH3246A1Z5",
  },
};

export function getShopDetails(code: string): ShopDetails {
  return SHOP_DETAILS[code] ?? SHOP_DETAILS.HPS;
}
