import { useEffect, useState } from "react";
import { fetchWithRefresh } from "../api/refreshAccessToken";
import { Link } from "react-router-dom";

export function Dashboard() {
  const [user, setUser] = useState(null);
  const [gigsByClient, setGigsByClient] = useState([]);
  const [gigs, setGigs] = useState([]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetchWithRefresh("/users/currentuser");
        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching current user in Dashboard:", err);
      }
    }
    fetchUser();
  }, [user]);

  useEffect(() => {
    const postedGigsByClient = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/v1/users/client/postedgigs", {
          method: "GET",
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Posts retrieved");
          setGigsByClient(data.postedGigs);
        } else {
          const errorText = await res.text();
          console.log("Error while fetching posts by client: " + errorText);
        }
      } catch (err) {
        console.error("Error in postedGigsByClient:", err);
      }
    };

    if (user?.role === "client") {
      postedGigsByClient();
    }
  }, [user]);

  useEffect(() => {
    const getGigs = async () => {
      console.log("req made");
      const res = await fetch("http://localhost:3000/api/v1/users/freelancer/gigs", {
        method: "GET",
        credentials: "include",
      });

      console.log(res.status);

      if (res.ok) {
        const gigs = await res.json();
        setGigs(gigs.gigs);
        console.log(res.status);
      } else {
        console.log("gigs get method fail");
      }
    };

    if (user?.role === "freelancer") {
      getGigs();
      console.log(typeof gigs);
      console.log(gigs);
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-serif p-8">
      {/* Add Google Font */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-serif {
          font-family: 'DM Serif Display', serif;
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center text-white">
          Welcome to your Dashboard
        </h1>

        {user ? (
          <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg border border-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">
              User Information
            </h2>
            <p className="text-gray-400">Name: <span className="text-gray-100">{user.name}</span></p>
            <p className="text-gray-400">Email: <span className="text-gray-100">{user.email}</span></p>
          </div>
        ) : (
          <p className="text-center text-gray-400 animate-pulse">Loading user data...</p>
        )}

        {/* Client Dashboard */}
        {user && user.role === "client" ? (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-lg">
            <h2 className="text-3xl font-semibold mb-3 text-gray-100">
              Client Dashboard
            </h2>
            <p className="text-gray-400 mb-6">
              Manage your gigs and view applications.
            </p>

            <ul className="space-y-3 mb-6">
              {gigsByClient.map((gig, index) => (
                <li
                  key={index}
                  className="bg-neutral-800 hover:bg-neutral-700 transition-all p-4 rounded-xl text-gray-200"
                >
                  {gig.title}
                </li>
              ))}
            </ul>

            <Link
              to="/client/post-gig"
              className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
            >
              Post a New Gig
            </Link>
          </div>
        ) : (
          user && (
            <div className="text-center text-gray-500 italic">
              Only for Clients
            </div>
          )
        )}

        {/* Freelancer Dashboard */}
        {user && user.role === "freelancer" && (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-lg">
            <h2 className="text-3xl font-semibold mb-3 text-gray-100">
              Freelancer Dashboard
            </h2>
            <p className="text-gray-400 mb-6">
              Browse available gigs and manage your proposals.
            </p>

            {gigs && gigs.length > 0 ? (
              <ul className="space-y-3">
                {gigs.map((gig, index) => (
                  <li
                    key={index}
                    className="bg-neutral-800 hover:bg-neutral-700 transition-all p-4 rounded-xl text-gray-200"
                  >
                    {gig.title}{" "}
                    <span className="text-gray-500 text-sm">
                      — {gig.postedBy}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No gigs available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
