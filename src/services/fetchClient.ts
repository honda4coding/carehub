import Cookies from "js-cookie";
import { AUTH_COOKIE_NAME, ROLE_COOKIE_NAME } from "@/constants/auth";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
    throw new Error(error.message || "Request failed");
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
      headers,
    };

    let url = `${BASE_URL}${endpoint}`;
    if (options.params) {
      const searchParams = new URLSearchParams(options.params);
      url += `?${searchParams.toString()}`;
    }

    const response = await fetch(url, config);
    return handleResponse(response);
  },

  get: (endpoint: string, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "GET" }),
    
  post: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "POST", body: JSON.stringify(body) }),
    
  put: (endpoint: string, body: any, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "PUT", body: JSON.stringify(body) }),
    
  delete: (endpoint: string, options?: FetchOptions) => 
    fetchClient.request(endpoint, { ...options, method: "DELETE" }),
};
