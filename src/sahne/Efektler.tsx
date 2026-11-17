// Olayların binanın kendisini değiştiren görüntüleri. Haritanın ilgili parçası yeniden çizilip
// filtrelenir: yangında kararır ve kızıllaşır (üstünde duman, kıvılcım, alev ışığı), depremde kırılır
// ve tozlanır, salgında solup yeşilimsi bir griye döner. Güç (0–1) söndürdükçe ya da onardıkça azalır.
// public/durumlar/ altında o bina ve durum için çizilmiş bir görsel varsa (ChatGPT ile üretilen) o kullanılır.
import { useEffect, useState } from 'react'
import { ortam } from '../ortam'
import { kutuOf, noktalar, type Nokta } from './harita'

export type EfektTuru = 'yangin' | 'yanik' | 'deprem' | 'yikik' | 'salgin' | 'kurak'

/** Durum görseli var mı? (bir kez sorulur, sonucu saklanır) */
const varMi = new Map<string, boolean | Promise<boolean>>()
function useDurumGorseli(ad: string | null): string | null {
  const [yol, setYol] = useState<string | null>(null)
  useEffect(() => {
    if (!ad) return setYol(null)
    const url = `${ortam.varlikKoku}durumlar/${ad}.webp`
    const bilinen = varMi.get(url)
    if (bilinen === true) return setYol(url)
    if (bilinen === false) return setYol(null)
    let iptal = false
    const soru =
      bilinen ??
      new Promise<boolean>((coz) => {
        const img = new Image()
        img.onload = () => coz(true)
        img.onerror = () => coz(false)
        img.src = url
      })
    varMi.set(url, soru)
    soru.then((v) => {
      varMi.set(url, v)
      if (!iptal) setYol(v ? url : null)
    })
    return () => {
      iptal = true
    }
  }, [ad])
  return yol
}

type Props = {
  id: string
  alan: Nokta[]
  tur: EfektTuru
  guc: number
  harita: string
  W: number
  H: number
  /** public/durumlar/<gorsel>.webp (ör. "han-yangin"); yoksa filtreyle çizilir. */
  gorsel?: string
}

/** Çatıdan yükselen dekor alevi (dokunulmaz; dokunulan alevler müdahale katmanındadır). */
function DekorAlev({ x, y, s, gecikme }: { x: number; y: number; s: number; gecikme: number }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <g className="efekt-alev" style={{ animationDelay: `${gecikme}s` }}>
        <path d={`M0,0 C${-s * 0.55},${-s * 0.2} ${-s * 0.45},${-s * 0.75} ${-s * 0.05},${-s * 1.25} C${s * 0.05},${-s * 0.85} ${s * 0.3},${-s * 0.95} ${s * 0.25},${-s * 0.55} C${s * 0.5},${-s * 0.5} ${s * 0.5},${-s * 0.15} 0,0 Z`} fill="#E8571C" opacity={0.92} />
        <path d={`M0,${-s * 0.04} C${-s * 0.3},${-s * 0.15} ${-s * 0.25},${-s * 0.5} ${-s * 0.02},${-s * 0.8} C${s * 0.12},${-s * 0.5} ${s * 0.3},${-s * 0.3} 0,${-s * 0.04} Z`} fill="#FFC23D" />
        <ellipse cx={0} cy={-s * 0.12} rx={s * 0.12} ry={s * 0.2} fill="#FFF3C4" />
      </g>
    </g>
  )
}

export function BinaEfekti({ id, alan, tur, guc, harita, W, H, gorsel }: Props) {
  const resim = useDurumGorseli(gorsel ?? null)
  const g = Math.min(1, Math.max(0, guc))
  if (g <= 0.01) return null
  const k = kutuOf(alan)
  const maske = `vk-maske-${id}`
  const lekeli = `vk-leke-${id}`
  const yanik = tur === 'yangin' || tur === 'yanik'
  const kirik = tur === 'deprem' || tur === 'yikik'
  const filtre = yanik ? 'url(#vk-yanik)' : kirik ? 'url(#vk-yikik)' : tur === 'salgin' ? 'url(#vk-salgin)' : 'url(#vk-kurak)'
  const pay = 40
  // Bina boyunca dağılan sabit noktalar (çatı hattı): alev ve dumanın yerleri.
  const catilar = [0.14, 0.32, 0.5, 0.66, 0.84, 0.24, 0.58, 0.76].map((u, i) => [k.x + k.w * u, k.y + k.h * (0.3 + ((i * 0.37) % 0.35))] as Nokta)
  const alevSayisi = tur === 'yangin' ? Math.max(1, Math.round(8 * g)) : 0
  return (
    <g pointerEvents="none" aria-hidden="true" className={`bina-efekti efekt-${tur}`}>
      <defs>
        {/* Yumuşak kenarlı maske: efekt binaya sinip kenarda haritaya karışır, dikdörtgen görünmez. */}
        <mask id={maske} maskUnits="userSpaceOnUse" x={k.x - pay} y={k.y - pay} width={k.w + pay * 2} height={k.h + pay * 2}>
          <polygon points={noktalar(alan)} fill="#fff" filter="url(#vk-yumusak)" />
        </mask>
        {/* Lekeli maske: is ve çatlak bütün binayı değil, yer yer kaplar. */}
        <mask id={lekeli} maskUnits="userSpaceOnUse" x={k.x - pay} y={k.y - pay} width={k.w + pay * 2} height={k.h + pay * 2}>
          <g mask={`url(#${maske})`}>
            <rect x={k.x - pay} y={k.y - pay} width={k.w + pay * 2} height={k.h + pay * 2} fill="#fff" filter="url(#vk-leke)" />
          </g>
        </mask>
      </defs>

      {resim ? (
        <g mask={`url(#${maske})`}>
          <image href={resim} x={k.x} y={k.y} width={k.w} height={k.h} preserveAspectRatio="none" opacity={g} />
        </g>
      ) : (
        <>
          {/* bütün binada hafif bir ton */}
          <g mask={`url(#${maske})`}>
            <image href={harita} x={0} y={0} width={W} height={H} preserveAspectRatio="none" filter={filtre} opacity={(yanik || kirik ? 0.35 : 0.55) * g + 0.15} />
          </g>
          {/* lekelerde güçlü iz: kömürleşmiş ya da kırılmış parçalar */}
          {(yanik || kirik) && (
            <g mask={`url(#${lekeli})`}>
              <image href={harita} x={0} y={0} width={W} height={H} preserveAspectRatio="none" filter={filtre} opacity={0.4 + 0.6 * g} />
              {yanik && <rect x={k.x} y={k.y} width={k.w} height={k.h} fill="#1E120C" opacity={(tur === 'yangin' ? 0.5 : 0.75) * g} style={{ mixBlendMode: 'multiply' }} />}
            </g>
          )}
        </>
      )}

      {tur === 'yangin' && (
        <>
          {/* korların ışığı: lekelerin içinden titrer */}
          <g mask={`url(#${lekeli})`}>
            <rect className="efekt-isik" x={k.x} y={k.y} width={k.w} height={k.h} fill="url(#vk-kor-isigi)" opacity={0.8 * g} style={{ mixBlendMode: 'screen' }} />
          </g>
          {/* alevin ışığı çevreye taşar */}
          <ellipse className="efekt-isik" cx={k.x + k.w / 2} cy={k.y + k.h * 0.5} rx={k.w * 0.75} ry={k.h * 0.8} fill="url(#vk-alev-isigi)" opacity={0.55 * g} style={{ mixBlendMode: 'screen' }} />
          {/* duman */}
          {catilar.slice(0, 3 + Math.round(2 * g)).map(([x, y], i) => (
            <g key={`d${i}`} className="efekt-duman" style={{ animationDelay: `${-i * 0.8}s`, opacity: 0.75 * g }}>
              {[0, 1, 2, 3].map((j) => (
                <circle key={j} cx={x + (j % 2 ? 16 : -12)} cy={y - 30 - j * 42} r={24 + j * 14} fill={j < 2 ? '#3A2D26' : '#6E6258'} opacity={0.6 - j * 0.12} filter="url(#vk-bulanik)" />
              ))}
            </g>
          ))}
          {/* çatıdaki alevler */}
          {catilar.slice(0, alevSayisi).map(([x, y], i) => (
            <DekorAlev key={`a${i}`} x={x} y={y} s={38 + ((i * 13) % 22)} gecikme={-(i * 0.17)} />
          ))}
          {/* kıvılcımlar */}
          {Array.from({ length: Math.round(14 * g) }, (_, i) => (
            <circle key={`k${i}`} className="efekt-kivilcim" style={{ animationDelay: `${-(i * 0.31) % 2.2}s` }} cx={k.x + k.w * (0.1 + ((i * 0.618) % 0.8))} cy={k.y + k.h * (0.3 + ((i * 0.41) % 0.3))} r={2.5 + (i % 3)} fill={i % 2 ? '#FFC14D' : '#FF8A3D'} />
          ))}
        </>
      )}

      {tur === 'yanik' && (
        // söndükten sonra: ince, tek tük tüten duman
        catilar.slice(0, 2).map(([x, y], i) => (
          <g key={i} className="efekt-duman yavas" style={{ animationDelay: `${-i * 1.6}s`, opacity: 0.45 * g }}>
            <circle cx={x} cy={y - 20} r={18} fill="#8C8178" filter="url(#vk-bulanik)" />
            <circle cx={x + 10} cy={y - 60} r={26} fill="#A49A90" filter="url(#vk-bulanik)" />
          </g>
        ))
      )}

      {tur === 'deprem' && (
        <g className="efekt-toz" style={{ opacity: 0.6 * g }}>
          {[0.15, 0.4, 0.62, 0.85].map((u, i) => (
            <ellipse key={u} cx={k.x + k.w * u} cy={k.y + k.h * (0.8 - (i % 2) * 0.25)} rx={70} ry={38} fill="#D6C6A4" opacity={0.75} filter="url(#vk-bulanik)" style={{ animationDelay: `${-i * 0.6}s` }} />
          ))}
        </g>
      )}

      {kirik && (
        <g opacity={g}>
          {/* çatlaklar */}
          {[[0.2, 0.25], [0.55, 0.35], [0.78, 0.2]].map(([u, v], i) => {
            const x = k.x + k.w * u
            const y = k.y + k.h * v
            return <path key={`c${i}`} d={`M${x},${y} l14,22 l-10,18 l16,26 l-6,20`} fill="none" stroke="#2E241A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" opacity={0.8} />
          })}
          {/* moloz */}
          {[[0.22, 0.95], [0.48, 0.98], [0.72, 0.94], [0.9, 0.9]].map(([u, v], i) => (
            <g key={i} transform={`translate(${k.x + k.w * u},${k.y + k.h * v})`}>
              <ellipse cx={0} cy={10} rx={30} ry={9} fill="#3A2A18" opacity={0.25} />
              <path d="M-26,8 L-18,-6 L-6,-2 L2,-14 L14,-6 L24,-10 L28,8 Z" fill="#B3A386" stroke="#4A3F31" strokeWidth={2} strokeLinejoin="round" />
              <path d="M-12,8 L-6,-1 L6,2 L10,8 Z" fill="#8E8270" stroke="#4A3F31" strokeWidth={2} strokeLinejoin="round" />
              <rect x={10} y={-2} width={12} height={7} fill="#C8846A" stroke="#4A3F31" strokeWidth={1.5} transform="rotate(-18 16 1)" />
            </g>
          ))}
        </g>
      )}
    </g>
  )
}

/** Efektlerin ortak filtreleri ve renkleri: sahnenin <defs> içine bir kez konur. */
export function EfektTanimlari() {
  return (
    <>
      {/* yanık: karart, kızıllaştır */}
      <filter id="vk-yanik" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.42 0.22 0.06 0 0.03  0.2 0.22 0.05 0 0.01  0.12 0.12 0.06 0 0  0 0 0 1 0" />
        <feComponentTransfer>
          <feFuncR type="gamma" amplitude="1.1" exponent="1.3" offset="0" />
          <feFuncG type="gamma" amplitude="0.9" exponent="1.5" offset="0" />
          <feFuncB type="gamma" amplitude="0.8" exponent="1.6" offset="0" />
        </feComponentTransfer>
      </filter>
      {/* yıkık: görüntüyü kır, tozla, soldur */}
      <filter id="vk-yikik" colorInterpolationFilters="sRGB" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="turbulence" baseFrequency="0.045" numOctaves="2" seed="3" result="kirik" />
        <feDisplacementMap in="SourceGraphic" in2="kirik" scale="22" xChannelSelector="R" yChannelSelector="G" result="kayik" />
        <feColorMatrix in="kayik" type="saturate" values="0.45" result="soluk" />
        <feComponentTransfer in="soluk">
          <feFuncR type="linear" slope="0.78" intercept="0.03" />
          <feFuncG type="linear" slope="0.74" intercept="0.03" />
          <feFuncB type="linear" slope="0.68" intercept="0.02" />
        </feComponentTransfer>
      </filter>
      {/* salgın: solgun, yeşilimsi gri, kepenkler kapalı gibi koyu */}
      <filter id="vk-salgin" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.35 0.4 0.1 0 0.02  0.33 0.45 0.12 0 0.04  0.25 0.33 0.1 0 0.02  0 0 0 1 0" />
      </filter>
      {/* kurak: kavruk kahverengi, çatlak doku */}
      <filter id="vk-kurak" colorInterpolationFilters="sRGB">
        <feColorMatrix type="matrix" values="0.5 0.45 0.1 0 0.08  0.38 0.4 0.08 0 0.05  0.2 0.25 0.06 0 0.02  0 0 0 1 0" result="kuru" />
        <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="11" result="doku" />
        <feColorMatrix in="doku" type="matrix" values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.1  0 0 0 -2.2 1.25" result="catlak" />
        <feComposite in="catlak" in2="kuru" operator="atop" result="c" />
        <feBlend in="c" in2="kuru" mode="multiply" />
      </filter>
      <filter id="vk-yumusak" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="16" />
      </filter>
      {/* lekeler: beyaz-siyah gürültü, eşiklenmiş; maske olarak kullanılır */}
      <filter id="vk-leke" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="3" seed="7" />
        <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  3.2 0 0 0 -1.25" />
      </filter>
      <filter id="vk-bulanik" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur stdDeviation="10" />
      </filter>
      <radialGradient id="vk-alev-isigi">
        <stop offset="0" stopColor="#FFB547" stopOpacity="0.9" />
        <stop offset="0.5" stopColor="#F06A1E" stopOpacity="0.45" />
        <stop offset="1" stopColor="#F06A1E" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="vk-kor-isigi" cx="0.5" cy="0.65" r="0.7">
        <stop offset="0" stopColor="#FF9A2E" stopOpacity="0.95" />
        <stop offset="0.6" stopColor="#D2451A" stopOpacity="0.55" />
        <stop offset="1" stopColor="#7A2010" stopOpacity="0.2" />
      </radialGradient>
      <linearGradient id="vk-kor" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#8A2A10" />
        <stop offset="1" stopColor="#3A1A10" />
      </linearGradient>
    </>
  )
}
