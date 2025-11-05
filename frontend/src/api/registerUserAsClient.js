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

    console.log("Registering user as client with data:", {user, ...data});

    try{
        const res = await fetch('http://localhost:3000/api/v1/users/register/client', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            credentials: 'include',
            body: JSON.stringify({user, ...data})
        })

        const resdata = await res.json();
        return resdata;
    }    
    catch(error) {
        console.error("Error registering user as client:", error);
        return { success: false, error: error.message || "Network error" };
    }
}