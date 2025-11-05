export async function logoutUser() {
  try {
    const res = await fetch('http://localhost:3000/api/v1/users/logout', {
      method: 'POST',
      credentials: 'include', // this sends cookies
    });

    if (!res.ok) throw new Error("Failed to logout");
    const data = await res.json();

    // clear local data
    localStorage.removeItem("userObject");
    localStorage.removeItem("accessToken");

    return data;
  } catch (error) {
    console.error("Logout failed:", error);
  }
}
