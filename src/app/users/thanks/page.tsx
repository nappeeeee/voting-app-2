"use client";

import { Suspense } from "react";
import ThanksPageClient from "./ThanksPageClient";

export default function ThanksPage() {
  return (
    <Suspense fallback={<div className="text-white p-8">Memuat halaman...</div>}>
      <ThanksPageClient />
    </Suspense>
  );
}
