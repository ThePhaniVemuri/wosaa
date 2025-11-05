export async function registerUser(data) {
    try{
        const res = await fetch('http://localhost:3000/api/v1/users/register', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
        },
        body: JSON.stringify(data)
        })

        const resdata = await res.json();
        try{
            // store as JSON string — was previously storing object directly
            localStorage.setItem("userObject", JSON.stringify(resdata.user));
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