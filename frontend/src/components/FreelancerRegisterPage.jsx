import { useNavigate } from "react-router-dom";
import { registerUserAsFreelancer } from "../api/registerUserAsFreelancer";

export default function FreelancerRegisterPage() {
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Convert comma-separated fields into arrays
    const skills = data.skills
      ? data.skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const portfolio = [
      { title: data.portfolioTitle1 || "", link: data.portfolioLink1 || "" },
      { title: data.portfolioTitle2 || "", link: data.portfolioLink2 || "" },
    ].filter((p) => p.title && p.link);

    const payload = {
      name: data.name,
      bio: data.bio,
      country: data.country,
      skills,
      portfolio,
      jobsCompleted: Number(data.jobsCompleted) || 0,
      earnings: Number(data.earnings) || 0,
    };

    console.log("Submitting:", payload);
    const result = await registerUserAsFreelancer(payload);

    if (result.success) {
        navigate('/dashboard');
    }else{
        console.error("Freelancer registration or navigation failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-8 shadow-sm"
      >
        <h1 className="text-2xl font-semibold mb-2">Freelancer Registration</h1>

        {/* Bio */}
        <label className="block mb-4">
          <span className="text-sm font-medium">Bio</span>
          <textarea
            name="bio"
            rows={4}
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-700 focus:outline-none"
            placeholder="Tell us about yourself..."
          />
        </label>

        {/* Country */}
        <label className="block mb-4">
          <span className="text-sm font-medium">Country</span>
          <input
            name="country"
            type="text"
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-700 focus:outline-none"
            placeholder="India"
          />
        </label>

        {/* Skills */}
        <label className="block mb-4">
          <span className="text-sm font-medium">Skills</span>
          <input
            name="skills"
            type="text"
            required
            className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-1 focus:ring-gray-700 focus:outline-none"
            placeholder="e.g. React, Node.js, MongoDB (comma separated)"
          />
        </label>

        {/* Portfolio */}
        <div className="mb-4">
          <span className="block text-sm font-medium mb-2">
            Portfolio (min 2 projects)
          </span>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input
                name="portfolioTitle1"
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Project 1 title"
              />
              <input
                name="portfolioLink1"
                type="url"
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Project 1 link"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                name="portfolioTitle2"
                type="text"
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Project 2 title"
              />
              <input
                name="portfolioLink2"
                type="url"
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Project 2 link"
              />
            </div>
          </div>
        </div>

        

        {/* Submit */}
        <button
          type="submit"
          className="w-full px-4 py-3 bg-black text-white rounded-lg font-medium hover:opacity-95"
        >
          Complete Registration
        </button>
      </form>
    </div>
  );
}
