export type VehicleKind = "motorbike" | "bicycle" | "foot";

export type DocumentKey = "government_id" | "drivers_licence" | "id_photo";

export type DocumentState = "approved" | "pending" | "rejected" | "missing";

export interface RiderDocument {
  key: DocumentKey;
  label: string;
  state: DocumentState;
  fileName: string | null;
}

export interface RiderPayout {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface RiderProfile {
  id: number;
  name: string;
  phone: string;
  avatar: string | null;
  school: string;
  area: string;
  vehicle: VehicleKind;
  plate: string | null;
  status: "pending" | "approved";
  documents: RiderDocument[];
  payout: RiderPayout | null;
}

export interface RiderApplication {
  phone: string;
  school: string;
  area: string;
  avatar: string | null;
  vehicle: VehicleKind;
  plate: string | null;
  documents: Partial<Record<DocumentKey, string>>;
  payout: RiderPayout;
}

export interface BankOption {
  code: string;
  name: string;
}

export interface BankResolution {
  accountName: string;
}
