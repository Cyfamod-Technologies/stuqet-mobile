import { axiosInstance, axiosPrivate } from "~/lib/config/axios";
import type {
  AddressInput,
  AddressView,
  Option,
} from "~/features/customer-cart/types";
import type { ProfileView, SchoolView } from "./types";

// Endpoints are relative to /api/v2. Routes that exist in the backend are
// named in each comment; the rest are marked TODO(backend).

interface RawAddress {
  id: number;
  label?: string | null;
  address: string;
  phone: string;
  set_default: number;
  state_id: number;
  city_id: number;
  area_id: number | null;
  area_name?: string | null;
  city_name?: string | null;
}

function toAddress(raw: RawAddress): AddressView {
  return {
    id: raw.id,
    // The backend has no label column; fall back to the first line of the address.
    label: raw.label || raw.address.split(",")[0],
    address: raw.address,
    phone: raw.phone,
    isDefault: raw.set_default === 1,
    stateId: raw.state_id,
    cityId: raw.city_id,
    areaId: raw.area_id,
  };
}

const AccountService = {
  // GET /schools (SchoolController::index): `search`, `page`, `per_page`.
  schools: async (search: string): Promise<SchoolView[]> => {
    const { data } = await axiosInstance.get<{
      data: { id: number; name: string; logo_url: string | null }[];
    }>("/schools", { params: { search, per_page: 50 } });
    return data.data.map((s) => ({
      id: s.id,
      name: s.name,
      logoUrl: s.logo_url,
    }));
  },

  // GET /states, /cities-by-state/{id}, /areas-by-city/{id}.
  states: async (): Promise<Option[]> =>
    (await axiosInstance.get<{ data: Option[] }>("/states")).data.data,
  cities: async (stateId: number): Promise<Option[]> =>
    (await axiosInstance.get<{ data: Option[] }>(`/cities-by-state/${stateId}`))
      .data.data,
  areas: async (cityId: number): Promise<Option[]> =>
    (await axiosInstance.get<{ data: Option[] }>(`/areas-by-city/${cityId}`))
      .data.data,

  // TODO(backend): GET /food/profile. `auth/user` has no school, food
  // interests or rider status.
  profile: async (): Promise<ProfileView> =>
    (await axiosPrivate.get<ProfileView>("/food/profile")).data,

  // TODO(backend): POST /food/profile (school, interests). `profile/update`
  // only takes name, phone and password.
  saveProfile: async (input: {
    school?: string;
    interests?: number[];
    name?: string;
  }): Promise<void> => {
    await axiosPrivate.post("/food/profile", input);
  },

  // GET /user/shipping/address (AddressController::addresses).
  addresses: async (): Promise<AddressView[]> => {
    const { data } = await axiosPrivate.get<{ data: RawAddress[] }>(
      "/user/shipping/address",
    );
    return data.data.map(toAddress);
  },

  // POST /user/shipping/create and /user/shipping/update.
  saveAddress: async (input: AddressInput & { id?: number }): Promise<void> => {
    await axiosPrivate.post(
      input.id ? "/user/shipping/update" : "/user/shipping/create",
      {
        id: input.id,
        label: input.label,
        address: input.address,
        state_id: input.stateId,
        city_id: input.cityId,
        area_id: input.areaId,
        phone: input.phone,
        set_default: input.makeDefault ? 1 : 0,
      },
    );
  },

  // POST /user/shipping/make_default, GET /user/shipping/delete/{id}.
  makeDefault: async (id: number): Promise<void> => {
    await axiosPrivate.post("/user/shipping/make_default", { id });
  },
  deleteAddress: async (id: number): Promise<void> => {
    await axiosPrivate.get(`/user/shipping/delete/${id}`);
  },
};

export default AccountService;
