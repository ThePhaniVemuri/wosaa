export async function loginUser(data) {
    try {
        const res = await fetch('http://localhost:3000/api/v1/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include', // this sends cookies
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error("Failed to login");
        const resdata = await res.json();
        return resdata;
    } catch (error) {
        console.error("Login failed:", error);
    }
}