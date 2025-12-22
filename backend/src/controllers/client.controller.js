import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import { Client } from "../models/Client.models.js";
import { User } from "../models/User.models.js";
import { Gig } from "../models/Gig.models.js";
import { Freelancer } from "../models/Freelancer.models.js";
import { generateAccessAndRefereshTokens } from "./user.controller.js";
import { Contract } from "../models/Contract.models.js";
import DodoPayments from 'dodopayments';
import sendMail from "../utils/email.js"

const registerClient = asyncHandler(async (req, res) => {
  const { user, name, company, country } = req.body;

  // if frontend sent a stringified user object, parse it
  if (typeof user === "string") {
    try {
      user = JSON.parse(user);
    } catch (err) {
      console.error("Error parsing user object in client registration:", err);
    }
  }

  if (!name || !company || !country) {
    throw new ApiError(400, "Missing required fields for client registration");
  }

  if (!user || !user._id) {
    throw new ApiError(400, "User information missing for client registration");
  }

  const client = await Client.create({
    userId: user._id,
    name,
    company,
    country,
  });

  if (!client) {
    throw new ApiError(500, "Failed to register client");
  }

  const userDoc = await User.findById(user._id).select("-password -refreshToken");
  const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id);

  return res
    .status(201)
    .cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none" })
    .cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "none" })
    .json({
      success: true,
      message: "Client registered and logged in successfully",
      user: userDoc,
      client,
      accessToken,
      refreshToken,
    });
});


const postGig = asyncHandler(async (req, res, next) => {
    const { title, description, category, budget, deliveryTimeInDays, skillsRequired, attachments } = req.body;
    // console.log(req.body)
    const userId = req.user._id; 
    // console.log(userId) 

    // Find the client associated with the user
    const client = await Client.findOne({ userId: userId });

    if (!client) {
        throw new ApiError(404, "Client profile not found for the user");
    }

    // Create a new gig
    const gig = await Gig.create({
        postedBy: client._id,
        title,
        description,
        category,
        budget,
        deliveryTimeInDays,
        skillsRequired,
        attachments,
    });
    if (!gig) {
        throw new ApiError(500, "Failed to post gig");
    }
    res.status(201).json({
        success: true,
        message: "Gig posted successfully",
        gig,
    });
});


const postedGigsByClient = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const client = await Client.findOne({ userId });

  if (!client) {
    throw new ApiError(404, "Client not found");
  }

  // Populate applicants with freelancer (User) details
  const postedGigs = await Gig.find({ postedBy: client._id })
    .populate({
      path: "applicants.freelancerId",
      model: "User", // Explicitly specify the model
      select: "name email skills"
    })
    .populate({
      path: "hiredFreelancer",
      model: "User", // Explicitly specify the model
      select: "_id name email skills"
    })
    .lean();

  res.status(200).json({
    success: true,
    postedGigs,
  });
});

// const gigApplicants = asyncHandler(async (req, res) => {
//   const gigId = req.gigId
//   const gig = await Gig.findById(gigId).populate('applicants.freelancerId', 'name email skills');

//   if (!gig) {
//     throw new ApiError(404, "Gig not found");
//   }
//   res.status(200).json({
//     success: true,
//     message: "Gig applicants retrieved successfully",
//     applicants: gig.applicants,
//   });
// });

const hireFreelancer = asyncHandler(async (req, res) => {
  const { gigId, freelancerId } = req.body;

  const gig = await Gig.findById(gigId);
  if (!gig) {
      throw new ApiError(404, "Gig not found");
  }
  
  gig.hiredFreelancer = freelancerId;
  await gig.save();

  const client = await Client.findOne({ userId: req.user._id });
  if (!client) {
      throw new ApiError(404, "Client profile not found for the user");
  }
  if (gig.postedBy.toString() !== client._id.toString()) {
      throw new ApiError(403, "You are not authorized to hire for this gig");
  }

  // Check if freelancer has applied to the gig
  const applicant = gig.applicants.find(app => app.freelancerId.toString() === freelancerId);
  if (!applicant) {
      throw new ApiError(400, "Freelancer has not applied to this gig");
  }

  client.hiredFreelancers.push(freelancerId);
  await client.save();

  const freelancer = await Freelancer.findOne({ userId: freelancerId });
  if (!freelancer) {
      throw new ApiError(404, "Freelancer profile not found");
  }

  freelancer.currentlyWorkingOn.push(gig);
  await freelancer.save();

  res.status(200).json({
    success: true,
    message: "Freelancer hired successfully",
  });
});

const createContract = asyncHandler(async (req, res) => {
    const {clientId, gigId, freelancerId, amount} = req.body 
    
    // check for existing contract
    const existingContract = await Contract.findOne({gigId: gigId, clientId: clientId, freelancerId: freelancerId})
    if(existingContract){
        return res.status(200).json({
            success:"Contact created successfully",
            contract: existingContract
        }) 
    }
    else{

    // create contract
    const contract = await Contract.create({
        gigId : gigId,
        clientId: clientId,
        freelancerId: freelancerId,
        amount: amount
    })

    // const createdContract = await Contract.findOne({gigId: gigId})

    res.status(200).json({
        success:"Contact created successfully",
        contract: contract
    })    
}
})

const createCheckoutSession = asyncHandler(async (req, res) => {
  const { amount, currency, metadata } = req.body;

  // Convert dollars to cents
  const amountInCents = amount * 100;

  const contractId = metadata.contractId;
  // console.log("Creating checkout session for contractId:", contractId);

  const contract = await Contract.findById(contractId);
  if (!contract) {
    throw new ApiError(404, "Contract not found");
  }

  // console.log("secret:", process.env.DODO_SECRET_KEY)

  // Initialize the Dodo Payments client
  const client = new DodoPayments({
    bearerToken: process.env.DODO_SECRET_KEY,
    environment: process.env.DODO_ENVIRONMENT
  });

  try {
    const session = await client.checkoutSessions.create({
      product_cart: [
        {
          product_id: process.env.PRODUCT_ID,
          quantity: 1,
          amount: amountInCents,
        },
      ],
      return_url: process.env.DODO_RETURN_URL,
      metadata: {
        contractId,
        clientId: contract.clientId,
        freelancerId: contract.freelancerId,
        gigId: contract.gigId,
    }

      // Optional: Pre-fill customer information
      // customer: {
      //   email: "customer@example.com",
      //   name: "John Doe",
      // },

      // Optional: Add metadata for tracking
      // metadata: {
      //   order_id: "order_123",
      //   pricing_tier: "custom",
      // },
    });

    // console.log("Checkout URL:", session.checkout_url);
    // console.log("Session ID:", session.session_id);

    res.status(200).json({
      url: session.checkout_url,
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
});


const setGigStatus = asyncHandler(async (req, res) => {
    const {gigId, status} = req.body

    const gig = await Gig.findById(gigId)
    if(!gig){
        throw new ApiError(500,"Not found gig to set status")        
    }

    if (status === "completed") {
        try {
            // find the contract for this gig (if any)
            const contract = await Contract.findOne({ gigId: gig._id });

            // get client info (the client who posted the gig)
            const clientProfile = await Client.findById(gig.postedBy);
            const clientUser = clientProfile ? await User.findById(clientProfile.userId).select("name email") : null;

            // get freelancer user (gig.hiredFreelancer stores freelancer user id)
            const freelancerUser = gig.hiredFreelancer
            ? await User.findById(gig.hiredFreelancer).select("name email")
            : null;

            // optional: mark contract as completed/ready for release
            if (contract) {
              contract.status = "COMPLETED";
              contract.paymentStatus = "READY_FOR_RELEASE";
              await contract.save();
            }

            const subject = `Release funds for completed gig: ${gig.title || gig._id}`;
            const html = `
            <p>The gig <strong>${gig.title || 'Untitled'}</strong> has been marked <strong>completed</strong>.</p>
            <p><strong>Client:</strong> ${clientUser?.name ?? 'N/A'} (${clientUser?.email ?? 'N/A'})</p>
            <p><strong>Freelancer:</strong> ${freelancerUser?.name ?? 'N/A'} (${freelancerUser?.email ?? 'N/A'})</p>
            <p><strong>Amount:</strong> ${contract?.amount ?? 'N/A'}</p>
            <p><strong>Contract ID:</strong> ${contract?._id ?? 'N/A'}</p>
            <p>Please release the funds to the freelancer.</p>
            `;

            await sendMail({
            to: "topetensteff@gmail.com",
            subject,
            html,
            text: `Gig ${gig.title || gig._id} completed — please release funds.`,
            });
        } catch (err) {
            console.error("Error sending release-funds email:", err);
        }

        // after sending mail, update the freelancer earnings
        const freelancerId = gig.hiredFreelancer
        const freelancer = await User.findById({freelancerId})
        
        const applicant = gig.applicants.find(
          a => a.freelancerId.toString() === freelancerId.toString()
        );
        const bidAmount = applicant ? applicant.bidAmount : null;

        freelancer.earnings += bidAmount
        await freelancer.save();
    }

    gig.status = status;
    await gig.save();

    res.status(200).json({
        success: "Gig status updated",
        updatedGig: gig               
    })

})

export {
    registerClient,
    postGig,
    postedGigsByClient,     
    hireFreelancer,
    createContract,
    createCheckoutSession,
    setGigStatus
};