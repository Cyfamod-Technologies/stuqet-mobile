import type { DemoAddress, DemoPersona } from "../types";
import type { CustomerImageKey } from "../images";

interface Profile {
  name: string;
  email: string;
  phone: string;
  school: string;
  avatar: CustomerImageKey | null;
  interests: number[];
  riderStatus: "none" | "pending" | "approved";
  favouriteVendors: number[];
  favouriteDishes: number[];
}

export const ACCOUNT_PROFILES: Record<DemoPersona, Profile> = {
  customer: {
    name: "Ada Okafor",
    email: "ada@student.edu",
    phone: "08031234567",
    school: "Riverside University",
    avatar: "people/ada",
    interests: [1, 2],
    riderStatus: "none",
    favouriteVendors: [3],
    favouriteDishes: [],
  },
  newbie: {
    name: "Chidi Eze",
    email: "chidi@student.edu",
    phone: "08052345678",
    school: "Riverside University",
    avatar: null,
    interests: [],
    riderStatus: "none",
    favouriteVendors: [],
    favouriteDishes: [],
  },
  rider: {
    name: "Tunde Adeyemi",
    email: "tunde@rider.stuqet.com",
    phone: "08011112222",
    school: "Riverside University",
    avatar: "people/tunde",
    interests: [],
    riderStatus: "approved",
    favouriteVendors: [],
    favouriteDishes: [],
  },
  riderReview: {
    name: "Sade Bello",
    email: "sade@rider.stuqet.com",
    phone: "08074567890",
    school: "Riverside University",
    avatar: "people/fatima",
    interests: [],
    riderStatus: "pending",
    favouriteVendors: [],
    favouriteDishes: [],
  },
};

export function buildAddresses(persona: DemoPersona): DemoAddress[] {
  if (persona !== "customer") return [];
  return [
    {
      id: 71,
      label: "Hostel, Room 4",
      address: "12 Hostel Road, Akoka, Lagos",
      phone: "0803 123 4567",
      isDefault: true,
      stateId: 1,
      cityId: 11,
      areaId: 111,
    },
    {
      id: 72,
      label: "Library",
      address: "Main campus, Riverside University",
      phone: "0803 123 4567",
      isDefault: false,
      stateId: 1,
      cityId: 11,
      areaId: 112,
    },
  ];
}
