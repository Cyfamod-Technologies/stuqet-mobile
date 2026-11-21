import { create } from "zustand";
import type { DocumentKey, VehicleKind } from "~/features/rider-account/types";

export interface PickedDocument {
  uri: string;
  name: string;
}

// Answers of the four rider application steps, kept in memory while the
// person moves between the screens. Submitted once, on the last step.
interface RiderApplicationState {
  avatar: PickedDocument | null;
  phone: string;
  school: string;
  area: string;
  vehicle: VehicleKind;
  plate: string;
  documents: Partial<Record<DocumentKey, PickedDocument>>;
  patch: (
    values: Partial<Omit<RiderApplicationState, "patch" | "reset">>,
  ) => void;
  setDocument: (key: DocumentKey, file: PickedDocument | null) => void;
  reset: () => void;
}

const EMPTY = {
  avatar: null,
  phone: "",
  school: "",
  area: "",
  vehicle: "motorbike" as VehicleKind,
  plate: "",
  documents: {},
};

export const useRiderApplication = create<RiderApplicationState>((set) => ({
  ...EMPTY,
  patch: (values) => set(values),
  setDocument: (key, file) =>
    set((state) => {
      const documents = { ...state.documents };
      if (file) documents[key] = file;
      else delete documents[key];
      return { documents };
    }),
  reset: () => set(EMPTY),
}));
