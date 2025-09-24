import API from "../api/axios";

function inTimeline(dateStr, timeline) {
  const date = new Date(dateStr);
  const now = new Date();

  if (timeline === "Daily") {
    const d1 = date.toISOString().split("T")[0];
    const d2 = now.toISOString().split("T")[0];
    return d1 === d2;
  }

  if (timeline === "Weekly") {
    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 6);
    return date >= weekAgo && date <= now;
  }

  if (timeline === "Monthly") {
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }

  return false;
}

export async function getProgress(timeline) {
  try {
    const [workoutsRes, foodsRes] = await Promise.all([API.get("/workouts"), API.get("/foods")]);
    const workouts = workoutsRes.data;
    const foods = foodsRes.data;

    let burned = 0;
    let minutes = 0;
    let consumed = 0;

    workouts.forEach((w) => {
      if (inTimeline(w.date, timeline)) {
        burned += w.caloriesBurned ?? w.calories ?? 0;
        minutes += w.minutes ?? w.duration ?? 0;
      }
    });

    foods.forEach((f) => {
      if (inTimeline(f.date, timeline)) {
        consumed += f.caloriesConsumed ?? f.calories ?? 0;
      }
    });

    return { burned, minutes, consumed };
  } catch (err) {
    console.error("Error fetching progress:", err);
    return { burned: 0, minutes: 0, consumed: 0 };
  }
}
