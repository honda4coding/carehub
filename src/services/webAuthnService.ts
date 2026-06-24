import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import { fetchClient } from "./fetchClient";

/**
 * @simplewebauthn/server v10+ returns user.id as a Uint8Array internally.
 * When Node.js serializes it via res.json(), it may become a plain object like
 * {"0": 54, "1": 98, ...} instead of a base64url string.
 * The browser library's base64URLStringToBuffer() calls .replace() and crashes.
 * This helper ensures it's always a proper base64url string.
 */
function toBase64url(value: string | Record<string, number> | Uint8Array | null | undefined): string {
  if (typeof value === "string") return value;
  if (!value) return "";
  const bytes = value instanceof Uint8Array
    ? value
    : new Uint8Array(Object.values(value as Record<string, number>));
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function sanitizeRegistrationOptions(options: any) {
  return {
    ...options,
    user: {
      ...options.user,
      id: toBase64url(options.user?.id),
    },
  };
}

/**
 * Register a new biometric credential (TouchID/FaceID/Windows Hello) for the currently logged-in user
 */
export async function registerBiometrics(): Promise<void> {
  try {
    // 1. Fetch registration options from backend
    const res = await fetchClient.post("/webauthn/register/options", {});
    const options = res.data;

    // 2. Sanitize options: ensure user.id is a base64url string (not a serialized Uint8Array)
    const sanitizedOptions = sanitizeRegistrationOptions(options);

    // 3. Start simplewebauthn browser registration flow
    const credentialResponse = await startRegistration({ optionsJSON: sanitizedOptions });

    // 4. Verify response with backend
    await fetchClient.post("/webauthn/register/verify", { credential: credentialResponse });
    console.log("Biometric credential registered successfully!");
  } catch (error: any) {
    console.error("Biometrics registration error:", error);
    throw new Error(error.message || "Failed to register biometrics.");
  }
}

/**
 * Authenticate/Log in a user using their registered biometric credential (TouchID/FaceID/Windows Hello)
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
