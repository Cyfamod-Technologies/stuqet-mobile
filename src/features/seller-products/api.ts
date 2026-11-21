import { axiosPrivate } from "~/lib/config/axios";
import type {
  CategoryNode,
  ChangeStatusInput,
  CreateProductPayload,
  ListProductsParams,
  SellerProductsPage,
} from "./types";

const SellerProductService = {
  /** 10 rows per page, newest first. Only `listing_type`, `search` and `page`
   * are supported server-side. */
  list: async ({
    listing_type,
    search,
    page,
  }: ListProductsParams): Promise<SellerProductsPage> => {
    const { data } = await axiosPrivate.get<SellerProductsPage>(
      "/seller/products/all",
      { params: { listing_type, page, ...(search ? { search } : {}) } },
    );
    return data;
  },

  /** One tree shared by products and food; children nest under `child`. */
  categories: async (): Promise<CategoryNode[]> => {
    const { data } = await axiosPrivate.get<{ data: CategoryNode[] }>(
      "/seller/products/categories",
    );
    return data.data;
  },

  /** Serves both listing types. The response carries no product id. */
  create: async (payload: CreateProductPayload): Promise<string> => {
    const { data } = await axiosPrivate.post<{
      result: boolean;
      message: string;
    }>("/seller/products/add", payload);
    return data.message;
  },

  /** Published switch. At the package limit this also fails for unpublish. */
  changeStatus: async ({ id, status }: ChangeStatusInput): Promise<void> => {
    await axiosPrivate.post("/seller/product/change-status", {
      id,
      status: status ? 1 : 0,
    });
  },
};

export default SellerProductService;
