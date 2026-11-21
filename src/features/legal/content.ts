export interface LegalDocument {
  title: string;
  /** Section headings, numbered by position. */
  sections: string[];
}

// TODO(content): Stuqet supplies the final wording (and the section headings,
// which are placeholders too). Until then each section shows the
// "[LEGAL TEXT PROVIDED BY STUQET]" marker from the approved boards.
export const LEGAL_TEXT_PLACEHOLDER = "[LEGAL TEXT PROVIDED BY STUQET]";
export const LAST_UPDATED_PLACEHOLDER = "[DATE]";

export const TERMS: LegalDocument = {
  title: "Terms",
  sections: [
    "About these terms",
    "Your seller account",
    "Listings and approval",
    "Orders, fees and payouts",
    "Content and conduct",
    "Changes to these terms",
    "Contact us",
  ],
};

export const PRIVACY: LegalDocument = {
  title: "Privacy policy",
  sections: [
    "What we collect",
    "How we use it",
    "Who we share it with",
    "How long we keep it",
    "Your choices",
    "Contact us",
  ],
};
