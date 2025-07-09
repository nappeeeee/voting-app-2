"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  getDoc,
} from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

interface Candidate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export default function VotePage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  useEffect(() => {
    const fetchUserAndCandidates = async () => {
      if (!userId) {
        router.push("/users/login");
        return;
      }

      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        router.push("/users/login");
        return;
      }

      const userData = userDoc.data();
      setUsername(userData.username || "User");

      if (userData.hasVoted === true) {
        router.push(`/users/thanks?id=${userId}`);
        return;
      }

      const snapshot = await getDocs(collection(db, "candidates"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Candidate[];

      setCandidates(data);
      setLoading(false);
    };

    fetchUserAndCandidates();
  }, [userId]);

  const handleSelect = (id: string) => {
    setError("");
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((sid) => sid !== id));
    } else {
      if (selectedIds.length >= 8) {
        setError("Anda hanya boleh memilih maksimal 8 kandidat.");
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleLogout = () => {
    router.push("/users/login");
  };

  const handleSubmit = async () => {
    setError("");
    if (selectedIds.length === 0) {
      setError("Silakan pilih minimal 1 kandidat.");
      return;
    }

    if (!userId) {
      setError("ID pengguna tidak ditemukan. Silakan login ulang.");
      router.push("/users/login");
      return;
    }

    setIsSubmitting(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        hasVoted: true,
        votes: selectedIds,
      });
      router.push(`/users/thanks?id=${userId}`);
    } catch (err) {
      console.error("Gagal menyimpan suara:", err);
      setError("Terjadi kesalahan saat menyimpan suara. Mohon coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (cand: Candidate) => {
    setSelectedCandidate(cand);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedCandidate(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Memuat data kandidat...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 sm:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl font-semibold text-gray-300 text-center sm:text-left flex items-center gap-2">
            👋 Hai, <span className="text-blue-400">{username}</span>!
          </h2>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:underline text-lg font-medium px-4 py-2 rounded-lg border border-red-400 hover:border-red-300 transition-colors duration-300"
          >
            Logout
          </button>
        </div>

        <h1 className="text-4xl font-extrabold text-white mb-8 text-center sm:text-left">
          Pilih <span className="text-yellow-400">Maksimal 8</span> Kandidat
        </h1>

        {error && (
          <div className="bg-red-700 bg-opacity-30 border border-red-500 text-red-300 px-6 py-4 rounded-lg relative mb-8 flex items-center gap-3" role="alert">
            <span className="text-2xl">⚠️</span>
            <span className="block sm:inline font-medium">{error}</span>
          </div>
        )}

        {/* Kandidat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {candidates.map((cand) => (
            <div
              key={cand.id}
              onClick={() => handleSelect(cand.id)}
              className={`relative cursor-pointer rounded-xl overflow-hidden shadow-lg border-4 transition-all duration-300 ease-in-out ${
                selectedIds.includes(cand.id)
                  ? "border-blue-500 ring-4 ring-blue-300 bg-blue-900 bg-opacity-30 transform scale-102"
                  : "border-gray-700 bg-gray-800 hover:border-gray-600 hover:shadow-xl"
              }`}
            >
              {selectedIds.includes(cand.id) && (
                <div className="absolute top-3 right-3 bg-blue-500 text-white rounded-full p-2 text-xl shadow-lg z-10">
                  ✅
                </div>
              )}
              <img
                src={cand.imageUrl}
                alt={cand.name}
                className="w-full h-48 object-cover rounded-t-xl"
              />
              <div className="p-5">
                <h2 className="text-2xl font-bold text-white mb-2 truncate">
                  {cand.name}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed line-clamp-3">
                  {cand.description}
                </p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails(cand);
                  }}
                  className="mt-2 text-blue-400 hover:underline text-sm"
                >
                  Lihat Selengkapnya
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Tombol Submit */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedIds.length === 0}
            className={`px-10 py-4 rounded-full text-2xl font-bold transition-all duration-300 ease-in-out shadow-lg transform hover:scale-105 ${
              isSubmitting || selectedIds.length === 0
                ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isSubmitting ? "Mengirim Pilihan..." : "Kirim Pilihan Anda"}
          </button>
        </div>
      </div>

      {/* Popup View */}
      {showPopup && selectedCandidate && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
          <div className="bg-white text-black rounded-lg max-w-md w-full p-6 relative shadow-xl">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-500 text-xl"
            >
              &times;
            </button>
            <img
              src={selectedCandidate.imageUrl}
              alt={selectedCandidate.name}
              className="w-full h-48 object-cover rounded mb-4"
            />
            <h2 className="text-2xl font-bold mb-2">{selectedCandidate.name}</h2>
            <p className="text-gray-700 whitespace-pre-wrap">
              {selectedCandidate.description}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
