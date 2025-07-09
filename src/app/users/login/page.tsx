"use client";

import { useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { FaUser, FaLock } from "react-icons/fa";

export default function UserLoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    setError("");
    setLoading(true);

    if (!username || !password) {
      setError("Username dan password wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      console.log("Memulai query ke Firestore...");
      const q = query(
        collection(db, "users"),
        where("username", "==", username),
        where("password", "==", password)
      );
      const snapshot = await getDocs(q);
      console.log("Hasil query:", snapshot.docs);

      if (snapshot.empty) {
        console.log("Snapshot kosong");
        setError("Akun tidak ditemukan atau password salah.");
        setLoading(false);
        return;
      }

      const userDoc = snapshot.docs[0];
      const userId = userDoc.id;
      const data = userDoc.data();

      console.log("User ID:", userId);
      console.log("User data:", data);

      if (data.hasVoted) {
        console.log("Sudah voting, redirect ke /thanks");
        router.push(`/users/thanks?userId=${userId}`);
      } else {
        console.log("Belum voting, redirect ke /vote");
        router.push(`/users/vote?userId=${userId}`);
      }
    } catch (error) {
      console.error("Error saat login:", error);
      setError("Terjadi kesalahan saat login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center px-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-md md:max-w-lg transition-transform duration-300 hover:scale-[1.02]">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-8 flex items-center justify-center gap-2">
          <span className="text-blue-600">🗳️</span> Login Pemilih
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <strong className="font-bold">Oops!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Username Input */}
        <div className="mb-5">
          <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
            Username
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
            <FaUser className="text-gray-400 mr-2" />
            <input
              type="text"
              id="username"
              placeholder="Masukkan username"
              className="w-full focus:outline-none text-gray-800 placeholder-gray-400"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        {/* Password Input */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
          <div className="flex items-center border border-gray-300 rounded-lg px-4 py-2 bg-white focus-within:ring-2 focus-within:ring-blue-500">
            <FaLock className="text-gray-400 mr-2" />
            <input
              type="password"
              id="password"
              placeholder="Masukkan password"
              className="w-full focus:outline-none text-gray-800 placeholder-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            />
          </div>
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className={`w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Memuat..." : "Masuk"}
        </button>
      </div>
    </div>
  );
}
