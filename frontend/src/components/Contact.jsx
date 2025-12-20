import React from "react";

function Contact() {
  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-serif flex flex-col items-center px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
        Contact <span className="text-gray-400">Us</span>
      </h1>

      <div className="max-w-2xl w-full bg-neutral-900 p-8 rounded-xl shadow-lg space-y-6 text-lg">
        <p className="text-gray-300">
          <span className="font-semibold text-white">Email:</span> support@wosaa.com
        </p>
        <p className="text-gray-300">
          <span className="font-semibold text-white">Phone:</span> +91 9063340344
        </p>
        <p className="text-gray-300">
          <span className="font-semibold text-white">Address:</span>  
          WOSAA HQ, Hyderabad, Telangana, India
        </p>
      </div>
    </div>
  );
}

export default Contact;