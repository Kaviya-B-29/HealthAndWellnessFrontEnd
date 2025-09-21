import API from "../api/axios";

// Helper to check if a log belongs to a timeline
function inTimeline(dateStr, timeline) {
  const now = new Date();
  const date = new Date(dateStr);

  if (timeline === "Daily") {
    return date.toDateString() === now.toDateString();
  }
  if (timeline === "Weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    return date >= weekAgo && date <= now;
  }
  if (timeline === "Monthly") {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  return false;
}

// Main function to aggregate progress
export async function getProgress(timeline) {
  const [workoutsRes, foodsRes] = await Promise.all([
    API.get("/workouts"),
    API.get("/foods"),
  ]);

  const workouts = workoutsRes.data;
  const foods = foodsRes.data;

  const filteredWorkouts = workouts.filter((w) => inTimeline(w.date, timeline));
  const filteredFoods = foods.filter((f) => inTimeline(f.date, timeline));

  return {
    burned: filteredWorkouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0),
    minutes: filteredWorkouts.reduce((sum, w) => sum + (w.minutes || 0), 0),
    consumed: filteredFoods.reduce((sum, f) => sum + (f.caloriesConsumed || 0), 0),
  };
}
