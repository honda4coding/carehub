import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { fetchClient } from "./fetchClient";

/**
 * Register a new biometric credential (TouchID/FaceID) for the currently logged-in user
 */
export async function registerBiometrics(): Promise<void> {
  try {
    // 1. Fetch registration options from backend
    const res = await fetchClient.post("/webauthn/register/options", {});
    const options = res.data;

    // 2. Start simplewebauthn browser registration flow
    const credentialResponse = await startRegistration({ optionsJSON: options });

    // 3. Verify response with backend
    await fetchClient.post("/webauthn/register/verify", { credential: credentialResponse });
    console.log("Biometric credential registered successfully!");
  } catch (error: any) {
    console.error("Biometrics registration error:", error);
    throw new Error(error.message || "Failed to register biometrics.");
  }
}

/**
 * Authenticate/Log in a user using their registered biometric credential (TouchID/FaceID)
 * @param email User's email address
 * @returns Object containing user details and tokens (same as standard login)
 */
export async function authenticateBiometrics(email: string): Promise<any> {
  try {
    // 1. Fetch authentication options from backend
    const res = await fetchClient.post("/webauthn/login/options", { email });
    const options = res.data;

    // 2. Start simplewebauthn browser authentication flow
    const credentialResponse = await startAuthentication({ optionsJSON: options });

    // 3. Verify response with backend to complete login
    const loginResult = await fetchClient.post("/webauthn/login/verify", {
      email,
      credential: credentialResponse,
    });

    console.log("Biometrics authenticated successfully!");
    return loginResult; // Returns token, role, etc.
  } catch (error: any) {
    console.error("Biometrics authentication error:", error);
    throw new Error(error.message || "Biometrics login failed.");
  }
}

/**
 * Check if the currently logged-in user has registered biometric credentials
 */
export async function checkBiometricsStatus(): Promise<boolean> {
  try {
    const res = await fetchClient.get("/webauthn/status");
    return !!res?.data?.hasBiometrics;
  } catch (error) {
    console.error("Failed to fetch biometrics status:", error);
    return false;
  }
}

/**
 * Disable/remove biometric authentication for the current user
 */
export async function disableBiometrics(): Promise<void> {
  try {
    await fetchClient.delete("/webauthn/remove");
    console.log("Biometric credentials removed successfully.");
  } catch (error: any) {
    console.error("Failed to remove biometrics:", error);
    throw new Error(error.message || "Failed to disable biometrics.");
  }
}
