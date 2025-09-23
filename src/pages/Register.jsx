import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import registerImg from "../assets/register.png"; 

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await register(name, email, password);
      nav("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <section className="bg-gradient-to-bl from-violet-800 to-pink-500 min-h-screen flex items-center justify-center">
      {/* Card */}
      <div className="flex flex-col lg:flex-row w-9/10 md:w-4/5 lg:w-2/3 min-h-[650px] bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Left: Image */}
        <div className="lg:w-1/2 h-96 lg:h-auto">
          <img
            src={registerImg}
            alt="Register Illustration"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
          <div className="w-full max-w-md">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
              Create Account
            </h2>

            {error && (
              <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={submit} className="space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
                required
              />

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3 border border-gray-200 rounded-xl focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition pr-16"
                  required
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-pink-500 hover:to-purple-500 text-white py-3 rounded-xl shadow-lg transition-all duration-300 font-semibold">
                Register
              </button>
            </form>

            <p className="mt-6 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link
                className="text-purple-600 font-medium hover:underline"
                to="/login"
              >
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
