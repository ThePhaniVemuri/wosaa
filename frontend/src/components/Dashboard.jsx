import { useEffect, useState } from "react";
import { fetchWithRefresh } from "../api/refreshAccessToken.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { applyToGig } from "../api/applyToGig.js";
import { hireFreelancer } from "../api/hireFreelancer.js";
import { getGigsInWork } from "../api/getgigsInWork.js";
import { API_BASE } from "../api/config.js";

export function Dashboard() {
  const [user, setUser] = useState(null);
  const [gigsByClient, setGigsByClient] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [gigsInWork, setGigsInWork] = useState([]);
  const navigate = useNavigate();

  const location = useLocation();
  // const userAfterAutoLogin = location.state?.user || null;
  // console.log("User whoafter registration from location state:", userAfterAutoLogin);
  // useEffect(() => {
  //   if (userAfterAutoLogin) {
  //     setUser(userAfterAutoLogin);
  //   }
  // }, [userAfterAutoLogin]);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetchWithRefresh("/users/currentuser", {
          method: "GET",          
        });

        if (res.status === 401) {
          console.log("User not logged in");
          navigate("/login");
          return;
        }

        const data = await res.json();
        setUser(data.user);
      } catch (err) {
        console.error("Error fetching current user:", err);
      }
    }

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const postedGigsByClient = async () => {
      try {
        const res = await fetchWithRefresh("/client/posted-gigs", { method: "GET" });

        if (res.ok) {
          const data = await res.json();
          console.log("Posted gigs by client data:", data);
          setGigsByClient(data.postedGigs || []);
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
      try {
        const res = await fetch(`${API_BASE}/freelancer/gigs`, { method: "GET" });
        console.log("Fetch gigs response:", res);

        if (res.ok) {
          const data = await res.json();
          setGigs(data.gigs || []);
          console.log("Gigs fetched for freelancer:", data.gigs);
        } else {
          console.log("gigs get method fail");
        }
      } catch (err) {
        console.error("Error fetching gigs:", err);
      }
    };

    if (user?.role === "freelancer") {
      getGigs();
    }
  }, [user]);

  const applyToGigg = async (gigId) => {
    if (isApplying) return; // Prevent multiple submissions
    setIsApplying(true);
    try {
      const data = await applyToGig(gigId);
      console.log("Applied to gig response:", data);
      if (data?.success) {
        console.log("Successfully applied to gig");
      } else {
        console.log("Failed to apply to gig:", data?.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error applying to gig from Dashboard:", error);
    } finally {
      setIsApplying(false); // Re-enable the button
    }
  };

  // add helper to refresh posted gigs (used after hiring)
  const fetchPostedGigs = async () => {
    try {
      const res = await fetchWithRefresh("/client/posted-gigs", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setGigsByClient(data.postedGigs || []);
      }
    } catch (err) {
      console.error("Failed to refresh posted gigs:", err);
    }
  };

  // make hire handler an async function (not a function factory)
  const hireFreelancerr = async (gigId, freelancerId) => {
    if (!freelancerId) {
      console.warn("Cannot hire: freelancerId missing");
      return;
    }

    try {
      await hireFreelancer(gigId, freelancerId);
      // refresh UI to reflect hire
      await fetchPostedGigs();
    } catch (error) {
      console.error("Error hiring freelancer from Dashboard:", error);
    }
  };

  useEffect(() => {
    const getgigInWork = async () => {
      try {
        const data = await getGigsInWork();
        if (data) {          
          setGigsInWork(data.gigsInWork || []);
          console.log("Gigs in work data:", data);
        } else {
          console.log("Failed to fetch gigs in work");
        }
      } catch (err) {
        console.error("Error fetching gigs in work:", err);
      }
    };

    if (user?.role === "freelancer") {
      getgigInWork();
    }
  }, [user]);

  // helper to compare ids safely (handles populated and unpopulated freelancerId)
  const applicantMatchesUser = (applicant, userId) => {
    if (!applicant) return false;
    const fid = applicant.freelancerId;
    // fid can be an object with _id, an ObjectId-like, or a string
    const fidStr = fid?._id ?? fid;
    return String(fidStr) === String(userId);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-serif p-8">
      {/* Font and styles */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap"
        rel="stylesheet"
      />
      <style>{`
        .font-serif { font-family: 'DM Serif Display', serif; }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-10">
        <h1 className="text-4xl font-bold text-center text-white">Welcome to your Dashboard</h1>

        {user ? (
          <div className="bg-neutral-900 p-6 rounded-2xl shadow-lg border border-neutral-800">
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">User Information</h2>
            <p className="text-gray-400">Name: <span className="text-gray-100">{user.name}</span></p>
            <p className="text-gray-400">Email: <span className="text-gray-100">{user.email}</span></p>
          </div>
        ) : (
          <p className="text-center text-gray-400 animate-pulse">Loading user data...</p>
        )}

        {/* Client Dashboard */}
        {user && user.role === "client" ? (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-lg">
            <h2 className="text-3xl font-semibold mb-3 text-gray-100">Client Dashboard</h2>
            <p className="text-gray-400 mb-6">Manage your gigs and view applications.</p>

            <ul className="space-y-3 mb-6">
              {gigsByClient.map((gig) => (
                <li key={gig._id} className="bg-neutral-800 hover:bg-neutral-700 transition-all p-4 rounded-xl text-gray-200">
                  {gig.title}
                  <ul className="mt-2 ml-4 list-disc list-inside">
                    {gig.hiredFreelancer ? (
                      <li className="text-green-400 text-sm italic">
                        Freelancer hired – {gig.hiredFreelancer.name} ({gig.hiredFreelancer.email})
                      </li>
                    ) : (
                      <>
                        {gig.applicants && gig.applicants.length > 0 ? (
                          gig.applicants.map((applicant, idx) => (
                            <li key={idx} className="text-gray-400 text-sm">
                              {(applicant.freelancerId?.name) || (applicant.freelancerId) || "Unknown"}
                              {" "}
                              ({applicant.freelancerId?.email || "—"})
                              – Skills: {(applicant.freelancerId?.skills || []).join(", ")}
                              {/* render Hire button only when we have a freelancer id/object */}
                              {applicant.freelancerId ? (
                                <button
                                  onClick={() => hireFreelancerr(gig._id, applicant.freelancerId?._id || applicant.freelancerId)}
                                  className="ml-4 px-2 py-1 bg-white text-black rounded-lg text-xs hover:bg-gray-200 transition-all"
                                >
                                  Hire this freelancer
                                </button>
                              ) : (
                                <span className="ml-4 text-yellow-300 text-xs">No freelancer data</span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-gray-500 text-sm italic">No applicants yet</li>
                        )}
                      </>
                    )}
                  </ul>
                </li>
              ))}
            </ul>

            <Link to="/client/post-gig" className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all">
              Post a New Gig
            </Link>
          </div>
        ) : (
          user && <div className="text-center text-gray-500 italic" />
        )}

        {/* Freelancer Dashboard */}
        {user && user.role === "freelancer" && (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-lg">
            <h2 className="text-3xl font-semibold mb-3 text-gray-100">Gigs you are currently hired for</h2>
            <p className="text-gray-400 mb-6">View and apply to gigs.</p>
            <div className="mb-8">
              {gigsInWork && gigsInWork.length > 0 ? (
                <ul className="space-y-3">
                  {gigsInWork.map((gig) => (
                    <li key={gig._id || gig.id} className="bg-neutral-800 hover:bg-neutral-700 transition-all p-4 rounded-xl text-gray-200">
                      {gig.title}{" "}
                      {gig.description && (
                        <p className="text-gray-400 text-sm mt-1">{gig.description}</p>
                      )}
                      <span className="text-gray-500 text-sm">
                        — {gig.postedBy?.name || "Unknown"} from {gig.postedBy?.company || "—"} ({gig.postedBy?.country || "—"})
                      </span>

                      <span className="block text-gray-400 text-sm mt-1">
                        Budget: ({gig.budget}$)
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No current gigs in work</p>
              )}
            </div>
          </div>
        )}

        <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-lg">
          <h2 className="text-3xl font-semibold mb-3 text-gray-100">Available Gigs</h2>
          <p className="text-gray-400 mb-6">Browse and apply to new gigs.</p>
          {gigs && gigs.length > 0 ? (
            <ul className="space-y-3">
              {gigs.map((gig) => {
                const alreadyApplied = gig.applicants?.some(applicant => applicantMatchesUser(applicant, user?._id));
                return (
                  <li key={gig._id || gig.id} className="bg-neutral-800 hover:bg-neutral-700 transition-all p-4 rounded-xl text-gray-200">
                    {gig.title}{" "}
                    {gig.description && (
                      <p className="text-gray-400 text-sm mt-1">{gig.description}</p>
                    )}
                    <span className="text-gray-500 text-sm">
                      — {gig.postedBy?.name || "Unknown"} from {gig.postedBy?.company || "—"}

                    ({gig.budget}$)
                    </span>

                    {alreadyApplied ? (
                      <button
                        disabled
                        className="ml-4 px-3 py-1 bg-gray-500 text-green-500 rounded-lg text-sm cursor-not-allowed"                        
                      >
                        Applied
                      </button>
                    ) : (
                      <button onClick={() => applyToGigg(gig._id)} className="ml-4 px-3 py-1 bg-white text-black rounded-lg text-sm hover:bg-gray-200 transition-all">
                        Get the gig
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-gray-500">No gigs available</p>
          )}
        </div>
      </div>
    </div>
  );
}
