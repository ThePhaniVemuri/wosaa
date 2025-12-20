import { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { API_BASE } from "../api/config";

export default function PaymentPage() {
  const contract = useLocation().state?.contract;
  const contractAmount = contract ? contract.amount : 0;
  const { contractId } = useParams();
  console.log("PaymentPage contractId:", contractId);
  console.log(contract);

  // useEffect(() => {
  //   const getContractAmount = async () => {
  //     const response = await fetch(`${API_BASE}/client/contract/${contractId}`, {
  //       method: "GET",
  //       credentials: "include",
  //     });

  //     if (!response.ok) {
  //       console.error("Failed to fetch contract details");
  //       return;
  //     }
  //     const data = await response.json();
  //     console.log("Contract details:", data);

  //     const contractAmount = data.contract.amount;
  //     setContractAmount(contractAmount);
  //   }

  //   getContractAmount();
  // }, [contractId]);

  const handlePay = async () => {    
    console.log("Initiating payment for contract:", contractId, "amount:", contractAmount);

    const res = await fetch(`${API_BASE}/client/payments/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: contractAmount, 
        currency: "USD",
        metadata: { contractId },      
      }),
      credentials: "include",      
    });

    const data = await res.json();
    window.location.href = data.url;   // Dodo checkout
  };

  return (
    <div>
      <h2>Complete Payment</h2>
      <p>Amount to pay: ${contractAmount}</p>
      <button 
        onClick={handlePay}
        className="w-full bg-white! text-black! py-2 px-4 rounded hover:bg-gray-800 transition-colors"
      >Pay Now
      </button>
    </div>
  );
}