// Afet müdahalesinin harita katmanı: alevler, enkaz yığınları, hastalar ve yataklar; yangında çeşme (su).
import { type Mudahale } from '../mudahale'
import { kutuOf, type Nokta } from './harita'

type Props = {
  m: Mudahale
  alanlar: Nokta[][]
  kuyu: Nokta | null
  yataklar: Nokta[]
  o: number
  onDokun: (id: number) => void
  onKuyu: () => void
  tikla: (fn: () => void) => (e: { stopPropagation: () => void }) => void
  klavye: (fn: () => void) => (e: { key: string; preventDefault: () => void }) => void
}

export function hedefNoktasi(alanlar: Nokta[][], alan: number, u: number, v: number): Nokta {
  const k = kutuOf(alanlar[alan % alanlar.length])
  return [k.x + k.w * u, k.y + k.h * v]
}

function Alev({ r, deger }: { r: number; deger: number }) {
  const s = r * (0.55 + deger * 0.25)
  return (
    <g className="mud-alev">
      <path d={`M0,${s * 0.9} C${-s * 0.9},${s * 0.5} ${-s * 0.5},${-s * 0.3} 0,${-s * 1.2} C${s * 0.5},${-s * 0.3} ${s * 0.9},${s * 0.5} 0,${s * 0.9} Z`} fill="#F08A24" stroke="#B8321A" strokeWidth={3} />
      <path d={`M0,${s * 0.75} C${-s * 0.45},${s * 0.45} ${-s * 0.25},${0} 0,${-s * 0.55} C${s * 0.25},${0} ${s * 0.45},${s * 0.45} 0,${s * 0.75} Z`} fill="#FFD166" />
    </g>
  )
}

export function MudahaleKatmani({ m, alanlar, kuyu, yataklar, o, onDokun, onKuyu, tikla, klavye }: Props) {
  const r = 34 * o
  return (
    <g className="mudahale-katmani">
      {/* Salgında hastaların toplandığı avlu: yere serilmiş hasır. Yangın ve depremde binanın kendisi efektle değişir, çerçeve gerekmez. */}
      {m.tur === 'salgin' &&
        alanlar.map((a, i) => {
          const k = kutuOf(a)
          return (
            <g key={i} pointerEvents="none" aria-hidden="true">
              <rect x={k.x} y={k.y} width={k.w} height={k.h} rx={26} fill="#F4E4BE" opacity={0.55} stroke="#13807D" strokeWidth={4} strokeOpacity={0.5} />
              <rect x={k.x + 14} y={k.y + 14} width={k.w - 28} height={k.h - 28} rx={18} fill="none" stroke="#C9A86A" strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" />
            </g>
          )
        })}

      {m.tur === 'yangin' && kuyu && (
        <g transform={`translate(${kuyu[0]},${kuyu[1]})`} className="mud-hedef" role="button" tabIndex={0} aria-label={`Çeşmeden su doldur (${m.su} kova kaldı)`} onClick={tikla(onKuyu)} onKeyDown={klavye(onKuyu)}>
          <circle r={r * 1.5} fill="transparent" />
          <circle r={r} fill="#DDF2F7" stroke="#13807D" strokeWidth={4} />
          <text y={r * 0.36} textAnchor="middle" fontSize={r * 1.05}>💧</text>
          {m.su === 0 && <circle r={r + 8} fill="none" stroke="#13807D" strokeWidth={4} className="mud-nabiz" />}
        </g>
      )}

      {m.tur === 'salgin' &&
        yataklar.map(([x, y], i) => {
          const hasta = m.hedefler.find((h) => h.yatak === i)
          const ilerleme = hasta?.anSn != null ? Math.min(1, (m.t - hasta.anSn) / 3) : 0
          return (
            <g key={i} transform={`translate(${x},${y})`} pointerEvents="none" aria-hidden="true">
              <rect x={-r * 1.1} y={-r * 0.45} width={r * 2.2} height={r * 0.9} rx={8} fill="#FFFDF6" stroke="#5A3A1E" strokeWidth={3} />
              <rect x={-r * 1.1} y={-r * 0.45} width={r * 0.55} height={r * 0.9} rx={8} fill="#E8D3A2" stroke="#5A3A1E" strokeWidth={3} />
              {hasta && (
                <>
                  <circle cx={-r * 0.55} cy={0} r={r * 0.26} fill="#E8B98A" stroke="#2A1D12" strokeWidth={2} />
                  <rect x={-r * 0.25} y={-r * 0.3} width={r * 1.2} height={r * 0.6} rx={6} fill="#7FB3C8" />
                  <rect x={-r * 1.1} y={r * 0.55} width={r * 2.2 * ilerleme} height={8} rx={4} fill="#3F8A25" />
                </>
              )}
            </g>
          )
        })}

      {m.hedefler
        .filter((h) => h.yatak == null)
        .map((h) => {
          const [x, y] = hedefNoktasi(alanlar, h.alan, h.u, h.v)
          const dokun = () => onDokun(h.id)
          const etiket =
            m.tur === 'yangin' ? `Alev, büyüklük ${h.deger}: söndür` : m.tur === 'deprem' ? `Enkaz, ${h.deger} dokunuş kaldı` : `Hasta, ateş %${Math.round(h.deger * 100)}: yatağa yatır`
          return (
            <g key={h.id} transform={`translate(${x},${y})`} className="mud-hedef" role="button" tabIndex={0} aria-label={etiket} onClick={tikla(dokun)} onKeyDown={klavye(dokun)}>
              <circle r={r * 1.5} fill="transparent" />
              {m.tur === 'yangin' && (
                <>
                  <circle r={r * (1.1 + h.deger * 0.2)} fill="url(#vk-alev-isigi)" opacity={0.9} />
                  <circle r={r * 1.15} fill="none" stroke="#FFF3C4" strokeWidth={3} strokeDasharray="6 8" className="mud-halka" />
                  <Alev r={r * 1.25} deger={h.deger} />
                </>
              )}
              {m.tur === 'deprem' && (
                <g>
                  <ellipse cx={0} cy={r * 0.55} rx={r * 1.1} ry={r * 0.35} fill="#3A2A18" opacity={0.25} />
                  {[[-0.5, 0.2, 0.42], [0.45, 0.25, 0.38], [0, -0.15, 0.48], [-0.2, 0.45, 0.32], [0.35, -0.3, 0.3]].slice(0, 2 + h.deger).map(([dx, dy, rr], i) => (
                    <circle key={i} cx={dx * r} cy={dy * r} r={rr * r} fill={['#A99A82', '#8E8270', '#C2B59A', '#9C8E76', '#B4A68C'][i]} stroke="#4A3F31" strokeWidth={2.5} />
                  ))}
                  <g transform={`translate(${r * 0.8},${-r * 0.8})`}>
                    <circle r={r * 0.42} fill={h.kisi ? '#F2B33D' : '#E8E0D0'} stroke="#4A3F31" strokeWidth={2.5} />
                    <text y={r * 0.18} textAnchor="middle" fontSize={r * 0.5} fontWeight={900} fill="#3A2205" fontFamily="Nunito, sans-serif">{h.deger}</text>
                  </g>
                </g>
              )}
              {m.tur === 'salgin' && (
                <g>
                  <path d={`M${-r * 0.5},${r * 0.9} Q0,${-r * 0.1} ${r * 0.5},${r * 0.9} Z`} fill="#6B4A8C" stroke="#2A1D12" strokeWidth={2.5} />
                  <circle cx={0} cy={-r * 0.05} r={r * 0.32} fill="#E8B98A" stroke="#2A1D12" strokeWidth={2.5} />
                  <circle r={r * 0.85} fill="none" stroke={h.deger > 0.7 ? '#B8432F' : '#F2B33D'} strokeWidth={5} strokeDasharray={`${2 * Math.PI * r * 0.85 * h.deger} ${2 * Math.PI * r}`} transform="rotate(-90)" />
                </g>
              )}
            </g>
          )
        })}
    </g>
  )
}
