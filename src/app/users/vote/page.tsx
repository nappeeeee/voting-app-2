"use client";

import { Suspense } from "react";
import VotePage from "./VotePage";

export default function VotePageWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white text-xl">
          Memuat halaman vote...
        </div>
      }
    >
      <VotePage />
    </Suspense>
  );
}
