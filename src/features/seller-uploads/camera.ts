import { Alert, Linking } from "react-native";
import * as ImagePicker from "expo-image-picker";

/**
 * Makes sure the camera can be used. Asks once when the OS still allows it;
 * when access was refused (or can no longer be asked for) explains how to turn
 * it on and offers a shortcut to the app's settings page.
 */
export async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;

  if (current.canAskAgain) {
    const requested = await ImagePicker.requestCameraPermissionsAsync();
    if (requested.granted) return true;
  }

  Alert.alert(
    "Camera access is off",
    "Allow camera access in your phone settings to take a photo, or choose one from your library instead.",
    [
      { text: "Not now", style: "cancel" },
      { text: "Open settings", onPress: () => void Linking.openSettings() },
    ],
  );
  return false;
}
