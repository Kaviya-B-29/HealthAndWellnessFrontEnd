import React, { useEffect, useState } from "react";
import { getProgress } from "../services/progressService";
import API from "../api/axios";

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    targetCalories: "",
    targetWorkoutMinutes: "",
  });

  const standardTargets = {
    Daily: {
      "Weight Loss": { calories: 1800, minutes: 45 },
      "Weight Gain": { calories: 2800, minutes: 30 },
      "General Fitness": { calories: 2200, minutes: 40 },
    },
    Weekly: {
      "Weight Loss": { calories: 1800 * 7, minutes: 45 * 7 },
      "Weight Gain": { calories: 2800 * 7, minutes: 30 * 7 },
      "General Fitness": { calories: 2200 * 7, minutes: 40 * 7 },
    },
    Monthly: {
      "Weight Loss": { calories: 1800 * 30, minutes: 45 * 30 },
      "Weight Gain": { calories: 2800 * 30, minutes: 30 * 30 },
      "General Fitness": { calories: 2200 * 30, minutes: 40 * 30 },
    },
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const res = await API.get("/goals");
      let goalsData = Array.isArray(res.data) ? res.data : [];

      const daily = await getProgress("Daily");
      const weekly = await getProgress("Weekly");
      const monthly = await getProgress("Monthly");

      goalsData = goalsData.map((goal) => {
        const prog =
          goal.type === "Daily"
            ? daily
            : goal.type === "Weekly"
            ? weekly
            : monthly;

        const autoCompleted =
          (goal.targetCalories > 0 ? (goal.category === "Weight Gain" ? prog.consumed : prog.burned) >= goal.targetCalories : true) &&
          (goal.targetWorkoutMinutes > 0 ? prog.minutes >= goal.targetWorkoutMinutes : true);

        const completed = goal.manualCompleted !== undefined ? goal.manualCompleted : autoCompleted;

        return { ...goal, progress: prog, autoCompleted, completed };
      });

      setGoals(goalsData);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "category" && formData.type) {
      const target = standardTargets[formData.type][value];
      setFormData((prev) => ({
        ...prev,
        category: value,
        targetCalories: prev.targetCalories || target.calories,
        targetWorkoutMinutes: prev.targetWorkoutMinutes || target.minutes,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.type || !formData.category) {
      alert("Please select goal type and category.");
      return;
    }

    try {
      await API.post("/goals", {
        type: formData.type,
        category: formData.category,
        targetCalories: Number(formData.targetCalories),
        targetWorkoutMinutes: Number(formData.targetWorkoutMinutes),
        createdAt: new Date(),
      });

      setFormData({
        type: "",
        category: "",
        targetCalories: "",
        targetWorkoutMinutes: "",
      });

      fetchGoals();
    } catch (err) {
      console.error("Failed to add goal:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/goals/${id}`);
      fetchGoals();
    } catch (err) {
      console.error("Failed to delete goal", err);
    }
  };

  const toggleManualComplete = (goalId) => {
    setGoals((prevGoals) =>
      prevGoals.map((g) => {
        if (g._id === goalId) {
          const updated = { ...g, manualCompleted: !g.manualCompleted };
          API.patch(`/goals/${goalId}`, { manualCompleted: updated.manualCompleted }).catch((err) =>
            console.error("Failed to update manual completion", err)
          );
          return updated;
        }
        return g;
      })
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6"style={{ backgroundImage: "url('/assets/bg.png')"}}>
      <h2 className="text-2xl font-bold">My Goals</h2>

      {/* Add Goal Form */}
      <form onSubmit={handleSubmit} className="bg-white shadow rounded-xl p-4 space-y-3">
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select Goal Type</option>
          <option value="Daily">Daily Goal</option>
          <option value="Weekly">Weekly Goal</option>
          <option value="Monthly">Monthly Goal</option>
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full border rounded p-2"
        >
          <option value="">Select Category</option>
          <option value="Weight Loss">Weight Loss</option>
          <option value="Weight Gain">Weight Gain</option>
          <option value="General Fitness">General Fitness</option>
        </select>

        <input
          type="number"
          name="targetCalories"
          placeholder="Target Calories"
          value={formData.targetCalories}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <input
          type="number"
          name="targetWorkoutMinutes"
          placeholder="Target Workout Minutes"
          value={formData.targetWorkoutMinutes}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700"
        >
          Add Goal
        </button>
      </form>
    {/* Completed goals summary */}
  <p className="text-gray-700 font-medium">
    Completed Goals: {goals.filter(g => g.completed || g.manualCompleted).length} / {goals.length}
  </p>

      {/* Goals List */}
      <div className="bg-white shadow rounded-xl p-4" >
        <h3 className="text-lg font-semibold mb-3">Your Goals</h3>
        {goals.length === 0 ? (
          <p className="text-gray-500">No goals yet.</p>
        ) : (
          <ul className="space-y-4">
            {goals.map((goal) => {
              const completed =
                goal.manualCompleted !== undefined ? goal.manualCompleted : goal.autoCompleted;

              const percentCalories =
                goal.targetCalories > 0
                  ? Math.min((goal.category === "Weight Gain" ? goal.progress.consumed : goal.progress.burned) /
                      goal.targetCalories *
                      100, 100)
                  : 0;

              const percentWorkout =
                goal.targetWorkoutMinutes > 0
                  ? Math.min((goal.progress.minutes / goal.targetWorkoutMinutes) * 100, 100)
                  : 0;

              return (
                <li
                  key={goal._id}
                  className="p-3 border rounded-lg flex flex-col space-y-2"
                  style={{ backgroundImage: "url('/assets/bg.png')"}}
                >
                  <div className="flex justify-between items-center">
                    <p className="font-medium">
                      {goal.type} Goal – {goal.category}
                    </p>
                    <button
                      onClick={() => handleDelete(goal._id)}
                      className="text-red-500 text-sm"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Calories Burned */}
                  {(goal.category === "Weight Loss" || goal.category === "General Fitness") && goal.targetCalories > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Calories Burned: {goal.manualCompleted ? goal.targetCalories : goal.progress.burned} / {goal.targetCalories} kcal
                      </p>
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-green-500 h-2 rounded"
                          style={{ width: goal.manualCompleted ? '100%' : `${Math.min((goal.progress.burned / goal.targetCalories) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Calories Consumed */}
                  {(goal.category === "Weight Gain" || goal.category === "General Fitness") && goal.targetCalories > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Calories Consumed: {goal.manualCompleted ? goal.targetCalories : goal.progress.consumed} / {goal.targetCalories} kcal
                      </p>
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-orange-500 h-2 rounded"
                          style={{ width: goal.manualCompleted ? '100%' : `${Math.min((goal.progress.consumed / goal.targetCalories) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Workout Minutes */}
                  {goal.category === "General Fitness" && goal.targetWorkoutMinutes > 0 && (
                    <div>
                      <p className="text-xs text-gray-600 mb-1">
                        Workout Minutes: {goal.manualCompleted ? goal.targetWorkoutMinutes : goal.progress.minutes} / {goal.targetWorkoutMinutes} mins
                      </p>
                      <div className="w-full bg-gray-200 rounded h-2">
                        <div
                          className="bg-blue-500 h-2 rounded"
                          style={{ width: goal.manualCompleted ? '100%' : `${Math.min((goal.progress.minutes / goal.targetWorkoutMinutes) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center mt-2">
                    <p className={`text-xs font-bold ${completed ? "text-green-600" : "text-red-600"}`}>
                      {completed ? "Completed" : "In Progress"}
                    </p>
                    <button
                      onClick={() => toggleManualComplete(goal._id)}
                      className="text-xs px-2 py-1 rounded bg-blue-500 text-white hover:bg-blue-600"
                    >
                      {completed ? "Mark as Incomplete" : "Mark as Completed"}
                    </button>
                  </div>

                  <p className="text-gray-400 text-xs mt-1">
                    Created: {new Date(goal.createdAt).toLocaleDateString()}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
