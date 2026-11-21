/** Shape of GET /seller/shop-verify-form (the admin-configured form). The
 * `options` of choice fields are JSON-encoded strings, as the API sends them. */
export const VERIFICATION_FORM = [
  { type: "text", label: "Business registration number (RC)" },
  { type: "file", label: "CAC certificate or business permit" },
  { type: "file", label: "Valid ID (NIN slip, passport or school ID)" },
  {
    type: "select",
    label: "Type of business",
    options: JSON.stringify([
      "Sole trader",
      "Registered company",
      "Student business",
      "Restaurant or kitchen",
    ]),
  },
  {
    type: "multi_select",
    label: "What do you sell?",
    options: JSON.stringify([
      "Electronics",
      "Fashion",
      "School supplies",
      "Food and drinks",
      "Services",
    ]),
  },
  {
    type: "radio",
    label: "Do you deliver orders yourself?",
    options: JSON.stringify([
      "Yes, myself",
      "Yes, with a rider",
      "No, buyers pick up",
    ]),
  },
] as const;
