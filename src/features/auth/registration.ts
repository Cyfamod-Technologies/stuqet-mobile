import * as Linking from "expo-linking";
import { notifyInfo } from "~/lib/utils/toast";
import { resolveWebRegistrationUrl } from "./constants";

/**
 * "Create a shop": the backend has no seller registration API (web only), so
 * open the website's registration flow in the browser. Fails gracefully when
 * no URL is configured or the device cannot open it.
 */
export async function openWebRegistration(): Promise<void> {
  const url = resolveWebRegistrationUrl();
  if (!url) {
    notifyInfo({
      message: "Shop registration is on our website",
      description: "Visit the Stuqet website on your browser to create a shop.",
    });
    return;
  }
  try {
    await Linking.openURL(url);
  } catch {
    notifyInfo({
      message: "Couldn't open the browser",
      description: "Open the Stuqet website to create your shop.",
    });
  }
}
