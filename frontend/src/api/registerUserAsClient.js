import { API_BASE } from "./config.js";

export async function registerUserAsClient(data) {

    // parse stored user object 
    const raw = localStorage.getItem("userObject");
    let user = null;
    if (raw) {
      try {
        user = JSON.parse(raw);
      } catch (err) {
        console.warn("Failed to parse stored userObject, falling back to null:", raw);
        user = null;
      }
    }

    // console.log("Registering user as client with data:", {user, ...data});

    try{
        const res = await fetch(`${API_BASE}/client/register`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({user, ...data}),
        });

        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }    
    catch(error) {
        console.error("Error registering user as client:", error);
        return { success: false, error: error.message || "Network error" };
    }
}