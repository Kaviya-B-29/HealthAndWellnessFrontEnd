import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section
        className="relative bg-no-repeat min-h-[600px] text-white"
        style={{ backgroundImage: "url('/assets/hero2.jpg')" }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        <div className="relative max-w-7xl mx-auto px-6 py-24 flex flex-col items-center md:items-start text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl">
            Your Health, Your Wellness, Your Journey
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mb-8">
            Track your workouts, nutrition, goals, and mental health all in one
            place. Get insights, reminders, and personalized feedback to stay on
            top of your wellness journey.
          </p>
          <div className="flex gap-4">
            <Link
              to="/register"
              className="bg-white text-purple-700 font-semibold px-6 py-3 rounded-lg shadow hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="border border-white px-6 py-3 rounded-lg shadow hover:bg-purple-700 transition"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-10">
        {[
          {
            src: "/assets/workout.avif",
            title: "Workout Tracking",
            desc: "Log your exercises, track your performance, and stay motivated with weekly and monthly progress charts.",
          },
          {
            src: "assets/nutrition.jpg",
            title: "Nutrition Logging",
            desc: "Monitor your meals and calorie intake. Understand your macro balance to build healthier eating habits.",
          },
          {
            src: "assets/mentalhealth.jpg",
            title: "Mental Health",
            desc: "Track your moods, reflect daily, and receive gentle reminders to keep your mental wellness in balance.",
          },
        ].map((item, idx) => (
          <div
            key={idx}
            className="bg-white shadow rounded-xl p-6 hover:shadow-lg transition"
          >
            <img
              src={item.src}
              alt={item.title}
              className="rounded-lg mb-4 w-full h-48 object-cover"
            />
            <h3 className="text-xl font-bold mb-2 text-purple-700">
              {item.title}
            </h3>
            <p className="text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Call to Action */}
      <section className="bg-purple-700 text-white py-16">
        <div className="max-w-3xl mx-auto text-center space-y-6 px-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to take control of your health?
          </h2>
          <p className="text-lg text-purple-100">
            Sign up today and start tracking your journey toward a healthier and
            happier lifestyle. It’s simple, free, and personalized just for you.
          </p>
          <Link
            to="/register"
            className="inline-block bg-white text-purple-700 font-semibold px-8 py-3 rounded-lg shadow hover:bg-gray-100 transition"
          >
            Join Now
          </Link>
        </div>
      </section>
    </div>
  );
}
