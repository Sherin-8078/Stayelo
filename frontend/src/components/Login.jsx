import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CardTitle, CardDescription } from "./ui/Card";
import Input from "./ui/Input";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = ({ open, onClose, onLogin }) => {
  const [flipped, setFlipped] = useState(false);

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    location: "",
  });

  const navigate = useNavigate();

  // Determine theme dynamically
  const theme = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";

  const buttonGradient =
    theme === "dark"
      ? "bg-gradient-to-r from-violet-600 to-fuchsia-500"
      : "bg-gradient-to-r from-cyan-500 to-indigo-600";

  const cardBackground =
    theme === "dark"
      ? "bg-gradient-to-br from-gray-800 via-violet-900 to-fuchsia-900"
      : "bg-white";

  const linkColor = theme === "dark" ? "text-violet-400" : "text-indigo-600";

  // ✅ Login
  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post("http://localhost:4000/api/auth/login", loginForm);
    const { token, user } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    onLogin?.(user);
    window.location.reload();

    const role = user.role?.toUpperCase();
    if (role === "ADMIN") window.location.href = "/adminDashboard";
    else window.location.href = "/"; // reloads the page

  } catch (err) {
    alert(err.response?.data?.message || "Login failed.");
  }
};


  // ✅ Signup
  const handleSignup = async (e) => {
    e.preventDefault();

    if (!signupForm.name || !signupForm.email || !signupForm.password)
      return alert("Please fill all required fields");

    try {
      await axios.post("http://localhost:4000/api/auth/signup", {
        ...signupForm,
        role: "CUSTOMER",
      });

      alert("Signup successful! You can now log in.");
      setFlipped(false);
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed.");
    }
  };

  // ✅ Click Outside Close
  const handleOutsideClick = (e) => {
    if (e.target.id === "modal-overlay") {
      onClose?.();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="modal-overlay"
          onClick={handleOutsideClick}
          initial={{ opacity: 0, }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 flex justify-end items-start z-50 pt-24"
        >
          <motion.div
            className="relative w-full max-w-md mr-10"
            style={{ perspective: 1000 }}
            animate={{ height: flipped ? 650 : 520 }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0"
              style={{ transformStyle: "preserve-3d" }}
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* LOGIN PAGE */}
              <div
                className={`absolute inset-0 rounded-xl p-6 shadow-xl ${cardBackground} dark:border dark:border-gray-700 dark:shadow-[0_0_15px_rgba(0,0,0,0.6)]`}
                style={{ backfaceVisibility: "hidden" }}
              >
                <form onSubmit={handleLogin}>
                  <div className="mb-6 text-center">
                    <CardTitle className="font-bold text-[30px] dark:text-white">
                      Welcome Back
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Access your account
                    </CardDescription>
                  </div>

                  <label className="text-gray-700 dark:text-gray-300">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="mb-4 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={loginForm.email}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, email: e.target.value })
                    }
                    required
                  />

                  <label className="text-gray-700 dark:text-gray-300">Password</label>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    className="mb-4 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm({ ...loginForm, password: e.target.value })
                    }
                    required
                  />

                  <button
                    type="submit"
                    className={`w-full mb-2 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition ${buttonGradient}`}
                  >
                    Login
                  </button>

                  <p className={`flex justify-center text-slate-500 dark:text-gray-400 mt-4`}>
                    Don't have an account?
                    <button
                      type="button"
                      className={`ml-1 font-semibold ${linkColor}`}
                      onClick={() => setFlipped(true)}
                    >
                      Sign up
                    </button>
                  </p>
                </form>
              </div>

              {/* SIGNUP PAGE */}
              <div
                className={`absolute inset-0 rounded-xl p-6 shadow-xl overflow-y-auto ${cardBackground} dark:border dark:border-gray-700 `}
                style={{ transform: "rotateY(180deg)", backfaceVisibility: "hidden" }}
              >
                <form onSubmit={handleSignup}>
                  <div className="mb-6 text-center">
                    <CardTitle className="font-bold text-[30px] dark:text-white">
                      Create Account
                    </CardTitle>
                    <CardDescription className="dark:text-gray-300">
                      Join and manage bookings
                    </CardDescription>
                  </div>

                  <label className="text-gray-700 dark:text-gray-300">Full Name</label>
                  <Input
                    type="text"
                    placeholder="Enter your full name"
                    className="mb-4 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={signupForm.name}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, name: e.target.value })
                    }
                    required
                  />

                  <label className="text-gray-700 dark:text-gray-300">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    className="mb-4 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={signupForm.email}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, email: e.target.value })
                    }
                    required
                  />

                  <label className="text-gray-700 dark:text-gray-300">Password</label>
                  <Input
                    type="password"
                    placeholder="Create a password"
                    className="mb-4 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={signupForm.password}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, password: e.target.value })
                    }
                    required
                  />

                  <label className="text-gray-700 dark:text-gray-300">Phone</label>
                  <Input
                    type="text"
                    placeholder="Enter your phone number"
                    className="mb-4 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={signupForm.phone}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, phone: e.target.value })
                    }
                  />

                  <label className="text-gray-700 dark:text-gray-300">Location</label>
                  <Input
                    type="text"
                    placeholder="Enter your location"
                    className="mb-6 mt-2 dark:bg-gray-50 dark:text-white dark:border-gray-700 w-full"
                    value={signupForm.location}
                    onChange={(e) =>
                      setSignupForm({ ...signupForm, location: e.target.value })
                    }
                  />

                  <button
                    type="submit"
                    className={`w-full mb-2 py-2 rounded-lg font-semibold text-white hover:opacity-90 transition ${buttonGradient}`}
                  >
                    Sign Up
                  </button>

                  <p className={`flex justify-center text-slate-500 dark:text-gray-400 mt-4 `}>
                    Already have an account?
                    <button
                      type="button"
                      className={`ml-1 font-semibold ${linkColor}`}
                      onClick={() => setFlipped(false)}
                    >
                      Login
                    </button>
                  </p>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Login;
