import axios, { AxiosRequestConfig } from "axios";
import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/constants/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type FetchOptions = Omit<AxiosRequestConfig, "headers"> & {
  params?: Record<string, string>;
  skipClinicContext?: boolean;
  headers?: Record<string, string>;
  body?: any; // For backwards compatibility with fetch
};

export const fetchClient = {
  async request(endpoint: string, options: FetchOptions = {}) {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    
    const headers: Record<string, string> = { ...options.headers };
    const data = options.data || options.body;
    
    if (!(data instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    let fullUrlString = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
    let urlObj = new URL(fullUrlString);
    
    // Automatically inject active clinic context if present
    let finalParams = options.params ? { ...options.params } : {};
    if (typeof window !== "undefined") {
      const activeClinicId = localStorage.getItem('carehub_active_clinic_id');
      const isPatientRoute = window.location.pathname.startsWith('/patient');
      if (!options.skipClinicContext && !isPatientRoute && activeClinicId && activeClinicId !== "all" && activeClinicId !== "undefined" && activeClinicId !== "null" && !finalParams.clinicId && !urlObj.searchParams.has('clinicId')) {
        finalParams.clinicId = activeClinicId;
      }
    }

    Object.entries(finalParams).forEach(([key, value]) => {
      urlObj.searchParams.append(key, value as string);
    });

    const finalUrl = urlObj.toString();

    try {
      const response = await axios({
        url: finalUrl,
        method: options.method || "GET",
        data,
        headers,
        withCredentials: true,
      });
      return response.data;
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response) {
        const { status, data: errData } = err.response;
        if (status === 401) {
          Cookies.remove(AUTH_COOKIE_NAME);
          Cookies.remove(ROLE_COOKIE_NAME);
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        
        if (status === 403) {
          console.error("Forbidden: You do not have permission to perform this action.");
        }

        let errorMessage = errData?.message || "Request failed";
        if (errData?.error && Array.isArray(errData.error)) {
          errorMessage = errData.error.map((e: any) => e.message).join(", ");
        }

        const finalError = new Error(errorMessage);
        (finalError as any).status = status;
        (finalError as any).data = errData?.data;
        (finalError as any).error = errData?.error; // Backend validation array
        throw finalError;
      }
      throw err;
    }
  },

  get: (endpoint: string, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "GET" }),
    
  post: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "POST", data: body }),
    
  put: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "PUT", data: body }),
    
  patch: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "PATCH", data: body }),

  delete: (endpoint: string, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "DELETE" }),
};