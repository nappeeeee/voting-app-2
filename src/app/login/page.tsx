"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Tambahkan state loading untuk tombol

  const handleLogin = async () => {
    setError(""); // Reset error message
    setLoading(true); // Mulai loading
    try {
      const adminRef = collection(db, "admins");
      const q = query(
        adminRef,
        where("username", "==", username),
        where("password", "==", password)
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        document.cookie = "adminSession=true; path=/"; // Tambahkan path=/ untuk ketersediaan cookie di seluruh situs
        router.push("/admin/dashboard");
      } else {
        setError("Username atau password salah. Silakan coba lagi.");
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("Terjadi kesalahan saat login. Mohon coba beberapa saat lagi.");
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="bg-white p-10 rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300 hover:scale-105">
        <h2 className="text-3xl font-extrabold text-gray-800 mb-8 text-center flex items-center justify-center gap-3">
          <span className="text-indigo-600">🔐</span> Login Admin
        </h2>

        {error && (
          <div
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6"
            role="alert"
          >
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        <div className="mb-5">
          <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
            Username
          </label>
          <input
            type="text"
            id="username"
            placeholder="Masukkan username Anda"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => {
                if (e.key === 'Enter') handleLogin();
            }}
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
          <input
            type="password"
            id="password"
            placeholder="Masukkan password Anda"
            className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-800 placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => {
                if (e.key === 'Enter') handleLogin();
            }}
          />
        </div>
        <button
          onClick={handleLogin}
          disabled={loading} // Disable button saat loading
          className={`w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Memuat..." : "Masuk"}
        </button>
      </div>
    </div>
  );
}