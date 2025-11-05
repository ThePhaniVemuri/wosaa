export async function registerUserAsFreelancer(data) {

    const user = localStorage.getItem("userObject");

    try{
        const res = await fetch('http://localhost:3000/api/v1/users/register/freelancer', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json' 
            },
            body: JSON.stringify({user, ...data})
        })

        const resdata = await res.json();
        return resdata;
    }    
    catch(error) {
        console.error("Error registering user as client:", error);
    }
}