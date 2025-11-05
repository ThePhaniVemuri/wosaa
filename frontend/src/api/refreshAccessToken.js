const API_BASE = "http://localhost:3000/api/v1";

export async function fetchWithRefresh(url, options = {}) {
  options.credentials = "include"; 

  console.log("Making request to:", `${API_BASE}${url}`);
  let response = await fetch(`${API_BASE}${url}`, options);

  // token expired or unauthorized
  if (response.status === 401) {
    console.log("Access token expired. Trying to refresh...");

    try {
        const refreshRes = await fetch(`${API_BASE}/users/refresh-token`, {
            method: "POST",
            credentials: "include", // include cookies
            })

        if (refreshRes.ok) {
            console.log("Token refreshed! Retrying original request...");
            response = await fetch(`${API_BASE}${url}`, options);
            } else {
            console.log("Refresh failed. Redirecting to login...");
            return;
        }
    } 
    catch (error) {
      console.error("Error during token refresh:", error);
      return;
    }
  }

  return response;
}
