import { API_BASE } from "./config.js";

export async function postGig(data) {
    try{
        const res = await fetch(`${API_BASE}/client/post-gig`, {
            method: 'POST',
            credentials: 'include' ,
            headers: { 
                'Content-Type': 'application/json',                
            },
            body: JSON.stringify(data)
        })

        // Check if response is ok before trying to parse JSON
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Server returned ${res.status}: ${text}`);
        }

        const resdata = await res.json();
        return resdata; 
    }
    catch(error) {
        console.error("Error posting gig frontend:", error);
        return { success: false, error: error.message || "Network error" };
    }
}