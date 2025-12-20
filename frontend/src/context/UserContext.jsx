import React, { useEffect, useState } from "react";
import { fetchWithRefresh } from "../api/refreshAccessToken.js";

export const UserContext = React.createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetchWithRefresh("/users/currentuser", {
          method: "GET",
        });

        if (res.status === 401) {
          console.log("User not logged in");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    }

    fetchUser();
  }, []); 

  return (
    <UserContext.Provider value={{ user }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = React.useContext(UserContext);
  if (!ctx) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return ctx;
}

export default UserProvider;