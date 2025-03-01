import Image from "next/image";
import localFont from "next/font/local";
import { useRouter } from "next/router";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-8">
      {/* Hero Section */}
      <div className="text-center max-w-3xl">
        <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
          Supply Chain Verification using
        </h1>
        <h1 className="text-4xl font-extrabold text-gray-800 leading-tight">
          <span className="text-green-500">Zero Knowledge Proofs</span>
        </h1>
        <p className="mt-4 text-gray-600 text-lg">
          Ensuring transparency, authenticity, and trust in the supply chain through advanced cryptographic verification.
        </p>
      </div>

      {/* Role Selection */}
      <div className="flex gap-8 mt-10">
        <button
          className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-600 transition"
          onClick={() => router.push("/farmer")}
        >
          Farmer
        </button>
        <button
          className="px-6 py-3 bg-green-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-green-600 transition"
          onClick={() => router.push("/manufacturer")}
        >
          Manufacturer
        </button>
        <button
          className="px-6 py-3 bg-purple-500 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-purple-600 transition"
          onClick={() => router.push("/verify")}
        >
          Verify Proof
        </button>
      </div>

      {/* System Architecture Section */}
      <div className="mt-16 max-w-4xl text-center">
        {/* <h2 className="text-3xl font-bold text-gray-800">System Architecture</h2> */}
        <p className="mt-2 text-gray-600">A secure and transparent system for tracking product authenticity.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">Zero-Knowledge Proofs</h3>
            <p className="text-gray-600 mt-2">Utilizing zk-SNARKs and zk-STARKs for privacy-preserving verification.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">Blockchain Layer</h3>
            <p className="text-gray-600 mt-2">A decentralized ledger ensuring transparency and immutability.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">Verification API</h3>
            <p className="text-gray-600 mt-2">A robust API for checking proof validity in real time.</p>
          </div>
          <div className="p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-700">QR Code Authentication</h3>
            <p className="text-gray-600 mt-2">Seamless user experience for product verification via QR scanning.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
