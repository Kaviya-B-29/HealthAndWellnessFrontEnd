import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";

/**
 * Workouts page
 * - datalist for type (user can type new type)
 * - distance optional
 * - calories auto-estimate (MET-based) when not manually overridden
 * - manual override: if user edits calories input, auto-updates stop
 * - sends numeric `calories` field to backend (canonical)
 * - robust validation and console logs for debugging
 */

const WORKOUT_OPTIONS = [
  "Running",
  "Cycling",
  "Walking",
  "Strength Training",
  "Yoga",
  "HIIT",
  "Swimming",
  "Dancing",
];

const initialForm = () => ({
  type: "",
  duration: "", // minutes
  distance: "", // km optional
  calories: "", // numeric string (auto or manual)
  intensity: "Medium",
  date: new Date().toISOString().slice(0, 10),
});

export default function Workouts() {
  const [workouts, setWorkouts] = useState([]);
  const [form, setForm] = useState(initialForm());
  const [manualCalories, setManualCalories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState(null);

  // fetch list
  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await API.get("/workouts");
      setWorkouts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("fetchWorkouts:", err);
      setBanner({ type: "err", msg: "Failed to load workouts." });
    }
  };

  // simple MET estimator
  const estimateCalories = (type, duration, intensity) => {
    const MET = {
      Running: 10,
      Cycling: 8,
      Walking: 4,
      "Strength Training": 6,
      Yoga: 3,
      HIIT: 12,
      Swimming: 9,
      Dancing: 7,
    };
    const intensityFactor = intensity === "Low" ? 0.85 : intensity === "High" ? 1.15 : 1;
    const met = MET[type] || 5;
    // simplified formula (no body weight): calories ≈ MET * minutes * factor
    return Math.max(0, Math.round(met * (+duration || 0) * intensityFactor));
  };

  // auto-fill calories when type/duration/intensity change — only when user hasn't manually edited calories
  useEffect(() => {
    if (!manualCalories && form.type && form.duration) {
      const est = estimateCalories(form.type, form.duration, form.intensity);
      setForm((f) => ({ ...f, calories: est ? String(est) : "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.type, form.duration, form.intensity, manualCalories]);

  // validation
  const valid = useMemo(() => {
    if (!form.type) return false;
    if (!form.duration || isNaN(+form.duration) || +form.duration <= 0) return false;
    if (form.calories && (isNaN(+form.calories) || +form.calories < 0)) return false;
    // calories should either be filled manually or auto-populated
    if (!form.calories) return false;
    return true;
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // track manual edits for calories
    if (name === "calories") {
      // if user clears, we allow auto-fill again
      const isManual = value.trim() !== "";
      setManualCalories(isManual);
      setForm((f) => ({ ...f, calories: value }));
      return;
    }

    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!valid || saving) return;

    setSaving(true);
    setBanner(null);

    try {
      const payload = {
        type: form.type.trim(),
        duration: +form.duration,
        intensity: form.intensity,
        // distance optional
        ...(form.distance ? { distance: +form.distance } : {}),
        // canonical field name "calories" numeric
        calories: form.calories ? +form.calories : 0,
        date: form.date,
      };

      console.log("POST /api/workouts payload:", payload);
      const res = await API.post("/workouts", payload);
      console.log("POST response:", res?.data);

      setForm(initialForm());
      setManualCalories(false);
      await fetchWorkouts();
      setBanner({ type: "ok", msg: "Workout added." });
    } catch (err) {
      console.error("onSubmit error:", err);
      setBanner({ type: "err", msg: err?.response?.data?.message || "Failed to add workout." });
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
    } catch (err) {
      console.error("delete error:", err);
      setBanner({ type: "err", msg: err?.response?.data?.message || "Failed to delete workout." });
    }
  };

  // read calories from response tolerantly
  const getCaloriesFrom = (w) => Number(w.calories ?? w.caloriesBurned ?? 0);

  const totalCalories = workouts.reduce((s, w) => s + getCaloriesFrom(w), 0);
  const totalMinutes = workouts.reduce((s, w) => s + Number(w.duration || 0), 0);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Workouts</h1>

      {banner && (
        <div
          className={`p-2 rounded ${
            banner.type === "ok" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
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

      {/* Form */}
      <form onSubmit={onSubmit} className="grid md:grid-cols-5 gap-3 bg-white p-4 rounded-xl shadow">
        <input
          list="workoutOptions"
          name="type"
          value={form.type}
          onChange={handleChange}
          placeholder="Select or type a workout"
          className="border rounded p-2 md:col-span-2"
          required
        />
        <datalist id="workoutOptions">
          {WORKOUT_OPTIONS.map((o) => (
            <option key={o} value={o} />
          ))}
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

        <input
          name="distance"
          placeholder="Distance (km) (optional)"
          value={form.distance}
          onChange={handleChange}
          className="border rounded p-2"
          inputMode="decimal"
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
          name="calories"
          placeholder="Calories (auto)"
          value={form.calories}
          onChange={handleChange}
          className={`border rounded p-2 ${manualCalories ? "bg-white" : "bg-gray-50"}`}
          inputMode="numeric"
          title={manualCalories ? "Manual calories (you edited this field)" : "Auto estimated calories"}
        />

        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          className="border rounded p-2 md:col-span-2"
        />

        <button
          disabled={!valid || saving}
          className="md:col-span-5 bg-indigo-600 text-white rounded p-2 hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Add Workout"}
        </button>
      </form>

      {/* List */}
      <div className="space-y-2">
        {workouts.map((w) => (
          <div key={w._id} className="bg-white p-3 rounded-xl shadow flex justify-between items-center">
            <div>
              <div className="font-semibold">
                {w.type} — {w.duration} min
              </div>
              <div className="text-sm text-gray-600">
                {w.distance ? `${w.distance} km • ` : ""}
                {getCaloriesFrom(w)} kcal
              </div>
              <div className="text-xs text-gray-400">
                {w.date || w.createdAt ? new Date(w.date || w.createdAt).toLocaleString() : ""}
              </div>
            </div>
            <button onClick={() => onDelete(w._id)} className="text-red-600 text-sm hover:underline">
              Delete
            </button>
          </div>
        ))}

        {workouts.length === 0 && <div className="text-sm text-gray-500">No workouts yet.</div>}
      </div>
    </div>
  );
}
