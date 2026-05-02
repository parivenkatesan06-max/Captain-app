/**
 * We can use the following function to inject the JWT token through an interceptor
 * We get the `accessToken` from the localStorage that we set when we authenticate
 * @param {AxiosRequestConfig} config
 * @returns {AxiosRequestConfig}
 */

import EndPoints from "../EndPoints"

const InjectToken = async (config) => {
    try {
        const mergeConfig = { ...config }

        // Skip adding the Authorization header for refresh token requests
        if (!config.url.includes(EndPoints.refreshToken)) {
            const accessTokenInfo = sessionStorage.getItem("accessToken")
            if (mergeConfig?.headers) {
                mergeConfig.headers.Authorization = `Bearer ${accessTokenInfo}`
            }
        }

        return mergeConfig
    } catch (error) {
        throw new Error()
    }
}


export default InjectToken
