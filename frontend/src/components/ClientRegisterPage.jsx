import React, { useState } from "react";
import { registerUserAsClient } from "../api/registerUserAsClient";
import { useNavigate } from "react-router-dom";

export default function ClientRegisterPage() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [company, setCompany] = useState("");
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!name.trim()) {
            setError("Name is required.");
            return;
        }

        const payload = {            
            name: name.trim(),
            company: company.trim() || undefined,
            country: country.trim() || undefined,
        };

        setLoading(true);
        try {

            const res = await registerUserAsClient(payload);

            if (res.success) {
                navigate('/dashboard');
            }else{
                console.error("Freelancer registration or navigation failed.");
            }

            const data = await res.json();
            setSuccess("Client created successfully.");
            // reset minimal fields (keep userId)
            setName("");
            setCompany("");
            setCountry("");
            // optionally do something with returned data
            // console.log("created client:", data);
        } catch (err) {
            console.error(err);
            setError(err.message || "Failed to create client.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={{ maxWidth: 640, margin: "24px auto", padding: 16 }}>
            <h2>Create Client</h2>

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>                

                <label>
                    Name *
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Client name"
                        required
                        style={{ width: "100%", padding: 8 }}
                    />
                </label>

                <label>
                    Company
                    <input
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Company name"
                        style={{ width: "100%", padding: 8 }}
                    />
                </label>

                <label>
                    Country
                    <input
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        style={{ width: "100%", padding: 8 }}
                    />
                </label>

                <div style={{ display: "flex", gap: 8 }}>
                    <button type="submit" disabled={loading} style={{ padding: "8px 12px" }}>
                        {loading ? "Saving..." : "Create Client"}
                    </button>
                    <button
                        type="button"
                        className="w-full bg-black! text-white! py-2 px-4 rounded hover:bg-gray-800 transition-colors"
                        onClick={() => {
                            setName("");
                            setCompany("");
                            setCountry("");                            
                            setError("");
                            setSuccess("");
                        }}
                        style={{ padding: "8px 12px" }}
                    >
                        Reset
                    </button>
                </div>

                {error && <div style={{ color: "crimson" }}>{error}</div>}
                {success && <div style={{ color: "green" }}>{success}</div>}
            </form>
        </div>
    );
}