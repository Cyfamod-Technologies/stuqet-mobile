export const SCHOOLS = [
  "Riverside University",
  "Lakeside Polytechnic",
  "Northgate College",
  "St. Mary's Institute",
  "State University",
  "City Polytechnic",
  "Northfield College",
  "Lakeside University",
  "Hillcrest University",
  "Eastgate Institute",
  "Greenfield College",
  "Harbour Polytechnic",
].map((name, index) => ({ id: index + 1, name }));

export const STATES = [
  { id: 1, name: "Lagos" },
  { id: 2, name: "Oyo" },
  { id: 3, name: "Ogun" },
];

export const CITIES = [
  { id: 11, stateId: 1, name: "Akoka" },
  { id: 12, stateId: 1, name: "Yaba" },
  { id: 13, stateId: 1, name: "Surulere" },
  { id: 21, stateId: 2, name: "Ibadan" },
  { id: 31, stateId: 3, name: "Abeokuta" },
];

export const AREAS = [
  { id: 111, cityId: 11, name: "Hostel Road" },
  { id: 112, cityId: 11, name: "Main campus" },
  { id: 113, cityId: 11, name: "Library quarters" },
  { id: 121, cityId: 12, name: "Herbert Macaulay Way" },
  { id: 122, cityId: 12, name: "Sabo" },
  { id: 131, cityId: 13, name: "Adeniran Ogunsanya" },
];

/** Rider areas ("Area you cover" sheet). */
export const RIDER_AREAS = [
  "Hostels and campus",
  "Off-campus housing",
  "Whole school area",
  "Shops and markets nearby",
];

export const BANKS = [
  { code: "044", name: "Access Bank" },
  { code: "011", name: "First Bank" },
  { code: "058", name: "GTBank" },
  { code: "033", name: "UBA" },
  { code: "057", name: "Zenith Bank" },
  { code: "999992", name: "Opay" },
  { code: "50211", name: "Kuda" },
  { code: "50515", name: "Moniepoint" },
];

export const FOOD_CATEGORIES = [
  { id: 1, name: "Rice and stews" },
  { id: 2, name: "Snacks" },
  { id: 3, name: "Drinks" },
  { id: 4, name: "Bakery" },
  { id: 5, name: "Fast food" },
  { id: 6, name: "Healthy" },
];

export const COUPONS = [
  { code: "WELCOME10", percent: 10, cap: 500 },
  { code: "CAMPUS20", percent: 20, cap: 800 },
];

/** Searches suggested before the user types anything. */
export const TRENDING_SEARCHES = [
  "Jollof rice",
  "Suya",
  "Shawarma",
  "Zobo",
  "Meat pie",
  "Burger",
];
