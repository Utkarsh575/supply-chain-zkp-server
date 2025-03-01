"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { QRCodeCanvas } from "qrcode.react";

export default function ProofTable() {
  const [proofs, setProofs] = useState([]);
  const [qrUrl, setQrUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const pathname = usePathname(); // Get current route

  useEffect(() => {
    const fetchProofs = async () => {
      try {
        const response = await fetch(
          "http://localhost:3000/api/get-proof-status"
        );
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
              <th className="px-4 py-2 border text-black">Proof ID</th>
              {pathname === "/farmer" && (
                <>
                  <th className="px-4 py-2 border text-black">Farm ID</th>
                  <th className="px-4 py-2 border text-black">Batch ID</th>
                </>
              )}
              <th className="px-4 py-2 border text-black">Grade</th>
              <th className="px-4 py-2 border text-black">MFG Date</th>
              <th className="px-4 py-2 border text-black">Expiry Date</th>
              <th className="px-4 py-2 border text-black">Status</th>
              <th className="px-4 py-2 border text-black">QR</th>
            </tr>
          </thead>
          <tbody>
            {proofs.length === 0 && (
              <tr>
                <td colSpan={pathname === "/farmer" ? 8 : 6} className="text-center p-4">
                  No proofs found.
                </td>
              </tr>
            )}
            {proofs.map((proof) => (
              <tr key={proof.proofId} className="border text-black">
                <td className="px-4 py-2 border">{proof.proofId}</td>
                {pathname === "/farmer" && (
                  <>
                    <td className="px-4 py-2 border">{proof.farmData.farmId}</td>
                    <td className="px-4 py-2 border">{proof.farmData.batchId}</td>
                  </>
                )}
                <td className="px-4 py-2 border">{proof.farmData.grade}</td>
                <td className="px-4 py-2 border">
                  {proof.manufacturingData?.mfgDate || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  {proof.manufacturingData?.expiryDate || "N/A"}
                </td>
                <td className="px-4 py-2 border">
                  <span
                    className={`px-2 py-1 rounded font-semibold text-sm ${
                      proof.status === "proof_generated"
                        ? "bg-green-200 text-green-800"
                        : proof.status === "pending_manufacturer"
                        ? "bg-yellow-200 text-yellow-800"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {proof.status}
                  </span>
                </td>
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
