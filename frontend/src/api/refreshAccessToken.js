import { API_BASE } from "./config";

export async function fetchWithRefresh(url, options = {}) {
  options = { ...options, credentials: "include" }; // include cookies now no matter what
  const savedBody = options.body;
  const fullUrl = `${API_BASE}${url}`;

  // console.log("Making request to:", fullUrl);

  let response = await fetch(fullUrl, options);

  // Only retry on 401 (unauthorized)
  if (response.status === 401) {
    console.log("Access token expired. Attempting refresh...");

    try {
      const refreshRes = await fetch(`${API_BASE}/users/refresh-token`, {
        method: "POST",
        credentials: "include",
      });

      // If refresh fails, don't retry — let caller handle redirect to login
      if (!refreshRes.ok) {
        console.error(`Refresh failed: ${refreshRes.status}`);
        throw new Error(`Refresh failed: ${refreshRes.status}`);
      }      

      console.log("Token refreshed successfully");

      // add to localstorage for socket
      const data = refreshRes.json()      
      if(data.accessToken) {
        localStorage.removeItem("accessToken");
        localStorage.setItem("accessToken", data.accessToken);
      }

      // Retry original request with fresh token
      options.body = savedBody;
      response = await fetch(fullUrl, options);
    } catch (err) {
      console.error("Token refresh error:", err);
      throw err;
    }
  }

  return response;
}
