import { Outlet, Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext.jsx";
import { logoutUser } from "../api/logoutUser.js";

export default function Layout() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();  

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      console.error("Logout failed:", e);
    } finally {
      setUser(null);      // update UI immediately
      navigate("/login"); // optional redirect
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-serif flex flex-col">
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

      {/* Navbar */}
      <nav className="w-full bg-neutral-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-neutral-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition">
            <img src="/wosaa.png" alt="WOSAA Logo" className="h-9 w-9" />
            <span className="text-2xl tracking-tight font-semibold text-white">
              WOSAA
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 text-gray-300">
            <a href="/about" className="hover:text-white transition">
              About
            </a>
            <a href="/contact" className="hover:text-white transition">
              Contact
            </a>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {!user && (
              <Link
                to="/register"
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg border border-neutral-700 text-gray-200 hover:bg-neutral-800 transition-all text-sm"
              >
                Register
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 rounded-lg bg-white text-black text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Login
              </Link>
            )}

            {user && (
              <>
                <span className="hidden sm:inline-block text-sm text-gray-200">
                  Hi, {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg border border-neutral-700 text-gray-300 hover:bg-neutral-800 transition-all text-sm"
                >
                  Logout
                </button>
              </>
            )}

            {/* Mobile Menu */}
            <a
              href="#menu"
              className="ml-2 md:hidden inline-flex items-center justify-center p-2 rounded-md border border-neutral-700 hover:bg-neutral-800 transition"
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                className="text-gray-300"
              >
                <path
                  d="M4 7h16M4 12h16M4 17h16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <main className="grow w-full">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800 py-6 text-center text-gray-500 text-sm w-full">
        © {new Date().getFullYear()} WOSAA — Crafted with passion.
      </footer>
    </div>
  );
}