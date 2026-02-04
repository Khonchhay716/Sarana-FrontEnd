import axios from "axios";

interface Role {
  id: number;
  name: string;
  description: string;
}

interface User {
  userId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  permissions: string[];
  roles: Role[];
}

interface AuthTokenData {
  accessToken: string;
  refreshToken: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  userId: number;
  permissions: string[];
  roles: Role[];
}

interface ApiResponse<T = any> {
  success?: boolean;
  data: T;
  errors?: Record<string, string[]>;
  message?: string;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TIMEOUT = 10 * 60 * 1000;

const AxiosApi = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: { "Content-Type": "application/json" },
});

const AxiosFileApi = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

// Attach access token to requests
AxiosApi.interceptors.request.use((config: any) => {
  const userLibrary = localStorage.getItem("CurrentUserLibrary");
  if (userLibrary) {
    try {
      const parsed = JSON.parse(userLibrary);
      const accessToken = parsed.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error parsing CurrentUserLibrary:", error);
    }
  }
  return config;
});

AxiosFileApi.interceptors.request.use((config: any) => {
  const userLibrary = localStorage.getItem("CurrentUserLibrary");
  if (userLibrary) {
    try {
      const parsed = JSON.parse(userLibrary);
      const accessToken = parsed.accessToken;
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
    } catch (error) {
      console.error("Error parsing CurrentUserLibrary:", error);
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: ((token: string) => void)[] = [];

const processQueue = (token: string | null) => {
  failedQueue.forEach((cb) => cb(token!));
  failedQueue = [];
};

const refreshTokens = async (): Promise<string | null> => {
  const userLibrary = localStorage.getItem("CurrentUserLibrary");
  if (!userLibrary) return null;

  let refreshToken: string;
  try {
    const parsed = JSON.parse(userLibrary);
    refreshToken = parsed.refreshToken;
    if (!refreshToken) return null;
  } catch (error) {
    console.error("Error parsing CurrentUserLibrary:", error);
    return null;
  }

  if (isRefreshing) {
    return new Promise((resolve) => {
      failedQueue.push(resolve);
    });
  }

  try {
    isRefreshing = true;

    const res = await axios.post<ApiResponse<AuthTokenData>>(
      `${BASE_URL}auth/refresh-token`,
      {
        refreshToken,
        ipAddress: "string",
        deviceInfo: "string",
      }
    );

    if (res.data.success && res.data.data) {
      const authData = res.data.data;
      localStorage.setItem("CurrentUserLibrary", JSON.stringify(authData));
      processQueue(authData.accessToken);
      return authData.accessToken;
    }
    processQueue(null);
    return null;
  } catch (err) {
    console.error("Refresh token failed:", err);
    processQueue(null);
    return null;
  } finally {
    isRefreshing = false;
  }
};

// Response interceptors
AxiosApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("refresh by axios normal");
      const newAccessToken = await refreshTokens();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return AxiosApi(originalRequest);
      } else {
        localStorage.removeItem("CurrentUserLibrary");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

AxiosFileApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest: any = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log("refresh by axiosFormFile");
      const newAccessToken = await refreshTokens();
      if (newAccessToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
        return AxiosFileApi(originalRequest);
      } else {
        localStorage.removeItem("CurrentUserLibrary");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { AxiosApi, AxiosFileApi, refreshTokens };
export type { User, AuthTokenData, ApiResponse, Role };