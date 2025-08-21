// app/race/RaceSelector.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type RaceMin = { id: string; title?: string };

export function RaceSelector({
  races,
  currentId,
}: {
  races: RaceMin[];
  currentId?: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const options = useMemo(
    () =>
      races.map((r) => ({
        value: r.id,
        label: r.title ?? r.id,
      })),
    [races]
  );

  return (
    <select
      className="border rounded px-2 py-1"
      defaultValue={currentId}
      onChange={(e) => {
        const nextId = e.target.value;
        const q = new URLSearchParams(sp?.toString());
        q.set("raceId", nextId);
        router.replace(`/?${q.toString()}`, { scroll: false });
      }}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
