import "./App.css";
import { Outlet, useNavigate } from "react-router-dom";
import { useUser } from "./context/UserContext.jsx";

function App() {
  const { user } = useUser();

  const navigate = useNavigate();

  const handleDashboardNavigate = async () => {
    if (!user){
      navigate("/login");
    }
    else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-serif flex flex-col items-center">
      {/* Font Import */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-serif {
          font-family: 'DM Serif Display', serif;
        }
      `}</style>

      
      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between max-w-7xl mx-auto px-6 py-16 md:py-28">
        {/* Text content */}
        <div className="text-center md:text-left space-y-6 max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            Empowering <span className="text-gray-400">Creators</span> &{" "}
            <span className="text-gray-400">Freelancers</span> Worldwide.
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-md mx-auto md:mx-0">
            WOSAA helps connect clients and freelancers effortlessly — post
            gigs, find opportunities, and build your career.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button
              onClick={handleDashboardNavigate}
              className="px-8 py-3 rounded-xl bg-white text-black font-medium text-lg hover:bg-gray-200 transition-all"
            >
              Go to Dashboard →
            </button>

            <a
              href="/register"
              className="px-8 py-3 rounded-xl border border-gray-500 text-gray-300 hover:bg-neutral-800 transition-all text-lg text-center"
            >
              Get Started
            </a>
          </div>
        </div>

        {/* Hero image */}
        <div className="mt-12 md:mt-0 md:w-1/2 flex justify-center">
          <img
            src="/heroimg.jpg"
            alt="Freelance Illustration"
            className="w-80 md:w-md hover:scale-105 transition-transform"
          />
        </div>
      </section>

      {/* Child routes */}
      <Outlet />
    </div>
  );
}

export default App;
