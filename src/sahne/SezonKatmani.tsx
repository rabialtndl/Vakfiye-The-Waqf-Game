// Sezon mini oyununun harita katmanı: mülklerin üstünde hasat balonları, yollarda yardım keseleri,
// sandıktan hayrata giden araba ve hayratın önünde sırada bekleyen kişiler. Hepsi harita koordinatlarında.
import type { AmacId } from '../motor/sabitler'
import { URUN_SIMGESI, type Sezon } from '../sezon'
import { ARABA_YOLU, ARSA_ALANI, BINA_ALANI, HAYRAT_ALANI, KESE_YERLERI, noktalar, tepe, yolNoktasi, type Nokta } from './harita'

type Props = {
  s: Sezon
  amac: AmacId
  /** Telefonda harita küçük göründüğü için simgeler büyütülür. */
  o: number
  onTopla: (id: string) => void
  onKese: (id: number) => void
  tikla: (fn: () => void) => (e: { stopPropagation: () => void }) => void
  klavye: (fn: () => void) => (e: { key: string; preventDefault: () => void }) => void
}

const istasyonAlani = (id: string): Nokta[] =>
  id === 'hamam' || id === 'han' || id === 'arazi' ? BINA_ALANI[id] : ARSA_ALANI[id as keyof typeof ARSA_ALANI]

/** Geri sayım halkası: kalan süreyi halkanın dolu kısmı gösterir. */
function Halka({ r, kalan, renk }: { r: number; kalan: number; renk: string }) {
  const c = 2 * Math.PI * r
  return <circle r={r} fill="none" stroke={renk} strokeWidth={r * 0.16} strokeDasharray={`${c * Math.max(0, kalan)} ${c}`} transform="rotate(-90)" strokeLinecap="round" />
}

export function SezonKatmani({ s, amac, o, onTopla, onKese, tikla, klavye }: Props) {
  const yol = ARABA_YOLU[amac]
  const son = yol[yol.length - 1]
  const sureli = s.sure !== null

  // Araba nerede: sandıkta, hayrata giderken ya da dönerken.
  const t = s.araba.durum === 'gidiyor' ? s.araba.ilerleme : s.araba.durum === 'donuyor' ? 1 - s.araba.ilerleme : 0
  const { n: araba, sola } = yolNoktasi(yol, t)
  const bosDonuyor = s.araba.durum === 'donuyor'
  const teslimYeni = s.sonTeslim && s.t - s.sonTeslim.sn < 1.4 ? s.sonTeslim : null

  // Sıradakiler hayratın önünde, yola dik bir sıra halinde.
  const sira = (i: number): Nokta => [son[0] + (i - 1.5) * 62 * Math.min(o, 1.8), son[1] + 70 * Math.min(o, 1.6)]

  return (
    <g className="sezon-katmani">
      {/* hayratın çevresi ve arabanın yolu */}
      <polygon points={noktalar(HAYRAT_ALANI[amac])} fill="none" stroke="#F2B33D" strokeWidth={6} strokeDasharray="14 10" opacity={0.9} pointerEvents="none" />
      <polyline points={yol.map((p) => p.join(',')).join(' ')} fill="none" stroke="#FFF4D6" strokeWidth={14 * Math.min(o, 1.6)} strokeLinecap="round" strokeLinejoin="round" opacity={0.75} pointerEvents="none" />
      <polyline points={yol.map((p) => p.join(',')).join(' ')} fill="none" stroke="#7A4A22" strokeWidth={4 * Math.min(o, 1.6)} strokeDasharray="10 12" strokeLinecap="round" opacity={0.8} pointerEvents="none" />

      {/* hasat balonları */}
      {s.istasyonlar.map((i) => {
        if (i.hazirSn === null) return null
        const [x, y] = tepe(istasyonAlani(i.id))
        const r = 30 * o
        const kalan = sureli ? 1 - (s.t - i.hazirSn) / 4 : 1
        const topla = () => onTopla(i.id)
        return (
          <g key={i.id} transform={`translate(${x},${y - r})`} className="sezon-balon" role="button" tabIndex={0} aria-label={`${i.ad}: topla`} onClick={tikla(topla)} onKeyDown={klavye(topla)}>
            <circle r={r * 1.5} fill="transparent" />
            <g className="ziplayan">
              <path d={`M0,${r * 1.35} L${-r * 0.35},${r * 0.85} L${r * 0.35},${r * 0.85} Z`} fill="#FFF4D6" stroke="#7A4A22" strokeWidth={3} />
              <circle r={r} fill="#FFF4D6" stroke="#7A4A22" strokeWidth={3} />
              {i.bugday ? (
                <text y={r * 0.36} textAnchor="middle" fontSize={r * 1.05}>🌾</text>
              ) : (
                <g>
                  <circle r={r * 0.62} fill="#F2B33D" stroke="#7A4A22" strokeWidth={3} />
                  <circle r={r * 0.3} fill="none" stroke="#7A4A22" strokeWidth={3} />
                </g>
              )}
              <Halka r={r + 6} kalan={kalan} renk="#3F8A25" />
            </g>
          </g>
        )
      })}

      {/* yardım keseleri */}
      {s.keseler.map((k) => {
        const [x, y] = KESE_YERLERI[k.yer]
        const r = 28 * o
        const kalan = 1 - (s.t - k.dogduSn) / (sureli ? 3.5 : 7)
        const topla = () => onKese(k.id)
        return (
          <g key={k.id} transform={`translate(${x},${y})`} className="sezon-kese" role="button" tabIndex={0} aria-label="Yardım kesesi: topla" onClick={tikla(topla)} onKeyDown={klavye(topla)}>
            <circle r={r * 1.5} fill="transparent" />
            <g className="parlayan">
              <circle r={r} fill="#FFFFFF" stroke="#B8432F" strokeWidth={3} />
              <text y={r * 0.36} textAnchor="middle" fontSize={r * 1.05}>💰</text>
              <Halka r={r + 6} kalan={kalan} renk="#B8432F" />
            </g>
          </g>
        )
      })}

      {/* sıradaki kişiler */}
      {s.musteriler.map((m, i) => {
        const [x, y] = sira(i)
        const kilitli = !s.acik.includes(m.urun)
        const kalan = Number.isFinite(m.sabir) ? 1 - (s.t - m.geldiSn) / m.sabir : 1
        const b = 26 * Math.min(o, 1.8)
        return (
          <g key={m.id} transform={`translate(${x},${y})`} pointerEvents="none" aria-hidden="true" className="sezon-kisi">
            <ellipse cx={0} cy={b * 1.5} rx={b * 0.7} ry={b * 0.22} fill="#3A2A18" opacity={0.25} />
            <path d={`M${-b * 0.55},${b * 1.5} Q0,${b * 0.2} ${b * 0.55},${b * 1.5} Z`} fill={['#2F6E8C', '#8C3B2F', '#5B7A2F', '#6B4A8C'][m.id % 4]} stroke="#2A1D12" strokeWidth={2.5} />
            <circle cx={0} cy={b * 0.35} r={b * 0.32} fill="#E8B98A" stroke="#2A1D12" strokeWidth={2.5} />
            <g transform={`translate(0,${-b * 0.75})`}>
              <circle r={b * 0.72} fill={kilitli ? '#EFE4CC' : '#FFFFFF'} stroke={kalan < 0.35 ? '#B8432F' : '#2A1D12'} strokeWidth={3} strokeDasharray={kilitli ? '6 4' : undefined} />
              <text y={b * 0.26} textAnchor="middle" fontSize={b * 0.78}>{kilitli ? '❔' : URUN_SIMGESI[m.urun]}</text>
              <Halka r={b * 0.72 + 5} kalan={kalan} renk={kalan < 0.35 ? '#B8432F' : '#3F8A25'} />
            </g>
          </g>
        )
      })}

      {/* araba */}
      <g transform={`translate(${araba[0]},${araba[1]}) scale(${(sola ? -1 : 1) * Math.min(o, 1.9)},${Math.min(o, 1.9)})`} pointerEvents="none" aria-hidden="true">
        <ellipse cx={0} cy={22} rx={44} ry={9} fill="#3A2A18" opacity={0.25} />
        <rect x={-38} y={-20} width={64} height={34} rx={6} fill="#A86A3A" stroke="#4A2A12" strokeWidth={3} />
        <path d="M-38,-6 H26 M-38,6 H26" stroke="#7A4A22" strokeWidth={2} />
        <path d="M26,0 L48,-4" stroke="#4A2A12" strokeWidth={4} strokeLinecap="round" />
        <circle cx={-22} cy={16} r={11} fill="#5A3A1E" stroke="#2A1D12" strokeWidth={3} />
        <circle cx={14} cy={16} r={11} fill="#5A3A1E" stroke="#2A1D12" strokeWidth={3} />
        <g transform={sola ? 'scale(-1,1)' : undefined}>
          {(bosDonuyor ? [] : s.yuk).map((u, i) => (
            <text key={i} x={(i - 1) * 22 - 6} y={-24} textAnchor="middle" fontSize={26}>{URUN_SIMGESI[u]}</text>
          ))}
        </g>
      </g>

      {/* teslimat: hayratın önünde kısa bir yazı */}
      {teslimYeni && (
        <g transform={`translate(${son[0]},${son[1] - 40 * o})`} pointerEvents="none" aria-hidden="true" className="sezon-teslim">
          <text textAnchor="middle" fontSize={34 * Math.min(o, 1.8)} fontWeight={900} fill="#fff" stroke="#3F8A25" strokeWidth={8} paintOrder="stroke" fontFamily="Nunito, sans-serif">
            {teslimYeni.verilen > 0 ? `+${teslimYeni.verilen} kişiye ulaştı` : 'Kimse istemedi'}
          </text>
        </g>
      )}
    </g>
  )
}
