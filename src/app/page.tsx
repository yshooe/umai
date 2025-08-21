// app/page.tsx
import React from "react";

type Attachment = {
  type: "pdf" | "image" | "link";
  label: string;
  src: string;        // 例: /pdfs/20250821_kawasaki11R_shippu-dotou.pdf
  filename?: string;  // 任意
};

type Race = {
  id: string;         // 例: "2025-08-21-kawasaki-11R"
  title: string;      // 例: "疾風怒涛賞（川崎11R）"
  datetime?: string;  // ISO文字列
  track?: string;
  distance?: string;
  attachments?: Attachment[];
};

type Predictions = {
  races: Race[];
};

// ---- PDF埋め込み用の小コンポーネント ----
function PdfViewer({ src, label }: { src: string; label?: string }) {
  // SWA/Nextでは public 配下はそのまま配信されるので src は /pdfs/... でOK
  return (
    <div className="w-full">
      {label ? <h3 className="text-lg font-semibold mb-2">{label}</h3> : null}

      {/* PDF 埋め込み（iframe） */}
      <div className="w-full border rounded-lg overflow-hidden" style={{ height: "80vh" }}>
        <iframe
          src={src}
          title={label ?? "race-pdf"}
          className="w-full h-full"
          loading="eager"
        />
      </div>

      {/* PDF を直接開いたりDLしたい人向けのリンク */}
      <div className="mt-3 text-sm">
        <a href={src} target="_blank" rel="noreferrer" className="underline">
          新しいタブでPDFを開く
        </a>
      </div>
    </div>
  );
}

// ---- メインページ（サーバーコンポーネント） ----
export default async function Page({
  searchParams,
}: {
  searchParams?: { raceId?: string };
}) {
  // public/predictions.json から取得（SWA配信）
  // NOTE: `cache: 'no-store'` で毎回最新を取得（必要に応じて 'force-cache' に）
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/predictions.json`, {
    cache: "no-store",
  });

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

  // 表示対象レースを決定（?raceId=… があれば優先、無ければ先頭）
  const selected =
    (searchParams?.raceId && races.find((r) => r.id === searchParams!.raceId)) ||
    races[0];

  return (
    <main className="p-6 max-w-6xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">競馬予想サイト</h1>
        <p className="text-sm text-gray-500">
          predictions.json の添付PDFをページ内で表示します
        </p>
      </header>

      {/* レース切替（簡易ドロップダウン） */}
      <div className="mb-6">
        <label className="mr-2 text-sm">レース選択：</label>
        <select
          className="border rounded px-2 py-1"
          defaultValue={selected?.id}
          onChange={(e) => {
            const id = e.target.value;
            if (typeof window !== "undefined") {
              const q = new URLSearchParams(window.location.search);
              q.set("raceId", id);
              window.location.search = q.toString();
            }
          }}
        >
          {races.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title ?? r.id}
            </option>
          ))}
        </select>
      </div>

      {/* レース情報 */}
      {selected ? (
        <section className="mb-6">
          <h2 className="text-xl font-semibold">{selected.title}</h2>
          <div className="text-sm text-gray-600">
            {selected.datetime ? <span className="mr-3">時刻: {selected.datetime}</span> : null}
            {selected.track ? <span className="mr-3">開催: {selected.track}</span> : null}
            {selected.distance ? <span>距離: {selected.distance}</span> : null}
          </div>
        </section>
      ) : (
        <p>表示できるレースがありません。</p>
      )}

      {/* 添付PDFの埋め込み */}
      {selected?.attachments?.length ? (
        <section className="space-y-8">
          {selected.attachments
            .filter((a) => a.type === "pdf")
            .map((a, i) => (
              <PdfViewer key={`${selected.id}-pdf-${i}`} src={a.src} label={a.label} />
            ))}
        </section>
      ) : (
        <p>このレースにPDF添付はありません。</p>
      )}
    </main>
  );
}
