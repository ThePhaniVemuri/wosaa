import { API_BASE } from "./config.js";

export async function hireFreelancer(gigId, freelancerId) {
  const res = await fetch(`${API_BASE}/client/hire-freelancer`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gigId, freelancerId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}