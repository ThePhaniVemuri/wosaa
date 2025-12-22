import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/loginUser.js";
import { useUser } from "../context/UserContext.jsx";
import { useState } from "react";

export default function LoginPage() {
  const navigate = useNavigate();
  const {setUser} = useUser();
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    try {
      setLoading(true)
      const resdata = await loginUser(data);               
      // console.log("Login successful:", resdata);
      setUser(resdata.user)
      navigate('/dashboard', { state: { isloggedIn: true, resdata }});
    } catch (error) {
      console.error('Login failed:', error);
      // show UI error
    } finally {
      setLoading(false); // stop loading
    }
  }


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Login to Your Account</h2>

            <label className="block text-sm text-gray-700 mb-2">Email</label>
            <input
                name="email"
                type="email"
                placeholder=""
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />
            <label className="block text-sm text-gray-700 mb-2">Password</label>
            <input
                name="password"
                type="password"
                placeholder=""
                className="w-full mb-6 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 rounded transition-colors ${
                loading
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
                    ></path>
                  </svg>
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>
        </form>
    </div>
  )
}