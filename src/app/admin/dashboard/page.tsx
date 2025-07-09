"use client";

import { useEffect, useState } from "react";
import { db } from "../../../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Candidate {
  id: string;
  name: string;
  imageUrl: string;
  votes: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVotingResults = async () => {
    const candidateSnap = await getDocs(collection(db, "candidates"));
    const userSnap = await getDocs(collection(db, "users"));

    const voteMap: Record<string, number> = {};

    const candidates = candidateSnap.docs.map((doc) => {
      voteMap[doc.id] = 0;
      return {
        id: doc.id,
        name: doc.data().name,
        imageUrl: doc.data().imageUrl,
        votes: 0,
      };
    });

    userSnap.docs.forEach((doc) => {
      const userData = doc.data();
      const votes: string[] = userData.votes || [];
      votes.forEach((voteId) => {
        if (voteMap[voteId] !== undefined) {
          voteMap[voteId] += 1;
        }
      });
    });

    const finalData = candidates.map((c) => ({
      ...c,
      votes: voteMap[c.id] || 0,
    }));

    setData(finalData);
    setLoading(false);
  };

  useEffect(() => {
    fetchVotingResults();
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-100 text-gray-600">
        <p className="text-lg animate-pulse">Memuat data rekap suara...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 sm:p-10">
      <div className="max-w-7xl mx-auto bg-white shadow-xl rounded-2xl p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 text-center mb-12 flex items-center justify-center gap-2">
          <span className="text-indigo-500 text-4xl">📊</span>
          Rekap Hasil Voting
        </h1>

        {/* Daftar Kandidat */}
        <section className="mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6 border-b pb-3 border-indigo-100">
            Daftar Kandidat & Suara
          </h2>
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((cand) => (
              <div
                key={cand.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition duration-300 overflow-hidden flex items-center gap-4 p-5"
              >
                <img
                  src={cand.imageUrl}
                  alt={cand.name}
                  className="w-20 h-20 rounded-full object-cover border-4 border-indigo-300 shadow-sm"
                />
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-gray-800">{cand.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">
                    Jumlah suara:{" "}
                    <span className="text-indigo-600 font-semibold text-base">{cand.votes}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Diagram Bar */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-6 border-b pb-3 border-indigo-100">
            Diagram Suara
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={data}
                margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                  height={70}
                />
                <YAxis stroke="#6b7280" allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
                  contentStyle={{
                    backgroundColor: "white",
                    borderRadius: "10px",
                    borderColor: "#e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                  }}
                  itemStyle={{ color: "#111827" }}
                />
                <Bar
                  dataKey="votes"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
