import axios from "axios";
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { getApiErrorMessage } from "@/lib/utils";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const STORAGE_KEYS = {
	USER: "@aprovai:user",
	ACCESS_TOKEN: "@aprovai:access_token",
} as const;

interface FailedRequest {
	resolve: (token: string | null) => void;
	reject: (error: Error) => void;
}

export const apiClient: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

function getTokenExp(token: string): number | null {
	try {
		const payload = JSON.parse(atob(token.split(".")[1]));
		return typeof payload.exp === "number" ? payload.exp : null;
	} catch {
		return null;
	}
}

function isTokenExpiredOrExpiringSoon(token: string): boolean {
	const exp = getTokenExp(token);
	if (!exp) return true;
	return Date.now() / 1000 >= exp - 60;
}

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: Error | null, token: string | null = null) => {
	failedQueue.forEach((prom) => {
		if (error) {
			prom.reject(error);
		} else {
			prom.resolve(token);
		}
	});
	failedQueue = [];
};

async function doRefresh(): Promise<string | null> {
	const refreshResponse = await apiClient.post("/auth/refresh");
	const newToken: string | null = refreshResponse.data?.accessToken ?? null;
	if (newToken) {
		localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newToken);
	}
	return newToken;
}

apiClient.interceptors.request.use(
	async (config: InternalAxiosRequestConfig) => {
		const isRefreshCall = config.url?.includes("/auth/refresh");
		if (isRefreshCall) return config;

		let token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

		if (token && isTokenExpiredOrExpiringSoon(token)) {
			if (!isRefreshing) {
				isRefreshing = true;
				try {
					token = await doRefresh();
					processQueue(null, token);
				} catch (err) {
					processQueue(err as Error, null);
					token = null;
				} finally {
					isRefreshing = false;
				}
			} else {
				token = await new Promise<string | null>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				});
			}
		}

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		if (error.response?.status === 401 && !originalRequest._retry) {
			if (window.location.pathname === "/login") {
				handleUnauthorized();
				return Promise.reject(error);
			}

			if (originalRequest.url?.includes("/auth/refresh")) {
				localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
				localStorage.removeItem(STORAGE_KEYS.USER);
				return Promise.reject(error);
			}

			if (isRefreshing) {
				return new Promise<string | null>((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then(() => {
						return apiClient(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				const refreshResponse = await apiClient.post("/auth/refresh");
				if (refreshResponse.data?.accessToken) {
					localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, refreshResponse.data.accessToken);
				}

				processQueue(null);
				return apiClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error, null);
				handleUnauthorized();
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		const status = error.response?.status ?? 0;
		const message = getApiErrorMessage(error);
		return Promise.reject(new ApiError(status, message));
	}
);

function handleUnauthorized() {
	localStorage.removeItem(STORAGE_KEYS.USER);
	localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
	window.dispatchEvent(new Event("auth:unauthorized"));
}
