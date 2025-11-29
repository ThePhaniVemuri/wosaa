import { API_BASE } from "./config.js";

export async function logoutUser() {
  try {
    const res = await fetch(`${API_BASE}/users/logout`, {
      method: 'POST',
      credentials: 'include', // this sends cookies
    });

    if (!res.ok) throw new Error("Failed to logout");
    const data = await res.json();

    // clear local data
    localStorage.removeItem("userObject");
    localStorage.removeItem("accessToken");

    return data;
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
