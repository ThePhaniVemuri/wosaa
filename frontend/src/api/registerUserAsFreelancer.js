import { API_BASE } from "./config.js";

export async function registerUserAsFreelancer(data) {

    const user = JSON.parse(localStorage.getItem("userObject"));

    try{
        const res = await fetch(`${API_BASE}/freelancer/register`, {
            method: 'POST',
            credentials: 'include',
            headers: { 
                'Content-Type': 'application/json',            
            },
            body: JSON.stringify({user, ...data})
        })

        const resdata = await res.json();
        console.log("Registering user as freelancer response data:", resdata);
        return resdata;
    }    
    catch(error) {
        console.error("Error registering user as client:", error);
    }
}