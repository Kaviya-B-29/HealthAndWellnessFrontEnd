# Health & Wellness App - Frontend

This repository contains the frontend for the Health & Wellness Tracking System.  
The frontend is built using React (Vite) and Tailwind CSS.  
It provides an interactive user interface for managing workouts, nutrition, mental health logs, goals, and viewing analytics.

---

## System Features
-------------------
- User registration and login
- Dashboard with summary statistics and charts
- Add, view, and delete entries for:
  - Workouts
  - Food logs
  - Mental health logs
  - Goals
- History page with detailed insights and overall health evaluation
- Notifications and reminders
- Responsive design with Tailwind CSS
- Integration with backend REST API
--------------------
## Project Structure
--------------------
HealthAppFrontEnd/
├── src/
│ ├── api/ # Axios instance for API calls
│ │ └── axios.js
│ ├── components/ # Reusable UI components
│ │ ├── Navbar.jsx
│ │ ├── MetricCard.jsx
│ │ └── charts/
│ │ ├── WeeklyWorkoutChart.jsx
│ │ ├── MacroDoughnut.jsx
│ │ └── MoodBar.jsx
│ ├── context/ # Authentication context
│ │ └── AuthContext.jsx
│ ├── pages/ # Application pages
│ │ ├── Dashboard.jsx
│ │ ├── History.jsx
│ │ ├── Nutrition.jsx
│ │ ├── MentalHealth.jsx
│ │ ├── Goals.jsx
│ │ ├── Workouts.jsx
│ │ ├── Profile.jsx
│ │ ├── Login.jsx
│ │ └── Register.jsx
│ ├── App.jsx # Main application routes
│ ├── main.jsx # Entry point for React
│ └── index.css # Global styles with Tailwind
├── package.json
└── vite.config.js
