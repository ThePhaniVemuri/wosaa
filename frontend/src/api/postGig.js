import { API_BASE } from "./config.js";

export async function reviewGig(data) {
    try {
        const res = await fetch(`${API_BASE}/client/review-gig`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resdata = await res.json();
        return resdata;
    } catch (error) {
        console.error("Error reviewing gig frontend:", error);
        return { success: false, error: error.message || "Network error" };
    }
}

export async function postGig(data) {
    try {
        const res = await fetch(`${API_BASE}/client/post-gig`, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const resdata = await res.json();
        return resdata;
    } catch (error) {
        console.error("Error posting gig frontend:", error);
        return { success: false, error: error.message || "Network error" };
    }
}