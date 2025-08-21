// src/app/page.tsx
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React from "react";
import { headers } from "next/headers";
import { RaceSelector } from "./race/RaceSelector";

type Attachment = {
  type: "pdf" | "image" | "link";
  label: string;
  src: string;       // 例: /pdfs/xxxx.pdf
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
  // Next.js 15: Promise<Record<string, string | string[] | undefined>> を await
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) ?? {};
  const raceId = typeof sp.raceId === "string" ? sp.raceId : undefined;

  // 本番の絶対URLを作る（相対fetchで落ちる環境を避ける）
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  const baseUrl = `${proto}://${host}`;

  // /data/predictions.json を優先、無ければ /predictions.json
  const urls = [`${baseUrl}/data/predictions.json`, `${baseUrl}/predictions.json`];

  let races: Race[] = [];
  for (const url of urls) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const data = (await res.json()) as Predictions;
      if (Array.isArray(data?.races)) {
        races = data.races;
        break;
      }
    } catch {
      // 次の候補へ
    }
  }

  const selected = (raceId && races.find((r) => r.id === raceId)) || races[0];

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">競馬予想サイト</h1>
        <p className="text-sm text-gray-500">
          public/data/predictions.json に登録したPDFをページ内で表示します
        </p>
      </header>

      {!races.length ? (
        <p className="text-red-600">predictions.json の読み込みに失敗しました。</p>
      ) : (
        <>
          {/* レース切替 */}
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

              {selected.attachments?.filter((a) => a.type === "pdf").length ? (
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
        </>
      )}
    </main>
  );
}
