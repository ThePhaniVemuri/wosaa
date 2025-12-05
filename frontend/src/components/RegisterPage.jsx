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
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />

            <label className="block text-sm text-gray-700 mb-1">Email</label>
            <input
                name="email"
                type="email"
                placeholder=""
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />

            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <input
                name="password"
                type="password"
                placeholder=""
                className="w-full mb-4 px-3 py-2 border border-gray-200 rounded bg-white text-gray-900 focus:outline-none focus:ring-0"
            />

            <div className="mb-4">
                <span className="block text-sm text-gray-700 mb-2">Role</span>
                <div className="flex gap-3">
                    <div className="flex-1">
                        <input id="role-freelancer" name="role" type="radio" value="freelancer" className="sr-only peer" />
                        <label
                            htmlFor="role-freelancer"
                            className="block cursor-pointer w-full text-center px-3 py-2 border border-gray-200 rounded bg-white peer-checked:border-gray-900 peer-checked:shadow-sm"
                        >
                            Freelancer
                        </label>
                    </div>

                    <div className="flex-1">
                        <input id="role-client" name="role" type="radio" value="client" className="sr-only peer" />
                        <label
                            htmlFor="role-client"
                            className="block cursor-pointer w-full text-center px-3 py-2 border border-gray-200 rounded bg-white peer-checked:border-gray-900 peer-checked:shadow-sm"
                        >
                            Client
                        </label>
                    </div>
                </div>
            </div>

            <button
                type="submit"                
                className="w-full px-3 py-2 border border-gray-200 rounded bg-white text-gray-900"
            >
                Create account
            </button>
        </form>
    </div>
    </div>
  )
}