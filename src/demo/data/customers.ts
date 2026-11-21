import type { DemoCustomer } from "../types";

/** The buyers who appear in orders and chats. Names follow the design boards. */
export const CUSTOMERS: DemoCustomer[] = [
  {
    id: 9001,
    name: "Ada Okonkwo",
    phone: "0803 123 4567",
    address: "12 Hostel Road, Block C, Room 4, Akoka, Lagos, Nigeria",
    avatar: "people/ada",
  },
  {
    id: 9002,
    name: "Tunde Bakare",
    phone: "0905 321 7788",
    address: "Faculty of Science Annex, University Road, Yaba, Lagos, Nigeria",
    avatar: "people/tunde",
  },
  {
    id: 9003,
    name: "Grace Effiong",
    phone: "0814 556 2200",
    address: "Block D, Moremi Hall, University of Lagos, Akoka, Lagos, Nigeria",
    avatar: "people/grace",
  },
  {
    id: 9004,
    name: "Chidi Nwosu",
    phone: "0701 889 4410",
    address: "7 Ojo Street, Bariga, Lagos, Nigeria",
    avatar: "people/chidi",
  },
  {
    id: 9005,
    name: "Fatima Sani",
    phone: "0816 703 9921",
    address: "Amina Hostel, Room 12, Akoka, Lagos, Nigeria",
    avatar: "people/fatima",
  },
];

export function customerById(id: number): DemoCustomer {
  return CUSTOMERS.find((c) => c.id === id) ?? CUSTOMERS[0];
}
