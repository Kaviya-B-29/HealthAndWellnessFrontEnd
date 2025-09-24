import { useState, useEffect } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user, token, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: "",
    height: "",
    weight: "",
    preference: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setFormData((prev) => ({
          ...prev,
          ...res.data,
          name: res.data.name || user?.name || "",
          email: res.data.email || user?.email || "",
        }));
      } catch (err) {
        console.error(err);
        setError("Failed to load profile.");
      }
    };

    fetchProfile();
  }, [token, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await axios.put("/users/profile", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedUser = res.data.user || res.data;

      setMessage("Profile updated successfully!");
      setFormData((prev) => ({ ...prev, ...updatedUser }));
      setUser(updatedUser);
    } catch (err) {
      console.error(err);
      setError("Error updating profile.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow rounded-xl space-y-6">
      <h2 className="text-2xl font-bold mb-4">My Profile</h2>

      {message && <p className="text-green-600">{message}</p>}
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Account Details Section */}
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold mb-3">Account Details</h3>
          <input
            type="text"
            name="name"
            value={formData.name || ""}
            readOnly
            className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed mb-3"
          />
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            readOnly
            className="w-full border rounded p-2 bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Personal Info Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
          <input
            type="number"
            name="age"
            placeholder="Age"
            value={formData.age || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-3"
          />
          <input
            type="number"
            name="height"
            placeholder="Height (cm)"
            value={formData.height || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-3"
          />
          <input
            type="number"
            name="weight"
            placeholder="Weight (kg)"
            value={formData.weight || ""}
            onChange={handleChange}
            className="w-full border rounded p-2 mb-3"
          />
          <select
            name="preference"
            value={formData.preference || ""}
            onChange={handleChange}
            className="w-full border rounded p-2"
          >
            <option value="">Select Preference</option>
            <option value="weight_loss">Weight Loss</option>
            <option value="muscle_gain">Muscle Gain</option>
            <option value="general_fitness">General Fitness</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default Profile;
