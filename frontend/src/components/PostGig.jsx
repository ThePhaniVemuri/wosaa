import { useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const navigate = useNavigate();

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
      // attachments will not be uploaded in this simple example.
    };
    // console.log("Submitting gig:", payload);

    try {
      const resp = await postGig(payload);
      // console.log("Post gig response:", resp);
      if (resp?.success) {        
        // reset form
        setTitle("");
        setDescription("");
        setCategory("");
        setBudget("");
        setDeliveryTimeInDays("");
        setSkillsRequired([]);
        setSkillInput("");
        setAttachments([]);
        // Navigate to dashboard
        navigate('/dashboard')
      } else {
        alert("Failed to create gig: " + (resp.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Error posting gig:", err);
      alert("Error posting gig: " + (err.message || err));
    }
  };

  const inputClass = "w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0";
  const textareaClass = "w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0 resize-none";
  const buttonClass = "w-full bg-black! text-white! py-2 px-4 rounded hover:bg-gray-800 transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">Create a New Gig</h2>

        <label className="block text-sm text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className={inputClass}
        />

        <label className="block text-sm text-gray-700 mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          rows={4}
          className={textareaClass}
        />

        <label className="block text-sm text-gray-700 mb-1">Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
          className={inputClass}
        >
          
          <option value="">-- Select Category --</option> 
          <option value="SaaS Development">SaaS Development</option>
          <option value="Vibe Coding">Vibe Coding</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Digital Marketing">Digital Marketing</option>
        </select>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-700 mb-1">Budget ($)</label>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              min="0"
              required
              className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />
          </div>

          <div className="w-32">
            <label className="block text-sm text-gray-700 mb-1">Delivery (days)</label>
            <input
              type="number"
              value={deliveryTimeInDays}
              onChange={(e) => setDeliveryTimeInDays(e.target.value)}
              min="0"
              required
              className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />
          </div>
        </div>

        <label className="block text-sm text-gray-700 mb-1">Skills Required</label>
        <div className="flex flex-wrap gap-2 mb-3">
          {skillsRequired.map((s) => (
            <div key={s} className="flex items-center gap-2 px-3 py-1 bg-gray-100 border border-gray-300 rounded-full">
              <span className="text-sm">{s}</span>
              <button
                type="button"
                onClick={() => removeSkill(s)}
                className="text-gray-600 hover:text-red-500"
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
          className={inputClass}
        />

        <label className="block text-sm text-gray-700 mb-1">Attachments (optional)</label>
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
        />

        <button type="submit" className={buttonClass}>
          Create Gig
        </button>
      </form>
    </div>
  );
}