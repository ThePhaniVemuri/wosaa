import { API_BASE } from "./config.js";

export async function loginUser(credentials) {
    const res = await fetch(`${API_BASE}/users/login`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
    });

    const text = await res.text();
    if (!res.ok) {
        let msg = text;
        try { msg = JSON.parse(text).message || text } catch (e) {}
        throw new Error(msg || "Failed to login");
    }
    return JSON.parse(text);
}