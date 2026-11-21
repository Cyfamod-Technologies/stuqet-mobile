import { create } from "zustand";

// The address picked on the Delivery address screen for the order being
// checked out. In memory only: a new checkout starts from the default address.
interface CheckoutState {
  addressId: number | null;
  setAddressId: (id: number | null) => void;
}

export const useCheckoutStore = create<CheckoutState>((set) => ({
  addressId: null,
  setAddressId: (addressId) => set({ addressId }),
}));
