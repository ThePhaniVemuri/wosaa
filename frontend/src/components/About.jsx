import React from "react";

function About() {
  return (
    <div className="min-h-screen bg-neutral-950 text-gray-100 font-serif flex flex-col items-center px-6 py-16">
      <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
        About <span className="text-gray-400">WOSAA</span>
      </h1>

      <div className="max-w-3xl text-center space-y-6">
        <p className="text-gray-300 text-lg leading-relaxed">
          WOSAA is a platform designed to empower{" "}
          <span className="text-gray-400">freelancers</span> and{" "}
          <span className="text-gray-400">clients</span> worldwide.  
          We make it effortless to post gigs, collaborate, and grow careers.
        </p>

        <p className="text-gray-400 text-lg leading-relaxed">
          Whether you’re a creator looking for opportunities or a client seeking
          talent, WOSAA bridges the gap with a seamless, stylish, and intuitive
          experience.
        </p>

        <p className="text-gray-300 text-lg leading-relaxed">
          Our mission is simple:  
          <span className="text-white font-semibold">Connect. Create. Grow.</span>
        </p>
      </div>
    </div>
  );
}

export default About;