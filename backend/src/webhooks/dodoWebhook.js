import { Contract } from "../models/Contract.models.js";
import { Gig } from "../models/Gig.models.js";
import { Client } from "../models/Client.models.js";
import { Freelancer } from "../models/Freelancer.models.js";
import { Webhooks } from "@dodopayments/express";
import dotenv from "dotenv";

dotenv.config();

console.log("webhook: ", process.env.DODO_WEBHOOK_SECRET)

const manageWebhook = Webhooks({
  webhookKey: process.env.DODO_WEBHOOK_SECRET,

  onPayload: async (payload) => {
    console.log("🔔 Webhook received");
    console.log("➡️ Event type:", payload.type);

    // ✅ Only handle successful payments
    if (payload.type !== "payment.succeeded") {
      console.log("⏭️ Ignored event");
      return;
    }

    const metadata = payload.data?.metadata;

    if (!metadata) {
      console.error("❌ Metadata missing in webhook payload");
      return;
    }

    const { contractId, clientId, freelancerId, gigId } = metadata;

    console.log("📦 Metadata:", metadata);

    try {
      // 1️⃣ Activate contract
      await Contract.findByIdAndUpdate(contractId, {
        status: "ACTIVE",
        paid: true,
      });
      console.log("✅ Contract activated:", contractId);

      // 2️⃣ Assign freelancer to gig + mark in progress
      await Gig.findByIdAndUpdate(gigId, {
        hiredFreelancer: freelancerId,
        status: "IN_PROGRESS",
      });
      console.log("✅ Gig updated:", gigId);

      // 3️⃣ Update client hired freelancers
      await Client.findOneAndUpdate(
        { userId: clientId },
        { $addToSet: { hiredFreelancers: freelancerId } }
      );
      console.log("✅ Client updated:", clientId);

      // 4️⃣ Update freelancer active gigs
      await Freelancer.findOneAndUpdate(
        { userId: freelancerId },
        { $addToSet: { currentlyWorkingOn: gigId } }
      );
      console.log("✅ Freelancer updated:", freelancerId);

      console.log("🎉 Webhook processed successfully");
    } catch (err) {
      console.error("🔥 Webhook processing failed:", err);
    }
  },
});

export default manageWebhook;
