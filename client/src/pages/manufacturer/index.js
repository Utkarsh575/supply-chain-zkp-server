"use client";

import { useState } from "react";
import ProofTable from "../prooftable";

export default function ManufacturerForm() {
  const [formData, setFormData] = useState({
    proofId: "",
    batchId: "",
    mfgDate: "",
    expiryDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mfgDate" || name === "expiryDate") {
      // Convert the date to timestamp when date is selected
      const timestamp = new Date(value).getTime() / 1000; // Convert to seconds
      setFormData((prev) => ({
        ...prev,
        [name]: timestamp.toString(),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        `http://localhost:3000/api/add-manufacturing-data/${formData.proofId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            batchId: Number(formData.batchId), // Ensure batchId is a number
            mfgDate: Number(formData.mfgDate), // Ensure mfgDate is a number
            expiryDate: Number(formData.expiryDate), // Ensure expiryDate is a number
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        setMessage("Manufacturing data added successfully!");
        setMessageType("success");
        // Reload the page after 1 second on successful submission
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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

  // Function to convert timestamp to YYYY-MM-DD format for date input
  const timestampToDateValue = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(Number(timestamp) * 1000);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="w-full max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Submit Manufacturer Data
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="proofId"
              className="block text-sm font-medium text-gray-700"
            >
              Proof ID
            </label>
            <input
              id="proofId"
              type="text"
              name="proofId"
              value={formData.proofId}
              onChange={handleChange}
              placeholder="Enter proof ID"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="batchId"
              className="block text-sm font-medium text-gray-700"
            >
              Batch ID
            </label>
            <input
              id="batchId"
              type="number"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              placeholder="Enter batch ID"
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="mfgDate"
              className="block text-sm font-medium text-gray-700"
            >
              Manufacturing Date
            </label>
            <input
              id="mfgDate"
              type="date"
              name="mfgDate"
              value={timestampToDateValue(formData.mfgDate)}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="expiryDate"
              className="block text-sm font-medium text-gray-700"
            >
              Expiry Date
            </label>
            <input
              id="expiryDate"
              type="date"
              name="expiryDate"
              value={timestampToDateValue(formData.expiryDate)}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-md text-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full p-3 rounded-md text-white font-medium transition-colors ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:bg-green-800"
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
        <ProofTable />
      </div>
    </div>
  );
}
