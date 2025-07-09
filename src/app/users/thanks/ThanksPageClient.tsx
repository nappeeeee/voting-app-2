"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";

interface Candidate {
  id: string;
  name: string;
  imageUrl: string;
}

export default function ThanksPage() {
  const [username, setUsername] = useState("");
  const [votedCandidates, setVotedCandidates] = useState<Candidate[]>([]);
  const [notVotedCandidates, setNotVotedCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");

  const handleLogout = () => {
    router.push("/users/login");
  };

  useEffect(() => {
    const fetchVotes = async () => {
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
      const userVotes: string[] = userData.votes || [];

      const snapshot = await getDocs(collection(db, "candidates"));
      const allCandidates = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        imageUrl: doc.data().imageUrl,
      }));

      const voted = allCandidates.filter((cand) =>
        userVotes.includes(cand.id)
      );
      const notVoted = allCandidates.filter(
        (cand) => !userVotes.includes(cand.id)
      );

      setVotedCandidates(voted);
      setNotVotedCandidates(notVoted);
      setLoading(false);
    };

    fetchVotes();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
        <p className="text-xl">Memuat data suara kamu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8 sm:p-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white text-center sm:text-left flex items-center gap-3">
            <span className="text-yellow-400 text-5xl">🎉</span> Terima Kasih,{" "}
            <span className="text-emerald-400">{username}</span>!
          </h1>
          <button
            onClick={handleLogout}
            className="text-red-400 hover:text-red-300 hover:underline text-lg font-medium px-4 py-2 rounded-lg border border-red-400 hover:border-red-300 transition-colors duration-300"
          >
            Logout
          </button>
        </div>

        <p className="mb-10 text-lg text-gray-300 text-center sm:text-left leading-relaxed">
          Voting Anda telah berhasil dicatat. Berikut adalah rekap hasil pilihan Anda:
        </p>

        {/* Yang Dipilih */}
        <section className="mb-12 p-6 bg-gradient-to-br from-emerald-800 to-green-900 rounded-xl shadow-lg border border-emerald-700">
          <h2 className="text-3xl font-bold mb-6 text-emerald-300 flex items-center gap-3">
            <span className="text-emerald-200">✅</span> Kandidat yang Anda Pilih:
          </h2>
          {votedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {votedCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="relative group bg-emerald-700 p-4 rounded-lg shadow-md border border-emerald-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <img
                    src={cand.imageUrl}
                    alt={cand.name}
                    className="w-full h-48 object-cover rounded-md mb-3 border-2 border-emerald-500 group-hover:border-emerald-300 transition-colors duration-300"
                  />
                  <p className="text-xl font-semibold text-white text-center truncate">
                    {cand.name}
                  </p>
                  <div className="absolute inset-0 bg-emerald-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-lg">Anda tidak memilih kandidat apa pun.</p>
          )}
        </section>

        {/* Yang Tidak Dipilih */}
        <section className="p-6 bg-gradient-to-br from-red-800 to-rose-900 rounded-xl shadow-lg border border-red-700">
          <h2 className="text-3xl font-bold mb-6 text-red-300 flex items-center gap-3">
            <span className="text-red-200">❌</span> Kandidat yang Tidak Anda Pilih:
          </h2>
          {notVotedCandidates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {notVotedCandidates.map((cand) => (
                <div
                  key={cand.id}
                  className="relative group bg-red-700 p-4 rounded-lg shadow-md border border-red-600 transform transition-all duration-300 hover:scale-105 hover:shadow-xl overflow-hidden"
                >
                  <img
                    src={cand.imageUrl}
                    alt={cand.name}
                    className="w-full h-48 object-cover rounded-md mb-3 border-2 border-red-500 group-hover:border-red-300 transition-colors duration-300"
                  />
                  <p className="text-xl font-semibold text-white text-center truncate">
                    {cand.name}
                  </p>
                  <div className="absolute inset-0 bg-red-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 italic text-lg">Anda memilih semua kandidat yang tersedia!</p>
          )}
        </section>
      </div>
    </div>
  );
}
