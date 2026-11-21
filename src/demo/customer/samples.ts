/**
 * Sample values the "Fill with sample data" chips load into the customer and
 * rider forms. Tapping a chip again loads the next variant.
 */
export const customerSamples = {
  signup: [
    {
      name: "Ada Okafor",
      contact: "ada.new@student.edu",
      phone: "0801 234 5678",
      password: "secret1",
    },
    {
      name: "Tolu Bamidele",
      contact: "tolu@student.edu",
      phone: "0802 345 6789",
      password: "secret2",
    },
  ],
  address: [
    { address: "12 Hostel Road, Room 4", phone: "0803 123 4567" },
    {
      address: "Block C, Room 9, Riverside University",
      phone: "0805 234 5678",
    },
  ],
  coupon: { valid: "WELCOME10", invalid: "WELCM10" },
  review: [
    "Hot, tasty and on time. Thank you!",
    "Good food, the rider was very polite.",
    "Packed well and arrived warm.",
  ],
  chat: [
    "Can you add extra pepper please?",
    "Please leave the bag at the hostel gate.",
    "How long until it is ready?",
  ],
  riderProfile: [{ phone: "0801 234 5678" }, { phone: "0802 987 6543" }],
  plates: ["ABC 123 XY", "LND 482 KJ"],
  payout: [
    { bankCode: "044", accountNumber: "0123456789" },
    { bankCode: "058", accountNumber: "0987654321" },
  ],
  resetCode: "123456",
  newPassword: "secret99",
} as const;
