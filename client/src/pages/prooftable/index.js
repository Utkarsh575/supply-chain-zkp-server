"use client";

import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function ProofTable() {
  const [proofs, setProofs] = useState([]);
  const [qrUrl, setQrUrl] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/get-proof-status");
        const data = await response.json();
        if (data.success) {
          setProofs(data.proofs);
        }
      } catch (error) {
        console.error("Error fetching proofs:", error);
      }
    };

    fetchProofs();
  }, []);

  const handleViewQR = (proofHash) => {
    setQrUrl(`http://localhost:3000/api/verify/hashed/${String(proofHash)}`);
    setShowModal(true);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById("qrCodeCanvas");
    const pngUrl = canvas.toDataURL("image/png");
    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "QRCode.png";
    downloadLink.click();
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-bold mb-4 text-black">Proof Data</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300 text-black">
          <thead>
            <tr className="bg-gray-100 text-black">
              {["Proof ID", "Farm ID", "Batch ID", "Grade", "MFG Date", "Expiry Date", "Status", "QR"].map((header) => (
                <th key={header} className="px-4 py-2 border text-black">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {proofs.map((proof) => (
              <tr key={proof.proofId} className="border text-black">
                <td className="px-4 py-2 border">{proof.proofId}</td>
                <td className="px-4 py-2 border">{proof.farmData.farmId}</td>
                <td className="px-4 py-2 border">{proof.farmData.batchId}</td>
                <td className="px-4 py-2 border">{proof.farmData.grade}</td>
                <td className="px-4 py-2 border">{proof.manufacturingData?.mfgDate || "N/A"}</td>
                <td className="px-4 py-2 border">{proof.manufacturingData?.expiryDate || "N/A"}</td>
                <td className="px-4 py-2 border">{proof.status}</td>
                <td className="px-4 py-2 border">
                  <button
                    className={`px-3 py-1 rounded ${
                      proof.status === "proof_generated"
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-400 text-gray-700 cursor-not-allowed"
                    }`}
                    onClick={() => handleViewQR(proof.hashedProofId)}
                    disabled={proof.status !== "proof_generated"}
                  >
                    View QR
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* QR Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative">
            <h3 className="text-lg font-semibold mb-2 text-black">QR Code</h3>
            <QRCodeCanvas id="qrCodeCanvas" value={qrUrl} size={200} />
            <div className="mt-4">
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mr-2"
                onClick={handleDownloadQR}
              >
                Download QR
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
