"use client";

import { useState } from "react";
import jsQR from "jsqr";

export default function VerifyProof() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const decodeQR = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const image = new Image();
        image.src = event.target.result;
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(image, 0, 0, image.width, image.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, canvas.width, canvas.height);

          if (qrCode) {
            resolve(qrCode.data);
          } else {
            reject("No QR code detected.");
          }
        };
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVerify = async () => {
    if (!selectedFile) {
      setError("Please select a QR code image.");
      return;
    }

    setLoading(true);
    try {
      const qrUrl = await decodeQR(selectedFile);
      const response = await fetch(qrUrl);
      const data = await response.json();
      setVerificationData(data);
    } catch (err) {
      setError("Invalid QR code or verification failed.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <div className="max-w-md w-full p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-gray-700 text-center">Verify Proof</h2>

        <div className="mb-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="fileInput"
          />
          <label
            htmlFor="fileInput"
            className="w-full block text-center bg-blue-500 text-white font-semibold py-2 px-4 rounded-md cursor-pointer hover:bg-blue-600"
          >
            Select QR Code Image
          </label>
          {selectedFile && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Selected: <span className="font-medium text-gray-800">{selectedFile.name}</span>
            </p>
          )}
        </div>

        <button
          className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition disabled:bg-gray-400"
          onClick={handleVerify}
          disabled={loading}
        >
          {loading ? "Verifying..." : "Verify QR"}
        </button>

        {error && <p className="text-red-500 text-center mt-2">{error}</p>}

        {verificationData && (
          <div className="mt-6 p-4 bg-gray-100 rounded-lg text-gray-700 shadow-md">
            <h3 className="text-lg font-bold mb-2 text-green-600">Verification Result</h3>
            <p><strong>Success:</strong> {verificationData.success ? "✅ Yes" : "❌ No"}</p>
            <p><strong>Valid:</strong> {verificationData.isValid ? "✅ Yes" : "❌ No"}</p>
            <p><strong>Message:</strong> {verificationData.verificationResult}</p> 
            <p><strong>Expiry Date:</strong> {verificationData.expiryDate}</p>
            <p><strong>Generated At:</strong> {verificationData.proofGeneratedAt}</p>
          </div>
        )}
      </div>
    </div>
  );
}
