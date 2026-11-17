// Kasabanın köylüleri: yol ağında gerçek zamanlı yürüyen NPC'ler. Haritanın SVG'sine bir katman olarak eklenir.
// Mantık npc.ts'de (saf); burada yalnızca zamanlama (requestAnimationFrame + delta time) ve çizim var.
import { useEffect, useMemo, useRef, useState } from 'react'
import { ortam } from '../../ortam'
import { HER_SEY_ACIK, npcAdim, npcKur, rastgeleKur, VARSAYILAN_NPC, type Npc, type NpcKosullari } from './npc'
import { GECICI, gorunumSec, type AtlasGorunumu, type GeciciGorunum, type TekGorunum } from './gorunum'

type Props = {
  /** Kaç NPC (verilmezse cihaza göre 8–12). */
  sayi?: number
  /** Oyun durumu: hangi duraklar açık (kapalı aşevi, kuru çeşme...). */
  kosullar?: NpcKosullari
  /** Hareket azaltıldıysa NPC'ler yerinde durur. */
  durgun?: boolean
}

function varsayilanSayi(): number {
  const cekirdek = typeof navigator !== 'undefined' ? navigator.hardwareConcurrency ?? 8 : 8
  return cekirdek <= 4 ? 8 : VARSAYILAN_NPC
}

/** Yüklenemeyen resimler: o görünüm geçici silüete düşer. */
const bozukResim = new Set<string>()

export function NpcKatmani({ sayi, kosullar = HER_SEY_ACIK, durgun = false }: Props) {
  const adet = sayi ?? varsayilanSayi()
  const npcler = useRef<Npc[]>(npcKur(adet, 20261107))
  const rng = useMemo(() => rastgeleKur(7), [])
  const kosul = useRef(kosullar)
  kosul.current = kosullar
  const [, setKare] = useState(0)
  const [, setBozuk] = useState(0)

  useEffect(() => {
    if (npcler.current.length !== adet) npcler.current = npcKur(adet, 20261107)
  }, [adet])

  useEffect(() => {
    if (durgun) return
    let id = 0
    let son = performance.now()
    let sonCizim = 0
    const dongu = (simdi: number) => {
      const dt = (simdi - son) / 1000
      son = simdi
      npcAdim(npcler.current, dt, rng, kosul.current)
      // Çizim ~40 kare/sn: haritada kişiler küçük, daha sıkı çizmek gereksiz yük.
      if (simdi - sonCizim > 24) {
        sonCizim = simdi
        setKare((k) => (k + 1) % 1e6)
      }
      id = requestAnimationFrame(dongu)
    }
    id = requestAnimationFrame(dongu)
    return () => cancelAnimationFrame(id)
  }, [durgun, rng])

  // önde (aşağıda) olan üstte çizilsin
  const sirali = [...npcler.current].filter((n) => n.gorunurluk > 0.01).sort((a, b) => a.depth - b.depth)
  return (
    <g className="npc-katmani" pointerEvents="none" aria-hidden="true">
      {sirali.map((n) => {
        const g = gorunumSec(n.type, n.id)
        const bozuk = g.tur !== 'gecici' && bozukResim.has(g.url)
        return (
          <g key={n.id} transform={`translate(${n.x.toFixed(2)},${n.y.toFixed(2)})`} opacity={n.gorunurluk}>
            <ellipse cx={0} cy={-0.5} rx={(g.tur === 'tek' ? g.en : 16) * 0.38} ry={2.4} fill="#3A2412" opacity={0.3} />
            {bozuk || g.tur === 'gecici' ? (
              <Siluet n={n} g={g.tur === 'gecici' ? g : GECICI[n.type]} />
            ) : g.tur === 'tek' ? (
              <TekResim n={n} g={g} onHata={() => { bozukResim.add(g.url); setBozuk((b) => b + 1) }} />
            ) : (
              <AtlasKaresi n={n} g={g} />
            )}
          </g>
        )
      })}
    </g>
  )
}

/** Tek kare resim: yürürken sekme + hafif sağa sola eğilme (adımla eş), dururken nefes. */
function TekResim({ n, g, onHata }: { n: Npc; g: TekGorunum; onHata: () => void }) {
  const yuruyor = n.state === 'yuru'
  const faz = n.adim * Math.PI
  const sekme = yuruyor ? Math.abs(Math.sin(faz)) * 1.3 : 0
  const egim = yuruyor ? Math.sin(faz) * 3.2 : 0
  const nefes = yuruyor ? 1 : 1 + Math.sin(n.adim * 2) * 0.012
  const cevir = n.yatay * g.bakar
  return (
    <g transform={`translate(0,${(-sekme).toFixed(2)}) rotate(${egim.toFixed(2)}) scale(${cevir},${nefes.toFixed(3)})`}>
      <image href={`${ortam.varlikKoku}${g.url}`} x={-g.en / 2} y={-g.boy} width={g.en} height={g.boy} onError={onHata} />
    </g>
  )
}

/** Sprite atlası: yöne göre satır, adıma göre kare. (Animasyona hazır asset gelince kullanılır.) */
function AtlasKaresi({ n, g }: { n: Npc; g: AtlasGorunumu }) {
  const [hw, hh] = g.hucre
  const s = g.boy / hh
  const kare = n.state === 'yuru' ? Math.floor(n.adim * 2) % g.kare : g.bekleKaresi ?? 0
  const satir = g.satir[n.facing]
  return (
    <svg x={-g.ayak[0] * s} y={-g.ayak[1] * s} width={hw * s} height={hh * s} viewBox={`${kare * hw} ${satir * hh} ${hw} ${hh}`} overflow="hidden">
      <image href={`${ortam.varlikKoku}${g.url}`} width={g.boyut[0]} height={g.boyut[1]} />
    </svg>
  )
}

/** Geçici silüet: dönem kıyafeti renkleri, bacaklar adım atar, kollar sallanır. */
function Siluet({ n, g }: { n: Npc; g: GeciciGorunum }) {
  const k = g.boy / 34
  const yuruyor = n.state === 'yuru'
  const a = yuruyor ? Math.sin(n.adim * Math.PI) : 0
  const sekme = Math.abs(a) * 1.2
  return (
    <g transform={`translate(0,${-sekme}) scale(${n.yatay * k},${k})`}>
      <path d={`M-2,-8 L${-2 - a * 4},0 M2,-8 L${2 + a * 4},0`} stroke="#3A2A18" strokeWidth={2.6} strokeLinecap="round" />
      <path d="M-5,-24 Q-7,-14 -7.5,-9 Q0,-6 7.5,-9 Q7,-14 5,-24 Q0,-26 -5,-24 Z" fill={g.giysi} stroke="#2A1D12" strokeWidth={1.4} />
      <path d={`M3,-22 Q${6 + a * 2},-17 ${4 + a * 3},-13`} stroke={g.giysi} strokeWidth={2.8} fill="none" strokeLinecap="round" />
      <circle cx={0.5} cy={-28.5} r={4.3} fill="#E3B285" stroke="#2A1D12" strokeWidth={1.3} />
      {g.bas === 'sarik' && <ellipse cx={0.5} cy={-32} rx={5.4} ry={3} fill="#F4EEDD" stroke="#2A1D12" strokeWidth={1.2} />}
      {g.bas === 'fes' && <path d="M-3,-31 L-2.4,-35.5 H3.4 L4,-31 Z" fill="#B8321A" stroke="#2A1D12" strokeWidth={1.1} />}
      {g.bas === 'kece' && <path d="M-3.6,-31 Q0.5,-38 4.6,-31 Z" fill="#D9C8A6" stroke="#2A1D12" strokeWidth={1.1} />}
      {g.bas === 'ortu' && <path d="M-4.6,-27 Q-5,-34 0.5,-34 Q6,-34 5.6,-27 Q5,-22 3,-21 L-3,-21 Q-5,-22 -4.6,-27 Z" fill="#F2EADB" stroke="#2A1D12" strokeWidth={1.1} />}
      {g.yuk === 'cuval' && <ellipse cx={-6} cy={-22} rx={5} ry={6} fill="#C9A36B" stroke="#2A1D12" strokeWidth={1.2} />}
      {g.yuk === 'testi' && <path d="M-2,-36 Q-4,-41 0,-44 Q4,-41 2,-36 Z" fill="#B8642F" stroke="#2A1D12" strokeWidth={1.1} />}
      {g.yuk === 'sepet' && <ellipse cx={6} cy={-15} rx={4.5} ry={3} fill="#B98A3E" stroke="#2A1D12" strokeWidth={1.1} />}
      {g.yuk === 'kitap' && <rect x={4} y={-19} width={4} height={5} fill="#7A2E2E" stroke="#2A1D12" strokeWidth={1} />}
    </g>
  )
}
