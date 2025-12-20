import {registerUser} from '../api/registerUser.js';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        // console.log(data);

        try {
            await registerUser(data); 
            if (data.role === 'freelancer') {
                navigate('/register/freelancer')
            }
            else if (data.role === 'client') {
                navigate('/register/client');
            }
        } catch (error) {
            console.error('Registration failed:', error);
        }
    }

  return (
    <div>
    <div className="min-h-screen flex items-center justify-center bg-white">
        <form
            onSubmit={handleSubmit}
            className="w-full max-w-md bg-white border border-gray-200 p-6 rounded-md"
        >
            <h2 className="text-lg font-medium text-gray-900 mb-4">Register</h2>

            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input
                name="name"
                type="text"
                placeholder=""
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 shadow-md focus:outline-none focus:ring-0"
            />

            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
                name="email"
                type="email"
                placeholder=""
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 shadow-md focus:outline-none focus:ring-0"
            />

            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
                name="password"
                type="password"
                placeholder=""
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 shadow-md focus:outline-none focus:ring-0"
            />

            <div className="flex gap-3">
                <label className="flex-1 cursor-pointer">
                <input
                    type="radio"
                    name="role"
                    value="freelancer"
                    className="peer hidden"
                />
                <div className="text-center py-2 border border-neutral-700 rounded bg-neutral-800 peer-checked:border-white">
                    Freelancer
                </div>
                </label>

                <label className="flex-1 cursor-pointer">
                <input
                    type="radio"
                    name="role"
                    value="client"
                    className="peer hidden"
                />
                <div className="text-center py-2 border border-neutral-700 rounded bg-neutral-800 peer-checked:border-white">
                    Client
                </div>
                </label>
            </div>            

            <button
                type="submit"
                className="w-full bg-black! text-white! py-2 px-4 rounded hover:bg-gray-800 transition-colors mt-6" 
                >
                Create Account
            </button>
        </form>
    </div>
    </div>
  )
}