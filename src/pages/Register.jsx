import React, { useEffect, useState } from "react";
import API from "../api/axios";

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState({
    type: "",
    duration: "",
    intensity: "Medium",
    caloriesBurned: "",
    date: new Date().toISOString().slice(0, 10),
  });

  // ✅ Estimate calories based on type, duration, intensity
  const estimateCalories = (type, duration, intensity) => {
    const MET_VALUES = {
      Running: 10,
      Cycling: 8,
      Walking: 4,
      "Strength Training": 6,
      Yoga: 3,
      HIIT: 12,
      Swimming: 9,
      Dancing: 7,
    };
    const intensityFactor =
      intensity === "Low" ? 0.8 : intensity === "High" ? 1.2 : 1;
    const met = MET_VALUES[type] || 5;
    return Math.round(met * duration * 1 * intensityFactor);
  };

  // ✅ Auto-update calories if user hasn’t typed a manual value
  useEffect(() => {
    if (form.type && form.duration && !form.caloriesBurned) {
      const estimated = estimateCalories(form.type, +form.duration, form.intensity);
      setForm((prev) => ({ ...prev, caloriesBurned: estimated }));
    }
  }, [form.type, form.duration, form.intensity]);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/workouts");
      setWorkouts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await API.post("/workouts", form);
      setForm({
        type: "",
        duration: "",
        intensity: "Medium",
        caloriesBurned: "",
        date: new Date().toISOString().slice(0, 10),
      });
      fetchWorkouts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* form + list here ... */}
    </div>
  );
}
