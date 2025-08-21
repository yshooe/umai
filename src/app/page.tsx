// app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;
import React from "react";
import { RaceSelector } from "./race/RaceSelector";

type Attachment = {
  type: "pdf" | "image" | "link";
  label: string;
  src: string;
  filename?: string;
};

type Race = {
  id: string;
  title: string;
  datetime?: string;
  track?: string;
  distance?: string;
  attachments?: Attachment[];
};

type Predictions = { races: Race[] };

function PdfViewer({ src, label }: { src: string; label?: string }) {
  return (
    <div className="w-full">
      {label ? <h3 className="text-lg font-semibold mb-2">{label}</h3> : null}
      <div className="w-full border rounded-lg overflow-hidden" style={{ height: "80vh" }}>
        <iframe src={src} title={label ?? "race-pdf"} className="w-full h-full" />
      </div>
      <div className="mt-3 text-sm">
        <a href={src} target="_blank" rel="noreferrer" className="underline">
          新しいタブでPDFを開く
        </a>
      </div>
    </div>
  );
}

export default async function Page({
  // ★ Next.js 15: searchParams は Promise<Record<string, string | string[] | undefined>>
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const raceId = typeof sp.raceId === "string" ? sp.raceId : undefined;

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const res = await fetch(`${base}/predictions.json`, { cache: "no-store" });
  if (!res.ok) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-bold mb-4">競馬予想</h1>
        <p className="text-red-600">predictions.json の読み込みに失敗しました。</p>
      </main>
    );
  }

  const data = (await res.json()) as Predictions;
  const races = data?.races ?? [];
  const selected = (raceId && races.find((r) => r.id === raceId)) || races[0];

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">競馬予想サイト</h1>
        <p className="text-sm text-gray-500">predictions.json の添付PDFをページ内で表示します</p>
      </header>

      {/* レース切替（クライアントコンポーネント） */}
      <div className="mb-6">
        <label className="mr-2 text-sm">レース選択：</label>
        <RaceSelector
          races={races.map(({ id, title }) => ({ id, title }))}
          currentId={selected?.id}
        />
      </div>

      {selected ? (
        <>
          <section className="mb-6">
            <h2 className="text-xl font-semibold">{selected.title}</h2>
            <div className="text-sm text-gray-600">
              {selected.datetime ? <span className="mr-3">時刻: {selected.datetime}</span> : null}
              {selected.track ? <span className="mr-3">開催: {selected.track}</span> : null}
              {selected.distance ? <span>距離: {selected.distance}</span> : null}
            </div>
          </section>

          {selected.attachments?.filter(a => a.type === "pdf").length ? (
            <section className="space-y-8">
              {selected.attachments!
                .filter((a) => a.type === "pdf")
                .map((a, i) => (
                  <PdfViewer key={`${selected.id}-pdf-${i}`} src={a.src} label={a.label} />
                ))}
            </section>
          ) : (
            <p>このレースにPDF添付はありません。</p>
          )}
        </>
      ) : (
        <p>表示できるレースがありません。</p>
      )}
    </main>
  );
}
