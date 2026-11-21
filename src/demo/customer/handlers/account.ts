import { demoControl } from "~/demo/control";
import { agoShort } from "../format";
import { customerImage } from "../images";
import {
  DEMO_ACCOUNTS,
  DEMO_CODE,
  DEMO_PASSWORD,
  findAccount,
} from "../data/accounts";
import { AREAS, CITIES, SCHOOLS, STATES } from "../data/places";
import { vendorById } from "../data/vendors";
import { getCustomerDb } from "../db";
import { getRiderDb } from "~/demo/rider/db";
import {
  asNumber,
  asString,
  fail,
  message,
  ok,
  on,
  paginate,
  refuse,
  tokenFor,
  type DemoRequest,
} from "../router";
import type { DemoAccount, DemoPersona } from "../types";

/** Accounts created by the sign-up flow in this session. */
const registered: DemoAccount[] = [];

function accountFor(identifier: string): DemoAccount | undefined {
  const value = identifier.trim().toLowerCase();
  return (
    findAccount(identifier) ??
    registered.find(
      (a) =>
        a.email === value ||
        a.phone.endsWith(value.replace(/\D/g, "").slice(-10)),
    )
  );
}

const me = (request: DemoRequest) =>
  getCustomerDb(request.persona as DemoPersona);

function userRow(persona: DemoPersona) {
  const db = getCustomerDb(persona);
  const account = DEMO_ACCOUNTS.find((a) => a.persona === persona);
  return {
    id: account?.userId ?? 5100,
    type: account?.type ?? "customer",
    name: db.name,
    email: db.email,
    avatar: db.avatar,
    phone: db.phone,
    email_verified: true,
  };
}

// --- Auth ------------------------------------------------------------------

on(
  "POST",
  /^\/auth\/login$/,
  ({ body }) => {
    const account = accountFor(asString(body.email));
    if (!account) return fail(401, "User not found");
    // The app tries "customer" first, then "delivery_boy": an account only
    // answers to its own type, like the real API.
    const type = asString(body.user_type);
    if (type && type !== account.type) return fail(401, "User not found");
    if (asString(body.password) !== account.password)
      return fail(401, "Unauthorized");
    demoControl.sessionExpired = false;
    return ok({
      result: true,
      message: "Successfully logged in",
      access_token: tokenFor(account.persona),
      token_type: "Bearer",
      user: userRow(account.persona),
    });
  },
  true,
);

// TODO(backend): sign-up verifies the email or phone BEFORE the account exists
// (approved design). The real routes (`auth/resend_code`, `auth/confirm_code`)
// need a signed-in user, so these two are the proposed pre-signup pair.
on(
  "POST",
  /^\/auth\/verify-contact\/send$/,
  ({ body }) => {
    const value = asString(body.value).trim();
    if (!value) return refuse("Enter your email or phone number first");
    if (accountFor(value))
      return refuse("An account already uses this contact");
    return message("Verification code sent");
  },
  true,
);

on(
  "POST",
  /^\/auth\/verify-contact\/confirm$/,
  ({ body }) =>
    asString(body.code) === DEMO_CODE
      ? message("Verified")
      : refuse("That code is not right. Check it or ask for a new one."),
  true,
);

on(
  "POST",
  /^\/auth\/signup$/,
  ({ body }) => {
    const email = asString(body.email_or_phone).trim().toLowerCase();
    const isPhone = asString(body.register_by) === "phone";
    if (accountFor(email))
      return refuse("An account already uses this contact");
    const account: DemoAccount = {
      persona: "newbie",
      label: "New",
      hint: "",
      email: isPhone ? "" : email,
      phone: isPhone ? email : "",
      password: asString(body.password) || DEMO_PASSWORD,
      userId: 5100 + registered.length,
      name: asString(body.name) || "New student",
      type: "customer",
    };
    registered.push(account);
    const db = getCustomerDb("newbie");
    db.name = account.name;
    db.email = account.email || db.email;
    db.phone = account.phone || db.phone;
    return ok({
      result: true,
      message: "Registration successful",
      access_token: tokenFor("newbie"),
      user: userRow("newbie"),
    });
  },
  true,
);

on("GET", /^\/auth\/user$/, (request) =>
  ok(userRow(request.persona as DemoPersona)),
);
on("GET", /^\/auth\/logout$/, () => message("Successfully logged out"));
on("GET", /^\/auth\/account-deletion$/, () =>
  message("Your account has been deleted"),
);

on(
  "POST",
  /^\/auth\/password\/forget_request$/,
  ({ body }) => {
    if (!accountFor(asString(body.email_or_phone))) {
      return fail(404, "User is not found");
    }
    return message("A code has been sent");
  },
  true,
);

on(
  "POST",
  /^\/auth\/password\/resend_code$/,
  () => message("A code has been sent"),
  true,
);

on(
  "POST",
  /^\/auth\/password\/confirm_reset$/,
  ({ body }) =>
    asString(body.verification_code) === DEMO_CODE
      ? message("Your password has been reset")
      : refuse("No user is found"),
  true,
);

// --- Schools and places -----------------------------------------------------

on(
  "GET",
  /^\/schools$/,
  ({ query }) => {
    const search = asString(query.search).trim().toLowerCase();
    const rows = SCHOOLS.filter((s) =>
      s.name.toLowerCase().includes(search),
    ).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.name.toLowerCase().replace(/[^a-z]+/g, "-"),
      logo_id: null,
      logo_url: null,
    }));
    return ok(paginate(rows, query, asNumber(query.per_page) || 20));
  },
  true,
);

on("GET", /^\/states$/, () => ok({ data: STATES }), true);
on(
  "GET",
  /^\/cities-by-state\/(\d+)$/,
  (_r, [id]) => ok({ data: CITIES.filter((c) => c.stateId === Number(id)) }),
  true,
);
on(
  "GET",
  /^\/areas-by-city\/(\d+)$/,
  (_r, [id]) => ok({ data: AREAS.filter((a) => a.cityId === Number(id)) }),
  true,
);

// --- Profile ----------------------------------------------------------------

// TODO(backend): GET/POST /food/profile (school, food interests, rider
// status). `profile/update` exists but has no school or interests.
on("GET", /^\/food\/profile$/, (request) => {
  const db = me(request);
  return ok({
    id: userRow(request.persona as DemoPersona).id,
    name: db.name,
    email: db.email,
    phone: db.phone,
    school: db.school,
    avatar: db.avatar,
    interests: db.interests,
    riderStatus: db.riderStatus,
  });
});

on("POST", /^\/food\/profile$/, (request) => {
  const db = me(request);
  const { body } = request;
  if (typeof body.school === "string" && body.school) db.school = body.school;
  if (Array.isArray(body.interests)) db.interests = body.interests.map(Number);
  if (typeof body.name === "string" && body.name) db.name = body.name;
  return message("Profile updated");
});

// --- Addresses (real routes: user/shipping/*) --------------------------------

function addressRow(
  db: ReturnType<typeof me>,
  a: (typeof db.addresses)[number],
) {
  const state = STATES.find((s) => s.id === a.stateId)?.name ?? "";
  const city = CITIES.find((c) => c.id === a.cityId)?.name ?? "";
  const area = AREAS.find((x) => x.id === a.areaId)?.name ?? null;
  return {
    id: a.id,
    label: a.label,
    address: a.address,
    phone: a.phone,
    set_default: a.isDefault ? 1 : 0,
    state_id: a.stateId,
    city_id: a.cityId,
    area_id: a.areaId,
    state_name: state,
    city_name: city,
    area_name: area,
  };
}

on("GET", /^\/user\/shipping\/address$/, (request) => {
  const db = me(request);
  return ok({
    data: db.addresses.map((a) => addressRow(db, a)),
    success: true,
    status: 200,
  });
});

on("POST", /^\/user\/shipping\/create$/, (request) => {
  const db = me(request);
  const { body } = request;
  const id = db.next.address++;
  const makeDefault = db.addresses.length === 0 || Boolean(body.set_default);
  if (makeDefault) db.addresses.forEach((a) => (a.isDefault = false));
  db.addresses.push({
    id,
    label: asString(body.label) || asString(body.address).split(",")[0],
    address: asString(body.address),
    phone: asString(body.phone),
    isDefault: makeDefault,
    stateId: asNumber(body.state_id),
    cityId: asNumber(body.city_id),
    areaId: body.area_id ? asNumber(body.area_id) : null,
  });
  return ok({
    result: true,
    message: "Shipping information has been added successfully",
    id,
  });
});

on("POST", /^\/user\/shipping\/update$/, (request) => {
  const db = me(request);
  const { body } = request;
  const target = db.addresses.find((a) => a.id === asNumber(body.id));
  if (!target) return fail(404, "Address not found");
  target.label = asString(body.label) || target.label;
  target.address = asString(body.address) || target.address;
  target.phone = asString(body.phone) || target.phone;
  target.stateId = asNumber(body.state_id) || target.stateId;
  target.cityId = asNumber(body.city_id) || target.cityId;
  target.areaId = body.area_id ? asNumber(body.area_id) : null;
  return message("Shipping information has been updated successfully");
});

on("POST", /^\/user\/shipping\/make_default$/, (request) => {
  const db = me(request);
  const id = asNumber(request.body.id);
  db.addresses.forEach((a) => (a.isDefault = a.id === id));
  return message("Default shipping information has been updated");
});

on("GET", /^\/user\/shipping\/delete\/(\d+)$/, (request, [id]) => {
  const db = me(request);
  const removed = db.addresses.find((a) => a.id === Number(id));
  db.addresses = db.addresses.filter((a) => a.id !== Number(id));
  if (removed?.isDefault && db.addresses[0]) db.addresses[0].isDefault = true;
  return message("Shipping information has been deleted");
});

// --- Notifications -----------------------------------------------------------

// TODO(backend): `all-notification` exists but sends order-text templates; the
// customer app needs a title, a body and the order id.
on("GET", /^\/food\/notifications$/, (request) => {
  const db = me(request);
  const now = new Date();
  return ok({
    data: db.notifications
      .slice()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((n) => ({
        id: n.id,
        title: n.title,
        body: n.body,
        ago: agoShort(now, n.createdAt),
        unread: n.unread,
        kind: n.kind,
        orderId: n.orderId,
        vendorLogo: n.vendorId ? vendorLogoOf(n.vendorId) : null,
      })),
  });
});

function vendorLogoOf(vendorId: number): string | null {
  const logo = vendorById(vendorId)?.logo;
  return logo ? customerImage(logo) : null;
}

on("POST", /^\/food\/notifications\/read$/, (request) => {
  me(request).notifications.forEach((n) => (n.unread = false));
  return message("Marked as read");
});

// --- Rider application (customer side: "Become a rider") -----------------------

export function markRiderApplied(persona: DemoPersona) {
  getCustomerDb(persona).riderStatus = "pending";
  getRiderDb(persona);
}
