import { customerImage, type CustomerImageKey } from "./images";

export interface DemoPicked {
  uri: string;
  name: string;
  mimeType: string;
}

const PHOTOS: CustomerImageKey[] = [
  "people/ada",
  "people/tunde",
  "people/grace",
  "people/chidi",
];
const DOCUMENTS: Record<string, CustomerImageKey> = {
  government_id: "rider/national-id",
  drivers_licence: "rider/drivers-licence",
  id_photo: "rider/id-selfie",
};

let cursor = 0;

/** What the camera or library "returns" in demo mode: the next bundled photo. */
export function pickDemoPhoto(): DemoPicked {
  const key = PHOTOS[cursor++ % PHOTOS.length];
  return {
    uri: customerImage(key),
    name: `${key.split("/")[1]}.jpg`,
    mimeType: "image/jpeg",
  };
}

/** A sample picture of the document the rider is uploading. */
export function pickDemoDocument(documentKey: string): DemoPicked {
  const key = DOCUMENTS[documentKey] ?? "rider/national-id";
  return {
    uri: customerImage(key),
    name: `${key.split("/")[1]}.jpg`,
    mimeType: "image/jpeg",
  };
}
