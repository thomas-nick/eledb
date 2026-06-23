"use client";

import dynamic from "next/dynamic";

const RangeMapLeaflet = dynamic(
  () => import("./RangeMapLeaflet").then((m) => m.RangeMapLeaflet),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] rounded-xl border border-slate-200 bg-slate-100 animate-pulse flex items-center justify-center text-sm text-slate-500">
        Loading map…
      </div>
    ),
  }
);

export function RangeMap() {
  return <RangeMapLeaflet />;
}
