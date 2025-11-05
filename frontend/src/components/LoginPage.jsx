import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/loginUser.js";

export default function LoginPage() {
    const navigate = useNavigate();
    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());

        try {
            loginUser(data);
            navigate('/dashboard');            
        } catch (error) {
            console.error('Login failed:', error);
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
                className="w-full bg-gray-900 text-white py-2 px-4 rounded hover:bg-gray-800 transition"
            >
                Login
            </button>
        </form>
    </div>
  )
}