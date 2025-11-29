import { API_BASE } from "./config.js";

export async function registerUser(data) {
    try{
        const res = await fetch(`${API_BASE}/users/register`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
        })

        const resdata = await res.json();
        console.log("User registration response data:", resdata);   
        try{
            // store as JSON string — was previously storing object directly
            localStorage.setItem("userObject", JSON.stringify(resdata.user));
            console.log("Stored userObject in localStorage:", resdata.user);
        }
        catch(err){
            console.error("Error storing userObject in localStorage:", err);
        }

        return resdata; 
    }
    catch(error) {
        console.error("Error registering user frontend:", error);
        return { success: false, error: error.message || "Network error" };
    }
}