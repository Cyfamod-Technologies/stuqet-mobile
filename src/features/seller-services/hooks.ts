import {
  useCreateProduct,
  useSellerProducts,
} from "~/features/seller-products/hooks";

/** Infinite list of the shop's services (10 per page). */
export function useSellerServices() {
  return useSellerProducts("service", "");
}

/** Creates a service through the shared product endpoint; 422s are left for the
 * form to map onto its fields. */
export const useCreateService = useCreateProduct;
