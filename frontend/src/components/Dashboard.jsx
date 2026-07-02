import { useEffect, useState } from "react";
import { fetchWithRefresh } from "../api/refreshAccessToken.js";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { applyToGig } from "../api/applyToGig.js";
import { hireFreelancer } from "../api/hireFreelancer.js";
import { getGigsInWork } from "../api/getgigsInWork.js";
import { API_BASE } from "../api/config.js";
import { useUser } from "../context/UserContext.jsx";


export function Dashboard() {
  const navigate = useNavigate();
  const {user, setUser} = useUser()

  useEffect(() => {
    if (!user) {
      navigate("/login")
    }
  }, [user, navigate])

  if (!user) return null

  const [gigsByClient, setGigsByClient] = useState([]);
  const [gigs, setGigs] = useState([]);
  const [isApplying, setIsApplying] = useState(false);
  const [gigApplied, setGigApplied] = useState(false)
  const [gigsInWork, setGigsInWork] = useState([]);

  // bid for gig variables
  const [openGigId, setOpenGigId] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [note, setNote] = useState("");

  //hire freelancer confirmation variables
  const [showHireModal, setShowHireModal] = useState(false);
  const [selectedGigId, setSelectedGigId] = useState(null);
  const [selectedFreelancerId, setSelectedFreelancerId] = useState(null);
  const [selectedFreelancerName, setSelectedFreelancerName] = useState("");
  const [applicantBidAmount, setApplicantBidAmount] = useState(null);

  // set status of task
  const [currentStatus, setCurrentStatus] = useState("");
  const [taskcompleteConfirmationModel, setTaskcompleteConfirmationModel] = useState(false);
  const [selectedGigIdForTask, setSelectedGigIdForTask] = useState(null);

  const location = useLocation();

  // useEffect(() => {
  //   async function fetchUser() {
  //     try {
  //       const res = await fetchWithRefresh("/users/currentuser", {
  //         method: "GET",          
  //       });

  //       if (res.status === 401) {
  //         console.log("User not logged in");
  //         navigate("/login");
  //         return;
  //       }

  //       const data = await res.json();
  //       setUser(data.user);
  //     } catch (err) {
  //       console.error("Error fetching current user:", err);
  //     }
  //   }

  //   fetchUser();
  // }, [navigate]);

  useEffect(() => {
    const postedGigsByClient = async () => {
      try {
        const res = await fetchWithRefresh("/client/posted-gigs", { method: "GET" });

        if (res.ok) {
          const data = await res.json();
          // console.log("Posted gigs by client data:", data);
          setGigsByClient(data.postedGigs || []);
        } else {
          const errorText = await res.text();
          // console.log("Error while fetching posts by client: " + errorText);
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
        // console.log("Fetch gigs response:", res);

        if (res.ok) {
          const data = await res.json();
          setGigs(data.gigs || []);
          // console.log("Gigs fetched for freelancer:", data.gigs);
        } else {
          // console.log("gigs get method fail");
        }
      } catch (err) {
        console.error("Error fetching gigs:", err);
      }
    };

    if (user?.role === "freelancer") {
      getGigs();
    }
  }, [user]);

  const applyToGigg = async (gigId, bidAmount, note) => {
    if (isApplying) return; // Prevent multiple submissions
    setIsApplying(true);
    try {
      // console.log("Applying to gig:", gigId, "with bid:", bidAmount, "and note:", note);
      const data = await applyToGig(gigId, bidAmount, note);
      // console.log("Applied to gig response:", data);
      if (data?.success) {
        console.log("Successfully applied to gig");
        setGigApplied(true)
      } else {
        // console.log("Failed to apply to gig:", data?.error || "Unknown error");
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
  const hireFreelancerr = async (clientId, gigId, freelancerId, amount) => {
    if (!freelancerId) {
      console.warn("Cannot hire: freelancerId missing");
      return;
    }

    try {
      await hireFreelancer(clientId, gigId, freelancerId, amount);
      // refresh UI to reflect hire
      await fetchPostedGigs();
    } catch (error) {
      console.error("Error hiring freelancer from Dashboard:", error);
    }
  };

  const handleHire = async (clientId, gigId, freelancerId, amount) => {
    // console.log("Initiating hire process for freelancer:", freelancerId, "on gig:", gigId, "with amount:", amount);
    if (!freelancerId) {
      console.warn("Cannot hire: freelancerId missing");
      return;
    }

    try {
      // this creates contract 
      const contractRes = await fetch(`${API_BASE}/client/create-contract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, gigId, freelancerId, amount }),
        credentials: "include",
      });
      if (!contractRes.ok) {
        const errorText = await contractRes.text();
        console.error("Failed to create contract:", errorText);
        return;
      }
      const contractData = await contractRes.json();
      // console.log("Contract created:", contractData);
      
      // Navigate to Payment Page
      navigate(`/pay/${contractData.contract._id}`, { state: { contract: contractData.contract } });
    } catch (error) {
      console.error("Error in handleHire:", error);
    }
  };
  

  // handle chat button click
  const handleChatButtonClick = (clientId, freelancerId, gigId, gigTitle) => {    

    if (!clientId || !freelancerId || !gigId) {
      console.warn("Cannot initiate chat: missing IDs");
      // console.log({ clientId, freelancerId, gigId });
      return;
    }

    if (user.role === "client"){
      navigate("/chat/client", { state: { clientId, freelancerId, gigId, gigTitle } });          
    }
    
    if (user.role === "freelancer"){
      navigate("/chat", { state: { clientId, freelancerId, gigId, gigTitle } });    
    }    
  }

  useEffect(() => {
    const getgigInWork = async () => {
      try {
        const data = await getGigsInWork();
        if (data) {          
          setGigsInWork(data.gigsInWork || []);
          // console.log("Gigs in work data:", data);
        } else {
          // console.log("Failed to fetch gigs in work");
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

  const setAndGetGigStatus = async (gigId, status) => {
    try {
      const res = await fetch(`${API_BASE}/client/set-gig-status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },        
        body: JSON.stringify({ gigId, status }),
        credentials: "include",
      });

      const data = await res.json();
      // console.log("Set gig status response:", data);

      const currentStatus = data.updatedGig.status;
      setCurrentStatus(currentStatus);

      if (res.ok) {        
        // console.log("Gig status updated successfully");
      } else {
        const errorText = await res.text();
        console.error("Failed to update gig status:", errorText);
      }
    } catch (err) {
      console.error("Error updating gig status:", err);
    }
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
            <h2 className="text-2xl font-semibold mb-4 text-gray-200">Your Information</h2>
            <p className="text-gray-400">Name: <span className="text-gray-100">{user.name}</span></p>
            <p className="text-gray-400">Email: <span className="text-gray-100">{user.email}</span></p>
          </div>
        ) : (
          <p className="text-center text-gray-400 animate-pulse">Please Login</p>
        )}

        {/* Client Dashboard */}
        {user && user.role === "client" ? (
          <div className="bg-neutral-900 p-8 rounded-2xl border border-neutral-800 shadow-lg">
            <h2 className="text-3xl font-semibold mb-3 text-gray-100">Client Dashboard</h2>
            <p className="text-gray-400 mb-6">Manage your gigs and view applications.</p>

<ul className="space-y-4 mb-6">
              {gigsByClient.map((gig) => (
                <li key={gig._id} className="bg-neutral-800/90 border border-neutral-700 rounded-2xl p-5 shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl text-white">{gig.title}</h3>
                        <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-wide text-blue-300">
                          {gig.status || "open"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="rounded-full bg-neutral-700/70 px-3 py-1">
                          Budget: <span className="ml-1 font-semibold text-amber-300">${gig.budget || 0}</span>
                        </span>
                        <span className="rounded-full bg-neutral-700/70 px-3 py-1">
                          Delivery: <span className="ml-1 font-semibold text-gray-200">{gig.deliveryTimeInDays || "—"} days</span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-start rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-gray-300">
                      <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Task</span>
                      <select
                        value={gig.status || ""}
                        onChange={(e) => {
                          const value = e.target.value;

                          if (value === "completed") {
                            setSelectedGigIdForTask(gig._id);
                            setTaskcompleteConfirmationModel(true);
                          } else {
                            setAndGetGigStatus(gig._id, value);
                          }
                        }}
                        className="bg-transparent text-sm text-gray-100 outline-none"
                      >
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  <ul className="mt-4 space-y-3">
                    {gig.hiredFreelancer ? (
                      <li className="rounded-xl border border-emerald-800/40 bg-emerald-950/20 p-4 text-sm text-emerald-200">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="font-semibold text-emerald-100">Freelancer hired</p>
                            <p>{gig.hiredFreelancer.name} ({gig.hiredFreelancer.email})</p>
                          </div>
                          <button
                            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white transition hover:bg-neutral-700"
                            onClick={() => handleChatButtonClick(user._id, gig.hiredFreelancer._id, gig._id, gig.title)}
                          >
                            Chat with Freelancer
                          </button>
                        </div>
                      </li>
                    ) : (
                      <>
                        {gig.applicants && gig.applicants.length > 0 ? (
                          gig.applicants.map((applicant, idx) => (
                            <li key={idx} className="flex flex-col gap-3 rounded-xl border border-neutral-700 bg-neutral-900/70 p-4 md:flex-row md:items-center md:justify-between">
                              <div className="min-w-0">
                                <p className="font-medium text-gray-100">{(applicant.freelancerId?.name) || (applicant.freelancerId) || "Unknown"}</p>
                                <p className="text-sm text-gray-400">{applicant.freelancerId?.email || "—"}</p>
                                <p className="mt-2 text-sm text-gray-400">Bid: <span className="font-semibold text-amber-300">₹{applicant.bidAmount}</span></p>
                                {applicant.note ? <p className="mt-1 text-sm text-gray-500">Note: {applicant.note}</p> : null}
                              </div>
                              {applicant.freelancerId ? (
                                <button
                                  onClick={() => {
                                    setSelectedGigId(gig._id);
                                    setSelectedFreelancerId(applicant.freelancerId?._id || applicant.freelancerId);
                                    setApplicantBidAmount(applicant.bidAmount);
                                    setSelectedFreelancerName(applicant.freelancerId?.name || "Unknown");
                                    setShowHireModal(true);
                                  }}
                                  className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
                                >
                                  Hire this freelancer
                                </button>
                              ) : (
                                <span className="text-sm text-yellow-300">No freelancer data</span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="rounded-xl border border-dashed border-neutral-700 p-4 text-sm italic text-gray-500">No applicants yet</li>
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

            {/* task completion confiramtion model */}
            {taskcompleteConfirmationModel && (
              <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-black rounded-lg shadow-lg p-6 w-96">
                  <h2 className="text-lg text-white font-semibold mb-4">
                    Confirm Task Completion
                  </h2>
                  <p className="text-sm text-gray-400 mb-4">
                    Are you sure you want to mark this task as completed? This action will notify the freelancer and update the gig status.
                  </p>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={async () => {
                        await setAndGetGigStatus(selectedGigIdForTask, "completed");
                        setTaskcompleteConfirmationModel(false);
                      }}
                      className="px-4 py-2 bg-green-400! text-white rounded hover:bg-green-700"
                    >
                      ✅ Confirm
                    </button>
                    <button
                      onClick={() => setTaskcompleteConfirmationModel(false)}
                      className="px-4 py-2 bg-red-600! text-white rounded hover:bg-red-700"
                    >
                      ❌ Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}                      

            {/* hire confirmation modal */}
            {showHireModal && (
                <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-black rounded-lg shadow-lg p-6 w-96">
                    <h2 className="text-lg text-white font-semibold mb-4">
                      You’re hiring {selectedFreelancerName} for this gig
                    </h2>

                    <h4>Payment Details</h4>
                    
                    <h4 className="mt-2 font-semibold">Amount: {applicantBidAmount}</h4>

                    <p className="text-sm text-gray-400 mb-4">
                      By confirming, you agree to pay the freelancer according to the agreed terms. Please ensure you have reviewed the freelancer's application and are satisfied with their qualifications.
                    </p>

                    <div className="flex justify-end gap-3">
                      <button
                        onClick={async () => {
                          console.log("Confirming hire of freelancer:", selectedFreelancerId, "for gig:", selectedGigId);
                          await handleHire(user._id, selectedGigId, selectedFreelancerId, applicantBidAmount);                          
                        }}
                        className="px-4 py-2 bg-green-400! text-white rounded hover:bg-green-700"
                      >
                        ✅ Confirm Hire
                      </button>
                      <button
                        onClick={() => setShowHireModal(false)}
                        className="px-4 py-2 bg-red-600! text-white rounded hover:bg-red-700"
                      >
                        ❌ Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}


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
                <ul className="space-y-4">
                  {gigsInWork.map((gig) => (
                    <li key={gig._id || gig.id} className="rounded-2xl border border-neutral-700 bg-neutral-800/90 p-5 text-gray-200">
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg text-white">{gig.title}</h3>
                          {gig.description && (
                            <p className="mt-2 text-sm text-gray-400">{gig.description}</p>
                          )}
                          <p className="mt-3 text-sm text-gray-500">
                            {gig.postedBy?.name || "Unknown"} • {gig.postedBy?.company || "—"} • {gig.postedBy?.country || "—"}
                          </p>
                        </div>

                        <div className="flex flex-col items-start gap-3 md:items-end">
                          <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
                            Budget: ${gig.budget || 0}
                          </span>
                          <button
                            className="rounded-lg bg-neutral-900 px-3 py-2 text-sm text-white transition hover:bg-neutral-700"
                            onClick={() => handleChatButtonClick(gig.postedBy?.userId, user._id, gig._id, gig.title)}
                          >
                            Chat with Client
                          </button>
                        </div>
                      </div>
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
            <ul className="space-y-4">
              {gigs.map((gig) => {
                const alreadyApplied = gig.applicants?.some(applicant =>
                  applicantMatchesUser(applicant, user?._id)
                );

                return gig.hiredFreelancer ? null : (
                  <li
                    key={gig._id || gig.id}
                    className="rounded-2xl border border-neutral-700 bg-neutral-800/90 p-5 text-gray-200"
                  >
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h3 className="text-lg text-white">{gig.title}</h3>
                        {gig.description && (
                          <p className="mt-2 text-sm text-gray-400">{gig.description}</p>
                        )}
                        <p className="mt-3 text-sm text-gray-500">
                          {gig.postedBy?.name || "Unknown"} • {gig.postedBy?.company || "—"}
                        </p>
                      </div>

                      <div className="flex flex-col items-start gap-3 md:items-end">
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-300">
                          Budget: ${gig.budget || 0}
                        </span>

                        {alreadyApplied ? (
                          <button
                            disabled
                            className="rounded-lg bg-neutral-700 px-3 py-2 text-sm text-emerald-300 cursor-not-allowed"
                          >
                            Applied
                          </button>
                        ) : (
                          <button
                            onClick={() => setOpenGigId(gig._id)}
                            className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-black transition hover:bg-gray-200"
                          >
                            Get the gig
                          </button>
                        )}
                      </div>
                    </div>

                    {openGigId === gig._id && (
                      <div className="mt-4 rounded-xl border border-neutral-700 bg-neutral-900/80 p-4">
                        <label className="mb-2 block text-sm text-gray-300">
                          Bid Amount (₹)
                        </label>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          className="mb-3 w-full rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <label className="mb-2 block text-sm text-gray-300">
                          Why you?
                        </label>
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          rows={3}
                          className="mb-3 w-full rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => {
                              applyToGigg(gig._id, bidAmount, note);
                              console.log(bidAmount, note)
                              setOpenGigId(null);
                              setBidAmount("");
                              setNote("");
                            }}
                            className="rounded bg-green-600 px-4 py-2 text-white transition hover:bg-green-700"
                          >
                            Submit
                          </button>
                          <button
                            onClick={() => setOpenGigId(null)}
                            className="rounded bg-red-600 px-4 py-2 text-white transition hover:bg-red-700"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
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
