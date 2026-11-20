import { axiosPrivate } from "~/lib/config/axios";
import type { ShopInfo } from "./types";

const ShopService = {
  getInfo: async (): Promise<ShopInfo> => {
    const { data } = await axiosPrivate.get<{ data: ShopInfo }>(
      "/seller/shop/info",
    );
    return data.data;
  },
};

export default ShopService;
