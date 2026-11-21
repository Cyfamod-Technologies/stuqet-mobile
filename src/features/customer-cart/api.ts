import { axiosPrivate } from "~/lib/config/axios";
import type { OrderSummary } from "~/features/customer-orders/types";
import type {
  AddToCartInput,
  Cart,
  CheckoutPreview,
  PlaceOrderInput,
} from "./types";
import type { FulfilmentMode } from "~/features/customer-food/types";

// TODO(backend): the food cart and checkout are proposed endpoints. The real
// cart routes (`carts/add`, `carts`, `cart-summary`, `coupon-apply`) are built
// around product variants and shipping carriers; food needs sizes, add-ons,
// per vendor groups and a fulfilment mode (delivery, pickup, dine in):
//   GET    /food/cart                        -> Cart
//   POST   /food/cart/items                  -> Cart   (409 `different_vendor` unless `replace`)
//   POST   /food/cart/items/{id}             -> Cart   ({ quantity?, note? })
//   DELETE /food/cart/items/{id}             -> Cart
//   DELETE /food/cart/vendors/{vendorId}     -> Cart
//   POST   /food/cart/coupon                 -> Cart   ({ vendorId, code }; `coupon-apply` is the product one)
//   DELETE /food/cart/coupon/{vendorId}      -> Cart
//   GET    /food/checkout?vendorId&mode&addressId -> CheckoutPreview
//   POST   /food/orders                      -> OrderSummary ("Pay online" starts Paystack, see `paystack/init`)

const CartService = {
  cart: async (): Promise<Cart> =>
    (await axiosPrivate.get<Cart>("/food/cart")).data,

  addItem: async (input: AddToCartInput): Promise<Cart> =>
    (await axiosPrivate.post<Cart>("/food/cart/items", input)).data,

  updateItem: async (
    id: number,
    input: { quantity?: number; note?: string | null },
  ): Promise<Cart> =>
    (await axiosPrivate.post<Cart>(`/food/cart/items/${id}`, input)).data,

  removeItem: async (id: number): Promise<Cart> =>
    (await axiosPrivate.delete<Cart>(`/food/cart/items/${id}`)).data,

  removeVendor: async (vendorId: number): Promise<Cart> =>
    (await axiosPrivate.delete<Cart>(`/food/cart/vendors/${vendorId}`)).data,

  applyCoupon: async (vendorId: number, code: string): Promise<Cart> =>
    (await axiosPrivate.post<Cart>("/food/cart/coupon", { vendorId, code }))
      .data,

  removeCoupon: async (vendorId: number): Promise<Cart> =>
    (await axiosPrivate.delete<Cart>(`/food/cart/coupon/${vendorId}`)).data,

  checkout: async (params: {
    vendorId: number;
    mode: FulfilmentMode;
    addressId: number | null;
  }): Promise<CheckoutPreview> =>
    (
      await axiosPrivate.get<CheckoutPreview>("/food/checkout", {
        params: { ...params, addressId: params.addressId ?? undefined },
      })
    ).data,

  placeOrder: async (input: PlaceOrderInput): Promise<OrderSummary> =>
    (await axiosPrivate.post<OrderSummary>("/food/orders", input)).data,
};

export default CartService;
