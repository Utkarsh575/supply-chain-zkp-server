"use client";

import { useState } from "react";
import ProofTable from "../prooftable";

export default function FarmerForm() {
  const [formData, setFormData] = useState({
    farmId: "",
    plusCode: "",
    batchId: "",
    grade: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3000/api/submit-farm-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.success) {
        setMessage("Farm data submitted successfully!");
      } else {
        setMessage("Submission failed.");
      }
    } catch (error) {
      setMessage("Error submitting data.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-xl font-bold mb-4 text-black">Submit Farm Data</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["farmId", "plusCode", "batchId", "grade"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={formData[field]}
              onChange={handleChange}
              placeholder={field}
              className="w-full p-2 border rounded-md text-black"
              required
            />
          ))}
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600" disabled={loading}>
            {loading ? "Submitting..." : "Submit"}
          </button>
          {message && <p className="text-center text-sm mt-2 text-black">{message}</p>}
        </form>
      </div>

      {/* Proof Table */}
      <ProofTable />
    </div>
  );
}
