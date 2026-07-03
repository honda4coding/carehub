import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/constants/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

async function handleResponse(response: Response) {
  if (!response.ok) {
    if (response.status === 401) {
      Cookies.remove(AUTH_COOKIE_NAME);
      Cookies.remove(ROLE_COOKIE_NAME);
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    
    if (response.status === 403) {
      console.error("Forbidden: You do not have permission to perform this action.");
    }

    const error = await response.json().catch(() => ({ message: "Unknown error" }));
    const finalError = new Error(error.message || "Request failed");
    (finalError as any).status = response.status;
    (finalError as any).data = error.data;
    (finalError as any).error = error.error; // Backend validation array
    throw finalError;
  }
  return response.json();
}

export const fetchClient = {
  async request(endpoint: string, options: FetchOptions = {}) {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    
    const headers = new Headers(options.headers);
    headers.set("Content-Type", "application/json");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const config: RequestInit = {
      ...options,
      credentials: "include",
      headers,
      cache: "no-store",
    };

    let fullUrlString = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
    let urlObj = new URL(fullUrlString);
    
    // Automatically inject active clinic context if present
    let finalParams = options.params ? { ...options.params } : {};
    if (typeof window !== "undefined") {
      const activeClinicId = localStorage.getItem('carehub_active_clinic_id');
      const isPatientRoute = window.location.pathname.startsWith('/patient');
      if (!isPatientRoute && activeClinicId && activeClinicId !== "all" && activeClinicId !== "undefined" && activeClinicId !== "null" && !finalParams.clinicId && !urlObj.searchParams.has('clinicId')) {
        finalParams.clinicId = activeClinicId;
      }
    }

    Object.entries(finalParams).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value as string);
    });

    const finalUrl = urlObj.toString();

    const response = await fetch(finalUrl, config);
    return handleResponse(response);
  },

  get: (endpoint: string, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "GET" }),
    
  post: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    
  put: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    
  patch: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(body) }),

  delete: (endpoint: string, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "DELETE" }),
};