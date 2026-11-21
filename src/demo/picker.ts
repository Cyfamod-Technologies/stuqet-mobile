import type * as ImagePicker from "expo-image-picker";
import { demoControl } from "./control";
import { demoImage, type DemoImageKey } from "./images";

export type DemoPhotoPurpose = "listing" | "logo" | "banner" | "document";

const POOLS: Record<string, DemoImageKey[]> = {
  product: [
    "products/sneakers",
    "products/backpack",
    "products/speaker",
    "products/hoodie",
    "products/notebooks",
    "products/water-bottle",
    "products/desk-lamp",
    "products/power-bank",
  ],
  food: [
    "food/suya",
    "food/shawarma",
    "food/puff-puff",
    "food/smoothie",
    "food/meat-pie",
    "food/jollof-rice",
  ],
  service: [
    "services/photography",
    "services/printing",
    "services/laundry",
    "services/tailoring",
    "services/tutoring",
    "services/laptop-repair",
  ],
};

const LOGOS: DemoImageKey[] = ["shop/logo", "people/seller", "people/grace"];
const BANNERS: DemoImageKey[] = [
  "shop/banner-1",
  "shop/banner-2",
  "shop/banner-3",
];
const DOCUMENTS: DemoImageKey[] = [
  "documents/student-id",
  "documents/cac-certificate",
];

const cursor: Record<string, number> = {};

/** Photos the next picks return first (a sample queues ones that fit it). */
let queued: DemoImageKey[] = [];

export function queueDemoPhotos(...keys: DemoImageKey[]) {
  queued = [...keys];
}

function next(pool: DemoImageKey[], name: string): DemoImageKey {
  const index = cursor[name] ?? 0;
  cursor[name] = index + 1;
  return pool[index % pool.length];
}

function poolFor(purpose: DemoPhotoPurpose): [DemoImageKey[], string] {
  switch (purpose) {
    case "logo":
      return [LOGOS, "logo"];
    case "banner":
      return [BANNERS, "banner"];
    case "document":
      return [DOCUMENTS, "document"];
    default: {
      const kind =
        demoControl.dataSet === "food" || demoControl.dataSet === "service"
          ? demoControl.dataSet
          : "product";
      return [POOLS[kind], `listing-${kind}`];
    }
  }
}

/**
 * What the library or camera "returns" in demo mode: the next bundled
 * illustration(s). `base64` carries a `demo:<key>` marker that the fake upload
 * endpoint turns back into the bundled image, so nothing real is encoded.
 */
export function pickDemoPhotos(
  count = 1,
  purpose: DemoPhotoPurpose = "listing",
): ImagePicker.ImagePickerAsset[] {
  const [pool, name] = poolFor(purpose);
  return Array.from({ length: Math.max(1, count) }, () => {
    const key =
      purpose === "listing" && queued.length > 0
        ? (queued.shift() as DemoImageKey)
        : next(pool, name);
    return {
      uri: demoImage(key),
      base64: `demo:${key}`,
      fileName: `${key.split("/")[1]}.jpg`,
      mimeType: "image/jpeg",
      width: 640,
      height: 640,
    } as ImagePicker.ImagePickerAsset;
  });
}

const FILES: { key: DemoImageKey; name: string; mimeType: string }[] = [
  {
    key: "documents/cac-certificate.pdf",
    name: "cac-certificate.pdf",
    mimeType: "application/pdf",
  },
  {
    key: "documents/student-id",
    name: "student-id.jpg",
    mimeType: "image/jpeg",
  },
  {
    key: "documents/cac-certificate",
    name: "cac-certificate.jpg",
    mimeType: "image/jpeg",
  },
];

let fileCursor = 0;

/** A file for the document rows (verification form, ID upload). */
export function pickDemoDocument(): {
  uri: string;
  name: string;
  mimeType: string;
} {
  const file = FILES[fileCursor++ % FILES.length];
  return { uri: demoImage(file.key), name: file.name, mimeType: file.mimeType };
}
