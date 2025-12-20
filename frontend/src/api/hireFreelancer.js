import { API_BASE } from "./config.js";

export async function hireFreelancer(clientId, gigId, freelancerId, amount) {
  const res = await fetch(`${API_BASE}/client/hire-freelancer`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, gigId, freelancerId, amount }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}