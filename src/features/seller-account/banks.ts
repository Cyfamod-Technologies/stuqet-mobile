import type { BankOption } from "./types";

// TODO(backend): replace with the bank list from the payment provider (e.g.
// Paystack `GET /bank`) served by the backend, so codes never go stale. Codes
// are the provider's bank codes, which the resolve endpoint expects.
export const NIGERIAN_BANKS: readonly BankOption[] = [
  { name: "Access Bank", code: "044" },
  { name: "Citibank Nigeria", code: "023" },
  { name: "Ecobank", code: "050" },
  { name: "Fidelity Bank", code: "070" },
  { name: "First Bank", code: "011" },
  { name: "FCMB", code: "214" },
  { name: "Globus Bank", code: "00103" },
  { name: "GTBank", code: "058" },
  { name: "Jaiz Bank", code: "301" },
  { name: "Keystone Bank", code: "082" },
  { name: "Kuda", code: "50211" },
  { name: "Moniepoint", code: "50515" },
  { name: "Opay", code: "999992" },
  { name: "PalmPay", code: "999991" },
  { name: "Polaris Bank", code: "076" },
  { name: "Providus Bank", code: "101" },
  { name: "Stanbic IBTC", code: "221" },
  { name: "Standard Chartered", code: "068" },
  { name: "Sterling Bank", code: "232" },
  { name: "UBA", code: "033" },
  { name: "Union Bank", code: "032" },
  { name: "Unity Bank", code: "215" },
  { name: "Wema Bank", code: "035" },
  { name: "Zenith Bank", code: "057" },
];

export function bankCodeFor(name: string): string | null {
  return NIGERIAN_BANKS.find((bank) => bank.name === name)?.code ?? null;
}
