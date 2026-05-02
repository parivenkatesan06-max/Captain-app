const StandardHeaders = {
    Accept: "application/json",
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Credentials": true,
    "X-Requested-With": "XMLHttpRequest",
}
/**
 * Get Config will return object with baseUrl, Headers configured.
 */
const GetConfig = (baseURL, headers) => {
    if (!baseURL) {
        baseURL = process.env.REACT_APP_API_URL
    }
    if (headers) {
        headers = { ...StandardHeaders, ...headers }
    } else {
        headers = StandardHeaders
    }
    return {
        baseURL,
        headers,
    }
}
export default GetConfig
