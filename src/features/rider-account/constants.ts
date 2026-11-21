import type { VehicleKind } from "./types";

export const VEHICLES: {
  kind: VehicleKind;
  title: string;
  subtitle: string;
  icon: React.ComponentProps<
    typeof import("@expo/vector-icons").Ionicons
  >["name"];
}[] = [
  {
    kind: "motorbike",
    title: "Motorbike",
    subtitle: "Needs a plate number and licence",
    icon: "bicycle",
  },
  {
    kind: "bicycle",
    title: "Bicycle",
    subtitle: "Short trips around campus",
    icon: "bicycle-outline",
  },
  {
    kind: "foot",
    title: "On foot",
    subtitle: "Hostels and nearby shops",
    icon: "walk-outline",
  },
];

export const vehicleTitle = (kind: VehicleKind) =>
  VEHICLES.find((v) => v.kind === kind)?.title ?? "Motorbike";
