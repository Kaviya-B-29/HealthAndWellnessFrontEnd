import React, { useEffect, useMemo, useState } from "react";
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
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/workouts");
      setWorkouts(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error(e);
      setBanner({ type: "err", msg: "Failed to load workouts." });
    }
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

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
    return Math.round(met * duration * intensityFactor);
  };

  const valid = useMemo(() => {
    const { type, duration, intensity } = form;
    if (!type || !duration || !intensity) return false;
    if (isNaN(+duration) || +duration <= 0) return false;
    if (
      form.caloriesBurned &&
      (isNaN(+form.caloriesBurned) || +form.caloriesBurned <= 0)
    )
      return false;
    return true;
  }, [form]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;
    setSaving(true);
    setBanner(null);
    try {
      let calories = form.caloriesBurned;
      if (!calories && form.type && form.duration) {
        calories = estimateCalories(form.type, +form.duration, form.intensity);
      }

      await API.post("/workouts", {
        type: form.type.trim(),
        duration: +form.duration,
        intensity: form.intensity,
        caloriesBurned: +calories,
        date: form.date,
      });

      setForm({
        type: "",
        duration: "",
        intensity: "Medium",
        caloriesBurned: "",
        date: new Date().toISOString().slice(0, 10),
      });
      await fetchWorkouts();
      setBanner({ type: "ok", msg: "Workout added." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to add workout.",
      });
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async (id) => {
    if (!id) return;
    if (!confirm("Delete this workout?")) return;
    try {
      await API.delete(`/workouts/${id}`);
      setWorkouts((list) => list.filter((w) => w._id !== id));
      setBanner({ type: "ok", msg: "Workout deleted." });
    } catch (e) {
      console.error(e);
      setBanner({
        type: "err",
        msg: e?.response?.data?.message || "Failed to delete workout.",
      });
    }
  };

  const totalCalories = workouts.reduce(
    (s, w) => s + (w.caloriesBurned || 0),
    0
  );
  const totalMinutes = workouts.reduce((s, w) => s + (w.duration || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workouts</h1>

      {banner && (
        <div
          className={`p-2 rounded ${
            banner.type === "ok"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {banner.msg}
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-3 rounded-lg text-center">
          <p className="text-lg font-bold">{totalMinutes} min</p>
          <p className="text-sm text-gray-700">Total Duration</p>
        </div>
        <div className="bg-yellow-100 p-3 rounded-lg text-center">
          <p className="text-lg font-bold">{totalCalories} kcal</p>
          <p className="text-sm text-gray-700">Calories Burned</p>
        </div>
      </div>

      {/* Add Workout Form */}
      <form
        onSubmit={onSubmit}
        className="grid md:grid-cols-2 gap-3 bg-white p-4 rounded-xl shadow"
      >
        <input
          list="workoutOptions"
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Select or type a workout"
          className="border rounded p-2"
          required
        />
        <datalist id="workoutOptions">
          <option value="Running" />
          <option value="Cycling" />
          <option value="Walking" />
          <option value="Strength Training" />
          <option value="Yoga" />
          <option value="HIIT" />
          <option value="Swimming" />
          <option value="Dancing" />
        </datalist>

        <input
          name="duration"
          placeholder="Duration (min)"
          value={form.duration}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
          required
        />

        <select
          name="intensity"
          value={form.intensity}
          onChange={handleChange}
          className="border rounded p-2"
        >
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>

        <input
          name="caloriesBurned"
          placeholder="Calories (optional)"
          value={form.caloriesBurned}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="numeric"
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border rounded p-2"
        />

        <button
          disabled={!valid || saving}
          className="md:col-span-2 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Workout"}
        </button>
      </form>

      {/* Workouts List */}
      <div className="bg-white shadow rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Your Workouts</h3>
        {workouts.length === 0 ? (
          <p className="text-gray-500">No workouts logged yet.</p>
        ) : (
          <ul className="space-y-2">
            {workouts.map((w) => (
              <li
                key={w._id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>
                  {w.date?.slice(0, 10)} – {w.type} ({w.intensity}) –{" "}
                  {w.duration} min – {w.caloriesBurned} kcal
                </span>
                <button
                  onClick={() => onDelete(w._id)}
                  className="text-red-600 text-sm hover:underline"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
