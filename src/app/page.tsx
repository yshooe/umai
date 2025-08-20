"use client";
import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState<any>({});
  const raceIds = Object.keys(data || {});

  useEffect(() => {
    fetch("/data/predictions.json")
      .then((r) => (r.ok ? r.json() : {}))
      .then(setData)
      .catch(() => setData({}));
  }, []);

  return (
    <main style={{maxWidth: 900, margin: "0 auto", padding: 24}}>
      <h1 style={{fontSize: 24, fontWeight: 700}}>AI予想（手動更新デモ）</h1>

      {raceIds.length === 0 && (
        <p style={{marginTop: 12, color: "#666"}}>
          public/data/predictions.json を置くと表示されます。
        </p>
      )}

      {raceIds.map((rid) => (
        <section key={rid} style={{border:"1px solid #ddd", borderRadius:12, padding:16, marginTop:16}}>
          <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <h2 style={{fontSize:18, fontWeight:600}}>レース: {rid}</h2>
            <a href={(data as any)[rid][0]?.links?.race} target="_blank" rel="noreferrer">
              レース詳細（netkeiba）
            </a>
          </div>
          <ul style={{marginTop:8}}>
            {(data as any)[rid].map((h:any, i:number) => (
              <li key={h.horse_id} style={{display:"flex", justifyContent:"space-between", padding:"6px 0"}}>
                <div>{i+1}. {h.horse_name}（枠{h.draw}）</div>
                <div>勝率 {(h.win_prob*100).toFixed(1)}%</div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p style={{marginTop: 24, fontSize: 12, color: "#666"}}>
        ※本サイトは情報提供を目的としています。詳細データはリンク先をご確認ください。
      </p>
    </main>
  );
}
