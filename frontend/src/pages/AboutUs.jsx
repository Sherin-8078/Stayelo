import React from "react";
import Footer from "../components/Footer";

const leadership = [
  {
    name: "Viju Wilson",
    title: "Founder & CEO",
    description:
      "Viju is the visionary behind Stayelo, with 15 years of experience in the tech and travel industries.",
    img: "/roshan.png",
  },
  {
    name: "Viju Wilson",
    title: "Chief Technology Officer",
    description:
      "Viju leads our engineering team, building the robust and scalable platform that powers Stayelo.",
    img: "/roshan.png",
  },
  {
    name: "Viju Wilson",
    title: "Head of Product",
    description:
      "Viju is dedicated to understanding our users’ needs and translating them into amazing features.",
    img: "/roshan.png",
  },
];

export default function AboutUs() {
  return (
    <div className="bg-gradient-to-b from-cyan-50 via-white to-cyan-100 
      dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-black 
      min-h-screen text-gray-800 dark:text-gray-200 pt-22">

      {/* HERO */}
      <div className="relative w-full h-[420px] shadow-lg rounded-b-2xl overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1449247613801-ab06418e2861"
          alt="Lobby"
          className="w-full h-full object-cover opacity-90"
        />

        <div className="absolute inset-0 flex flex-col justify-center items-center 
          bg-black/50 backdrop-blur-sm text-white px-6">
          <h1 className="text-4xl md:text-6xl font-extrabold text-center 
            bg-gradient-to-r from-cyan-300 via-indigo-200 to-white 
            text-transparent bg-clip-text drop-shadow-lg mb-6
            dark:from-violet-400 dark:to-fuchsia-500 p-5">
            Redefining Hospitality for the Modern World
          </h1>

          <p className="text-lg md:text-2xl max-w-2xl text-center drop-shadow-lg">
            Crafting seamless and memorable travel experiences through innovation & service.
          </p>
        </div>
      </div>

      {/* MISSION + VISION */}
      <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-14 px-8 py-20">
        <div className="p-6 bg-white dark:bg-gray-800/60 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 ">
          <h2 className="font-bold text-3xl mb-4 
            bg-gradient-to-r from-cyan-500 to-indigo-500 
            text-transparent bg-clip-text
            dark:from-violet-500 dark:to-fuchsia-500">
            Our Mission
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            Our mission is to empower hoteliers and delight travelers by providing a seamless, intuitive, and powerful booking platform.
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-800/60 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <h2 className="font-bold text-3xl mb-4 
            bg-gradient-to-r from-indigo-500 to-purple-500 
            text-transparent bg-clip-text 
            dark:from-violet-400 dark:to-fuchsia-500">
            Our Vision
          </h2>
          <p className="text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            We envision a future where every journey is effortless and every stay is exceptional through technology and human-centric design.
          </p>
        </div>
      </section>

      {/* WHAT DRIVES US */}
      <section className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl 
        shadow-xl border border-gray-200 dark:border-gray-700 
        rounded-2xl max-w-6xl mx-auto py-16 px-12">

        <h3 className="font-bold text-4xl text-center mb-10 
          bg-gradient-to-r from-cyan-500 to-indigo-500 
          text-transparent bg-clip-text
          dark:from-violet-400 dark:to-fuchsia-500">
          What Drives Us
        </h3>

        <p className="text-center text-lg text-gray-600 dark:text-gray-300 mb-14">
          Our core values shape our culture and guide every decision.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Innovation */}
          <div className="text-center">
            <div className="mx-auto mb-5 w-16 h-16 flex items-center justify-center 
              bg-cyan-100 dark:bg-cyan-900/20 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" className="w-9 h-9 text-cyan-600 dark:text-cyan-400">
                <path d="M12 2v20m0 0l8-8m-8 8L4 14" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h4 className="font-semibold text-xl mb-2">Innovation</h4>
            <p className="text-gray-600 dark:text-gray-300">
              We constantly push boundaries to create smarter solutions.
            </p>
          </div>

          {/* Customer */}
          <div className="text-center">
            <div className="mx-auto mb-5 w-16 h-16 flex items-center justify-center 
              bg-indigo-100 dark:bg-indigo-900/20 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" className="w-9 h-9 text-indigo-600 dark:text-indigo-400">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h4 className="font-semibold text-xl mb-2">Customer-Centricity</h4>
            <p className="text-gray-600 dark:text-gray-300">
              Our clients and their guests are the heart of everything.
            </p>
          </div>

          {/* Integrity */}
          <div className="text-center">
            <div className="mx-auto mb-5 w-16 h-16 flex items-center justify-center 
              bg-purple-100 dark:bg-purple-900/20 rounded-full">
              <svg fill="none" viewBox="0 0 24 24" className="w-9 h-9 text-purple-600 dark:text-purple-400">
                <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" />
              </svg>
            </div>
            <h4 className="font-semibold text-xl mb-2">Integrity</h4>
            <p className="text-gray-600 dark:text-gray-300">
              We operate with honesty, transparency, and commitment.
            </p>
          </div>

        </div>
      </section>

      {/* TIMELINE */}
      <section className="max-w-4xl mx-auto my-24 px-8">
        <h3 className="font-bold text-4xl text-center mb-8 
          bg-gradient-to-r from-cyan-500 to-indigo-500 text-transparent bg-clip-text
          dark:from-violet-400 dark:to-fuchsia-500 p-5">
          Our Story
        </h3>

        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 
            w-1 bg-gradient-to-b from-cyan-400 to-indigo-500 
            dark:from-indigo-800 dark:to-purple-700 h-full rounded-full">
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-20 mt-10">

            <div className="md:pr-10 text-right">
              <span className="text-cyan-600 dark:text-cyan-400 font-semibold text-lg">2025 (Sept) – The Idea</span>
              <p className="text-gray-700 dark:text-gray-300">Stayelo began with a vision to simplify hotel management.</p>
            </div>

            <div></div>

            <div></div>

            <div className="md:pl-10">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-lg">2025 (Oct) – Testing and final review done</span>
              <p className="text-gray-700 dark:text-gray-300">Our platform tested with over 100 hotel rooms.</p>
            </div>

         
            <div className="md:pr-10 text-right">
              <span className="text-purple-600 dark:text-purple-400 font-semibold text-lg">2025 (Nov) – Website Launch</span>
              <p className="text-gray-700 dark:text-gray-300">We launched our website for seamless booking.</p>
            </div>
            <div></div>

         

          </div>
        </div>
      </section>

      {/* LEADERSHIP */}
      <section className="bg-white/80 dark:bg-gray-800/50 backdrop-blur-xl 
        rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 
        max-w-6xl mx-auto my-20 py-16 px-10">
        
        <h3 className="font-bold text-4xl text-center mb-10 
          bg-gradient-to-r from-cyan-500 to-indigo-500 text-transparent bg-clip-text
          dark:from-violet-400 dark:to-fuchsia-500">
          Meet the Leadership
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {leadership.map((person) => (
            <div key={person.name} className="text-center">
              <div className="w-28 h-28 mx-auto rounded-full overflow-hidden 
                border-4 border-cyan-300 dark:border-violet-500 shadow-xl mb-4">
                <img src={person.img} alt={person.name} className="w-full h-full object-cover" />
              </div>

              <h4 className="font-bold text-lg">{person.name}</h4>
              <p className="text-indigo-600 dark:text-indigo-400 font-medium">{person.title}</p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">{person.description}</p>
            </div>
          ))}
        </div>
      </section>

    

      <Footer />
    </div>
  );
}
