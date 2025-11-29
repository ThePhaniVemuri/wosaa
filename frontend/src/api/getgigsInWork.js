import { API_BASE } from "./config";

export async function getGigsInWork() {
  const res = await fetch(`${API_BASE}/freelancer/gigs-in-work`, {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });
  const data = await res.json();
  return data;
}