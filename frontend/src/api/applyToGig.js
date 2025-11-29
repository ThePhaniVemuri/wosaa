import { API_BASE } from "./config.js";

export async function applyToGig(gigId) {
  const res = await fetch(`${API_BASE}/freelancer/apply-gig`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ gigId }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}