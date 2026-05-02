import axios from "axios"
import GetConfig from "./GetConfig"
import InjectToken from "./InjectToken"
import EndPoints from "../EndPoints";
import { resetUserInfo } from "../userInfo";
import { ERROR_CODE } from "../constants";

export default class ApiUtil {
    instance = null;
    isRefreshing = false; // Flag to track token refresh process
    failedQueue = []; // Queue to store failed requests during token refresh

    /**
     * Constructor - optional baseURL, headers, and a flag to skip authentication.
     * @param {string} baseURL
     * @param {Record<string, string | boolean>} headers
     * @param {boolean} skipAuth - If true, skip authentication interceptors
     */
    constructor(baseURL, headers, skipAuth = false) {
        this.initHttp(baseURL, headers, skipAuth);
    }

    /**
     * initHttp - Create axios instance and optionally inject JWT token in request interceptor.
     * @param {string} baseURL
     * @param {Record<string, string | boolean>} headers
     * @param {boolean} skipAuth - If true, skip authentication interceptors
     */
    /* istanbul ignore next */
    initHttp(baseURL, headers, skipAuth) {
        const http = axios.create(GetConfig(baseURL, headers));

        // Apply authentication interceptors only if skipAuth is false
        if (!skipAuth) {
            http.interceptors.request.use(InjectToken, (error) =>
                Promise.reject(error)
            )
            
            http.interceptors.response.use(
                (response) => response,
                // eslint-disable-next-line complexity
                async (error) => {
                    const { response } = error;

                    // Handle 401 Unauthorized errors
                    if (response && response.data.status === 401 && response?.data?.errors[0].code === ERROR_CODE.INVALID_TOKEN) {
                    // If no refresh is in progress, initiate token refresh
                        if (!this.isRefreshing) {
                            this.isRefreshing = true;

                            const refreshToken = sessionStorage.getItem("refreshToken");
                            const storedExpiryTime = sessionStorage.getItem("refresh_token_expiry");
                            const currentTime = new Date().getTime() ;
                            // Check if the refresh token is expired (90 days)
                            if (currentTime > storedExpiryTime) {
                                const accessToken = sessionStorage.getItem("accessToken");
                                // Token expired, perform logout
                                http.post(EndPoints.logout, { token: accessToken })
                                resetUserInfo()
                                sessionStorage.removeItem("refresh_token_expiry");
                                window.location.href = "/login";
                                return Promise.reject(error);
                            }

                            try {
                            // Request a new access token using the refresh token
                                const refreshResponse = await http.post(EndPoints.refreshToken, {}, {
                                    headers: {
                                        Authorization: `Bearer ${refreshToken}`,
                                    },
                                });

                                const newAccessToken = refreshResponse?.data?.data?.accessToken;
                                if (newAccessToken) {
                                    sessionStorage.setItem("accessToken", newAccessToken);

                                    // Retry all failed requests with the new token
                                    this.failedQueue.forEach((request) => {
                                        request.retry(newAccessToken);
                                    });

                                    this.failedQueue = []; // Clear the queue after retrying
                                } else {
                                    console.error("Failed to retrieve a new access token.");
                                }

                                // Retry the original request with the new token
                                return http(error.config);
                            } catch (err) {
                                console.error("Token refresh failed", err);
                                return Promise.reject(error);
                            } finally {
                                this.isRefreshing = false; // Reset the flag
                            }
                        }

                        // If a refresh is already in progress, add the request to the failed queue
                        return new Promise((resolve) => {
                            this.failedQueue.push({
                                retry: (newAccessToken) => {
                                // Retry the original request with the new access token
                                    error.config.headers["Authorization"] = `Bearer ${newAccessToken}`;
                                    resolve(http(error.config)); // Retry the original request
                                },
                            });
                        });
                    }

                    // For other errors, just reject the promise
                    return Promise.reject(error);
                }
            );
        }
        this.instance = http;
    }

    async get(url, config) {
        return this.instance?.get(url, config)
    }

    async post(url, data, config) {
        return this.instance?.post(url, data, config)
    }

    async put(url, data, config) {
        return this.instance?.put(url, data, config);
    }

    async delete(url, config) {
        return this.instance?.delete(url, config);
    }

    async patch(url, config) {
        return this.instance?.patch(url, config);
    }
}
