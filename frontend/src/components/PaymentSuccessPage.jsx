export default function PaymentSuccessPage() {
  const updatePaymentStatusInContract = async () => {
    const res = await fetch(`/client/contracts/update-payment-status`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (res.ok) {
      console.log("Payment status updated in contract");
    } else {
      console.error("Failed to update payment status in contract");
    }
  };    


  return (
    <div>
      <h2>Payment Successful!</h2>
      <p>Thank you for your payment. Your transaction has been completed successfully.</p>

      <button        
        className="w-full bg-black! text-white! py-2 px-4 rounded hover:bg-gray-800 transition-colors"
        onClick={() => window.location.href = '/dashboard'}
      >
        Go to Dashboard
    </button>
    </div>    
  );
}