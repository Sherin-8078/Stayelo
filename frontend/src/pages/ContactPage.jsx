import React from "react";
import {
  PhoneIcon,
  EnvelopeIcon as MailIcon,
  MapPinIcon as LocationMarkerIcon,
  ClockIcon,
} from "@heroicons/react/24/solid";
import { FaWhatsapp } from "react-icons/fa";
import Footer from "../components/Footer";

export default function ContactPage() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Thank you for reaching out to StayElo! We'll respond soon.");
  };

  return (
    <div className="
      min-h-screen pt-24 px-6 md:px-12
      bg-gradient-to-b from-cyan-50 via-white to-cyan-100
      dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 
      dark:text-gray-100 text-gray-800
    "
    >
      {/* HEADER */}
      <div className="max-w-6xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold
          bg-gradient-to-r from-cyan-500 to-indigo-600
          dark:from-violet-400 dark:to-fuchsia-500
          bg-clip-text text-transparent p-5"
        >
          Contact StayElo
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">
          We’re here to make your stay as smooth as possible — reach out for any assistance.
        </p>
      </div>

      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">

        {/* FORM */}
        <div className="flex-1
          bg-white/90 backdrop-blur-md dark:bg-gray-800/60
          border border-gray-200 dark:border-gray-700
          rounded-2xl shadow-lg p-8 transition-all"
        >
          <h2 className="text-2xl font-semibold mb-6
            bg-gradient-to-r from-cyan-500 to-indigo-600
            dark:from-violet-400 dark:to-fuchsia-500
            bg-clip-text text-transparent"
          >
            Send Us a Message
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                  rounded-lg px-3 py-2 w-full
                  focus:ring-2 focus:ring-cyan-500 dark:focus:ring-violet-400 outline-none"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                className="border border-gray-300 dark:border-gray-600
                  bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                  rounded-lg px-3 py-2 w-full
                  focus:ring-2 focus:ring-cyan-500 dark:focus:ring-violet-400 outline-none"
                required
              />
            </div>

            {/* Email */}
            <input
              type="email"
              placeholder="Email"
              className="border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                rounded-lg px-3 py-2
                focus:ring-2 focus:ring-cyan-500 dark:focus:ring-violet-400 outline-none"
              required
            />

            {/* Phone */}
            <input
              type="tel"
              placeholder="Phone Number"
              className="border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                rounded-lg px-3 py-2
                focus:ring-2 focus:ring-cyan-500 dark:focus:ring-violet-400 outline-none"
            />

            {/* Subject */}
            <input
              type="text"
              placeholder="Subject"
              className="border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                rounded-lg px-3 py-2
                focus:ring-2 focus:ring-cyan-500 dark:focus:ring-violet-400 outline-none"
              required
            />

            {/* Message */}
            <textarea
              rows="5"
              placeholder="Tell us about your booking, inquiry, or issue..."
              className="border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100
                rounded-lg px-3 py-2
                focus:ring-2 focus:ring-cyan-500 dark:focus:ring-violet-400 outline-none"
              required
            ></textarea>

            {/* Submit Button */}
            <button
              type="submit"
              className="mt-3 w-fit px-6 py-2 text-white font-semibold rounded-lg
                bg-gradient-to-r from-cyan-500 to-indigo-600
                dark:from-violet-500 dark:to-fuchsia-600
                shadow-md hover:opacity-90 hover:scale-[1.02] transition-all"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* INFO CARDS */}
        <div className="flex-1 flex flex-col gap-6">

          {/* Get in Touch */}
          <div className="bg-white/90 backdrop-blur-md dark:bg-gray-800/60
            border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold mb-4
              bg-gradient-to-r from-cyan-500 to-indigo-600
              dark:from-violet-400 dark:to-fuchsia-500
              bg-clip-text text-transparent"
            >
              Get in Touch
            </h2>
            <div className="space-y-3 text-gray-800 dark:text-gray-100">
              <div className="flex items-center gap-3">
                <PhoneIcon className="w-6 h-6 text-cyan-500 dark:text-violet-400" />
                <div>
                  <p className="font-medium">Customer Support</p>
                  <p>+91 484 9876543</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MailIcon className="w-6 h-6 text-cyan-500 dark:text-violet-400" />
                <div>
                  <p className="font-medium">Email</p>
                  <p>support@stayelo.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <LocationMarkerIcon className="w-6 h-6 text-cyan-500 dark:text-violet-400" />
                <div>
                  <p className="font-medium">Head Office</p>
                  <p className="text-sm">
                    StayElo Hospitality Pvt. Ltd.<br />
                    Marine Drive, Kochi<br />
                    Kerala, India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ClockIcon className="w-6 h-6 text-cyan-500 dark:text-violet-400" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm">
                    Mon–Fri: 9AM – 8PM<br />
                    Sat: 10AM – 6PM<br />
                    Sun: 10AM – 4PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Support */}
          <div className="bg-white/90 backdrop-blur-md dark:bg-gray-800/60
            border border-gray-200 dark:border-gray-700 p-6 rounded-2xl shadow-lg transition-all"
          >
            <h2 className="text-xl font-semibold mb-4
              bg-gradient-to-r from-cyan-500 to-indigo-600
              dark:from-violet-400 dark:to-fuchsia-500
              bg-clip-text text-transparent"
            >
              Emergency Support
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-3">
              Need urgent help? Our 24/7 helpline is always open.
            </p>

            <div className="flex items-center gap-3 mb-3">
              <PhoneIcon className="w-6 h-6 text-red-600 dark:text-red-400" />
              <div>
                <p className="font-medium">Emergency Hotline</p>
                <p className="text-gray-600 dark:text-gray-300">+91 99999 88888</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <FaWhatsapp className="w-6 h-6 text-green-600 dark:text-green-400" />
              <div>
                <p className="font-medium">WhatsApp Support</p>
                <p className="text-gray-600 dark:text-gray-300">+91 99999 77777</p>
              </div>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}
