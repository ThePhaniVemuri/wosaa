import React, { useState } from "react";
import { postGig } from "../api/postGig";

export default function PostGig() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [budget, setBudget] = useState("");
    const [deliveryTimeInDays, setDeliveryTimeInDays] = useState("");
    const [skillsRequired, setSkillsRequired] = useState([]);
    const [skillInput, setSkillInput] = useState("");
    const [attachments, setAttachments] = useState([]);

    const handleFileChange = (e) => {
        setAttachments(Array.from(e.target.files));
    };

    const addSkill = (value) => {
        const trimmed = value.trim();
        if (trimmed && !skillsRequired.includes(trimmed)) {
            setSkillsRequired((s) => [...s, trimmed]);
        }
    };

    const handleSkillKeyDown = (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addSkill(skillInput);
            setSkillInput("");
        }
        if (e.key === "Backspace" && skillInput === "" && skillsRequired.length) {            
            setSkillsRequired((s) => s.slice(0, -1));
        }
    };

    const removeSkill = (skill) =>
        setSkillsRequired((s) => s.filter((x) => x !== skill));

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate required fields
    if (!title || !description || !category || !budget || !deliveryTimeInDays || skillsRequired.length === 0) {
        alert("Please fill all required fields");
        return;
    }

        const payload = {
            title,
            description,
            category,
            budget: Number(budget),
            deliveryTimeInDays: Number(deliveryTimeInDays),
            skillsRequired,
            attachments, 
        };
        console.log("Submitting gig:", payload);

        try {
            const resp = await postGig(payload);
            console.log(resp);
        } catch (err) {
            console.error("Error posting gig:", err);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth: 640, margin: "0 auto" }}>
            <div style={{ marginBottom: 12 }}>
                <label>Title</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    style={{ width: "100%" }}
                />
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    rows={5}
                    style={{ width: "100%" }}
                />
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>Category</label>
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: "100%", padding: "6px" }}
                >
                    <option value="">-- Select Category --</option>
                    <option value="SaaS Developement">SaaS Developement</option>
                    <option value="Vibe Coding">Vibe Coding</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                </select>
            </div>

            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1 }}>
                    <label>Budget</label>
                    <input
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        min="0"
                        style={{ width: "100%" }}
                    />
                </div>

                <div style={{ width: 200 }}>
                    <label>Delivery Time (days)</label>
                    <input
                        type="number"
                        value={deliveryTimeInDays}
                        onChange={(e) => setDeliveryTimeInDays(e.target.value)}
                        min="0"
                        style={{ width: "100%" }}
                    />
                </div>
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>Skills Required</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
                    {skillsRequired.map((s) => (
                        <div
                            key={s}
                            style={{
                                padding: "4px 8px",
                                background: "#eee",
                                borderRadius: 12,
                                display: "flex",
                                alignItems: "center",
                                gap: 6,
                            }}
                        >
                            <span>{s}</span>
                            <button
                                type="button"
                                onClick={() => removeSkill(s)}
                                style={{ border: "none", background: "transparent", cursor: "pointer" }}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
                <input
                    type="text"
                    placeholder="Type a skill and press Enter or comma"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    style={{ width: "100%" }}
                />
            </div>

            <div style={{ marginBottom: 12 }}>
                <label>Attachments</label>
                <input type="file" multiple onChange={handleFileChange} />
                {attachments.length > 0 && (
                    <ul>
                        {attachments.map((f, idx) => (
                            <li key={idx}>
                                {f.name} ({Math.round(f.size / 1024)} KB)
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <div>
                <button type="submit">Create Gig</button>
            </div>
        </form>
    );
}