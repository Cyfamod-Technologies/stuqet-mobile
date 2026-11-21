import { useEffect, useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type InfiniteData,
} from "@tanstack/react-query";
import { handleApiError } from "~/lib/utils/error-handler";
import { notifyError } from "~/lib/utils/toast";
import { QUERY_KEYS } from "~/lib/utils/query-keys";
import SellerProductService from "./api";
import {
  getApiMessage,
  getValidationErrors,
  isPackageLimitError,
} from "./errors";
import type {
  AnyListingType,
  ChangeStatusInput,
  ListingType,
  SellerProductsPage,
} from "./types";
import { flattenCategories } from "./utils";

/** Package-limit failures get a clear message; everything else the default. */
export function reportError(error: unknown) {
  if (isPackageLimitError(error)) {
    notifyError({
      message: "Package limit reached",
      description:
        getApiMessage(error) ?? "Please upgrade your package to continue.",
    });
    return;
  }
  handleApiError(error);
}

/** Value that only updates after `delay` ms without changes (search box). */
export function useDebouncedValue<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

/** Infinite list of one listing type (10 per page, server-side search). */
export function useSellerProducts(listingType: AnyListingType, search: string) {
  return useInfiniteQuery({
    queryKey: QUERY_KEYS.seller.products.list({
      listing_type: listingType,
      search,
    }),
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      SellerProductService.list({
        listing_type: listingType,
        search: search || undefined,
        page: pageParam,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.meta) {
        return lastPage.meta.current_page < lastPage.meta.last_page
          ? lastPage.meta.current_page + 1
          : undefined;
      }
      // Paginator meta missing: assume a full page means there may be more.
      return lastPage.data.length >= 10 ? allPages.length + 1 : undefined;
    },
  });
}

function useTotal(listingType: ListingType) {
  return useQuery({
    // `view: "count"` keeps this apart from the infinite list of the same type.
    queryKey: QUERY_KEYS.seller.products.list({
      listing_type: listingType,
      view: "count",
    }),
    queryFn: () =>
      SellerProductService.list({ listing_type: listingType, page: 1 }),
    select: (page) => page.meta?.total,
  });
}

/** Header counts. There is no counts endpoint, so read `meta.total` of each
 * type's first page. */
export function useCatalogueCounts() {
  const products = useTotal("product");
  const food = useTotal("food");
  return {
    products: products.data,
    food: food.data,
    refetch: () => Promise.all([products.refetch(), food.refetch()]),
  };
}

/** Category tree flattened for the picker. */
export function useProductCategories() {
  return useQuery({
    queryKey: QUERY_KEYS.seller.products.categories,
    queryFn: SellerProductService.categories,
    staleTime: 1000 * 60 * 30,
    select: flattenCategories,
  });
}

function isInfinite(data: unknown): data is InfiniteData<SellerProductsPage> {
  return Boolean(
    data &&
    typeof data === "object" &&
    "pages" in data &&
    Array.isArray((data as { pages: unknown }).pages),
  );
}

function isPage(data: unknown): data is SellerProductsPage {
  return Boolean(
    data &&
    typeof data === "object" &&
    "data" in data &&
    Array.isArray((data as { data: unknown }).data),
  );
}

function patchStatus(
  page: SellerProductsPage,
  { id, status }: ChangeStatusInput,
): SellerProductsPage {
  return {
    ...page,
    data: page.data.map((product) =>
      product.id === id ? { ...product, status } : product,
    ),
  };
}

/** Applies the new Published state to every cached list/count page. */
function patchCache(old: unknown, input: ChangeStatusInput): unknown {
  if (isInfinite(old)) {
    return { ...old, pages: old.pages.map((page) => patchStatus(page, input)) };
  }
  if (isPage(old)) return patchStatus(old, input);
  return old;
}

/** Published switch with optimistic update and rollback. */
export function useChangeProductStatus() {
  const queryClient = useQueryClient();
  const listKey = QUERY_KEYS.seller.products.all;

  return useMutation({
    mutationFn: SellerProductService.changeStatus,
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: listKey });
      const previous = queryClient.getQueriesData<unknown>({
        queryKey: listKey,
      });
      queryClient.setQueriesData<unknown>(
        { queryKey: listKey },
        (old: unknown) => patchCache(old, input),
      );
      return { previous };
    },
    onError: (error, _input, context) => {
      context?.previous.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      reportError(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: listKey }),
  });
}

/**
 * Creates a product or food item. Validation (422) errors are left for the
 * form to map onto its fields; everything else is reported here.
 */
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: SellerProductService.create,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.seller.products.all,
      }),
    onError: (error) => {
      if (getValidationErrors(error)) return;
      reportError(error);
    },
  });
}
