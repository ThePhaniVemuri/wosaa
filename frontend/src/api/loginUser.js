import { API_BASE } from "./config.js";

export async function loginUser(credentials) {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });
      
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Failed to login");
    }

    localStorage.setItem("accessToken", data.accessToken);
    return data;
}
