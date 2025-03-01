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
  const [messageType, setMessageType] = useState(""); // "success" or "error"
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Map grade letters to corresponding numeric values
  const gradeMapping = {
    A: "A",
    B: "B",
    C: "C",
    D: "D",
    E: "E",
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:3000/api/submit-farm-data",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage("Farm data submitted successfully!");
        setMessageType("success");
        setTimeout(() => {
          window.location.reload();
        }, 1000);
        // Trigger a refresh of the data
        setRefreshTrigger((prev) => prev + 1);
      } else {
        setMessage("Submission failed.");
        setMessageType("error");
      }
    } catch (error) {
      setMessage("Error submitting data.");
      setMessageType("error");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Submit Farm Data
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label
              htmlFor="farmId"
              className="block text-sm font-medium text-gray-700"
            >
              Farm ID
            </label>
            <input
              id="farmId"
              type="text"
              name="farmId"
              value={formData.farmId}
              onChange={handleChange}
              placeholder="Enter farm ID"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="plusCode"
              className="block text-sm font-medium text-gray-700"
            >
              Plus Code
            </label>
            <input
              id="plusCode"
              type="text"
              name="plusCode"
              value={formData.plusCode}
              onChange={handleChange}
              placeholder="Enter plus code"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="batchId"
              className="block text-sm font-medium text-gray-700"
            >
              Batch ID
            </label>
            <input
              id="batchId"
              type="text"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              placeholder="Enter batch ID"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-gray-700"
            >
              Grade
            </label>
            <select
              id="grade"
              name="grade"
              value={formData.grade}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
              required
            >
              <option value="" disabled>
                Select grade
              </option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-md text-white font-medium transition-colors ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
            }`}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Submitting...
              </div>
            ) : (
              "Submit"
            )}
          </button>

          {message && (
            <div
              className={`p-3 rounded-md text-center text-sm ${
                messageType === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Proof Table */}
      <div className="mt-8 w-full max-w-full">
        <ProofTable refreshTrigger={refreshTrigger} />
      </div>
    </div>
  );
}
