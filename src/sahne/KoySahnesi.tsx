import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as RPointerEvent, type WheelEvent as RWheelEvent } from 'react'
import type { Durum } from '../motor/motor'
import { SABITLER as S, type AmacId } from '../motor/sabitler'
import { ARSA_SIRASI, ARSALAR, BOLGELER, bolgeAcik, sehirTuru, YAPILAR, type ArsaId, type BolgeId } from '../motor/sehir'
import { ortam } from '../ortam'
import { iki, L } from '../dil'
import { SezonKatmani } from './SezonKatmani'
import type { Sezon } from '../sezon'
import type { EsnafHikayesi } from '../esnaf'
import type { Mudahale } from '../mudahale'
import { MudahaleKatmani } from './MudahaleKatmani'
import { NpcKatmani } from './npc/NpcKatmani'
import type { YerId } from '../arayuz/yerler'
import type { NpcKosullari } from './npc/npc'
import { BinaEfekti, EfektTanimlari, type EfektTuru } from './Efektler'
import { ARSA_ALANI, BINA_ALANI, BOLGE_CEVRESI, BOLGE_TABELASI, HARITA, HAYRAT_ALANI, kutuOf, noktalar, orta, tepe, type BinaId, type Nokta } from './harita'
import { SILUET } from './siluet'

const tam = (n: number) => String(Math.round(n))

const BINA_ADI: Record<BinaId, string> = iki<Record<BinaId, string>>({ hamam: 'Hamam', han: 'Han', arazi: 'Tarlalar', sandik: 'Vakıf sandığı', hayrat: 'Hayrat' }, { hamam: 'Bathhouse', han: 'Inn', arazi: 'Fields', sandik: 'Foundation chest', hayrat: 'Service building' })

export type Gorunum = 'koy' | 'sehir'
type Kutu = { x: number; y: number; w: number; h: number }

// Köy görünümü vakfın ilk binalarına yakından bakar; şehir görünümü bütün haritayı gösterir.
const KADRAJ: Record<Gorunum, { genis: Kutu; dar: Kutu }> = {
  koy: { genis: { x: 330, y: 70, w: 1000, h: 680 }, dar: { x: 540, y: 80, w: 480, h: 960 } },
  sehir: { genis: { x: -8, y: -8, w: HARITA.w + 16, h: HARITA.h + 16 }, dar: { x: 0, y: 0, w: HARITA.w, h: HARITA.h } },
}

type Props = {
  durum: Durum
  secili: BinaId | null
  onSec: (b: BinaId | null) => void
  etiketler: boolean
  gorunum?: Gorunum
  pulSayisi?: number
  seciliArsa?: ArsaId | null
  onArsaSec?: (a: ArsaId | null) => void
  /** Yakınlaştırma düğmeleri: her değişimde bir adım (+1 yakın, -1 uzak). */
  yakinlik?: { n: number; yon: 1 | -1 }
  /** Sezon mini oyunu oynanıyorsa: bütün harita görünür, sezonun balonları, keseleri ve arabası çizilir. */
  sezon?: { s: Sezon; onTopla: (id: string) => void; onKese: (id: number) => void } | null
  /** Şehrin bilgi yerleri (lonca odası, kümbet...): haritada sabit, dokununca bilgi. */
  bilgiYerleri?: { yerler: EsnafHikayesi[]; okunan: string[]; onSec: (h: EsnafHikayesi) => void } | null
  /** Sezondan sonra sandığın başında bekleyen hayırsever (bilgi sorusu): dokununca soru. */
  hayirsever?: (() => void) | null
  /** Afet müdahalesi oynanıyorsa: kamera olay yerine döner, alevler/enkaz/hastalar çizilir. */
  mudahale?: { m: Mudahale; alanlar: Nokta[][]; kuyu: Nokta | null; yataklar: Nokta[]; onDokun: (id: number) => void; onKuyu: () => void } | null
  /** Olay anında kameranın yaklaşacağı yerler (müdahale teklifi gösterilirken). */
  odak?: Nokta[][] | null
  /** Vakfa ait olmayan bir yere (köprü, değirmen, başka vakfın binası) dokunulunca. */
  onYer?: (y: YerId) => void
}

/** Motor durumunu minyatür haritaya çevirir: vakfa ait yapılar renkli, diğerleri soluk; olaylar efektle. */
export function KoySahnesi({ durum, secili, onSec, etiketler, gorunum: istenen = 'koy', pulSayisi = 0, seciliArsa = null, onArsaSec, yakinlik, sezon, bilgiYerleri, hayirsever, mudahale, odak: olayOdagi, onYer }: Props) {
  const gorunum: Gorunum = sezon ? 'sehir' : istenen
  const d = durum
  const k = d.bekleyenKarar
  const olay = d.sonTur?.olay ?? null
  const amac = d.ayarlar.amac
  const hayratAd = S.AMACLAR[amac].ad
  const kapali = d.sonTur ? !d.sonTur.odendi : false
  const harita = `${ortam.varlikKoku}${HARITA.dosya}`

  const alan = (b: BinaId): Nokta[] => (b === 'hayrat' ? HAYRAT_ALANI[amac] : BINA_ALANI[b])
  const acik = (b: BolgeId) => bolgeAcik(b, d.yil, pulSayisi)

  const hamamHasarli = (k?.hasarHamam ?? 0) > 0 || d.geriGelenler.some((g) => g.mulk === 'hamam') || d.mulk.hamam < d.ayarlar.sermaye.hamam
  const hanHasarli = (k?.hasarHan ?? 0) > 0 || d.geriGelenler.some((g) => g.mulk === 'han') || d.mulk.han < d.ayarlar.sermaye.han

  // Soluk görünen alanlar: başka vakfın hizmet binaları, kurulmamış arsalar, kilitli bölgelerin çevresi,
  // sandık boşsa vakfın kendi hizmet binası ve sandığı, hiç yatırım yapılmamış mülkler.
  const soluk = useMemo(() => {
    const l: Nokta[][] = []
    // Başka hizmet binaları: kurulmadıkça soluk (cami hep dolu görünür; vakfın kendi hizmetinin arsası hiç kullanılmaz).
    for (const a of Object.keys(HAYRAT_ALANI) as (keyof typeof HAYRAT_ALANI)[]) {
      if (a !== amac && a !== 'cami' && !(Object.keys(d.yapilar) as ArsaId[]).some((x) => ARSALAR[x].izin[0] === a)) l.push(HAYRAT_ALANI[a])
    }
    for (const a of ARSA_SIRASI) if (!d.yapilar[a] && ARSALAR[a].izin[0] !== amac) l.push(ARSA_ALANI[a])
    if (kapali) l.push(HAYRAT_ALANI[amac], BINA_ALANI.sandik)
    if (d.mulk.hamam <= 0) l.push(BINA_ALANI.hamam)
    if (d.mulk.han <= 0) l.push(BINA_ALANI.han)
    if (d.mulk.arazi <= 0) l.push(BINA_ALANI.arazi)
    return l
  }, [amac, d.yapilar, d.yil, pulSayisi, kapali, d.mulk.hamam, d.mulk.han, d.mulk.arazi])

  // Kilitli bölgeler: daha da soluk, kurak ve tozlu (vakfın henüz ulaşmadığı yerler).
  const kilitli = useMemo(() => {
    const l: Nokta[][] = []
    for (const b of Object.keys(BOLGELER) as BolgeId[]) if (!bolgeAcik(b, d.yil, pulSayisi)) l.push(...BOLGE_CEVRESI[b])
    return l
  }, [d.yil, pulSayisi])

  const sarsinti = olay === 'deprem' && k ? 'sahne-sars' : ''

  // ---------- Kamera ----------
  const svgRef = useRef<SVGSVGElement>(null)
  const [dar, setDar] = useState(false)
  useEffect(() => {
    const el = svgRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver(([g]) => setDar(g.contentRect.width < 600 && g.contentRect.height > g.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Müdahalede kamera olay yerine (alanlar + çeşme/yataklar) yakın çekim yapar.
  const odak = mudahale ? [...mudahale.alanlar.flat(), ...(mudahale.kuyu && !dar ? [mudahale.kuyu] : []), ...mudahale.yataklar] : olayOdagi?.length ? olayOdagi.flat() : null
  const odakAnahtar = odak ? odak.map((p) => p.join(',')).join(';') : ''
  const hedef = odak ? odakKadraj(odak, dar) : KADRAJ[gorunum][dar ? 'dar' : 'genis']
  const [vb, setVb] = useState<Kutu>(hedef)
  const vbRef = useRef(vb)
  vbRef.current = vb

  useEffect(() => {
    const azalt = typeof window !== 'undefined' && (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || svgRef.current?.closest('[data-hareket="az"]'))
    const bas = vbRef.current
    if (azalt) return setVb(hedef)
    let iptal = false
    const t0 = performance.now()
    const adim = (t: number) => {
      if (iptal) return
      const u = Math.min(1, (t - t0) / 450)
      const e = 1 - Math.pow(1 - u, 3)
      setVb({ x: bas.x + (hedef.x - bas.x) * e, y: bas.y + (hedef.y - bas.y) * e, w: bas.w + (hedef.w - bas.w) * e, h: bas.h + (hedef.h - bas.h) * e })
      if (u < 1) requestAnimationFrame(adim)
    }
    requestAnimationFrame(adim)
    return () => {
      iptal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gorunum, dar, odakAnahtar])

  const sinirla = useCallback((v: Kutu): Kutu => {
    // Uzaklaşınca kasabanın çevresindeki bozkır da görünsün (haritanın 1,6 katına kadar).
    const w = Math.min(Math.max(v.w, 320), HARITA.w * 1.35)
    const h = (v.h / v.w) * w
    const pay = 60
    // Kadraj haritadan büyükse ortala (kasaba ortada, çevresi bozkır); değilse haritanın içinde tut.
    const x = w >= HARITA.w + 2 * pay ? (HARITA.w - w) / 2 : Math.min(Math.max(v.x, -pay), HARITA.w + pay - w)
    const y = h >= HARITA.h + 2 * pay ? (HARITA.h - h) / 2 : Math.min(Math.max(v.y, -pay), HARITA.h + pay - h)
    return { w, h, x, y }
  }, [])

  useEffect(() => {
    if (!yakinlik?.n) return
    const v = vbRef.current
    const k2 = yakinlik.yon > 0 ? 1 / 1.3 : 1.3
    const cx = v.x + v.w / 2
    const cy = v.y + v.h / 2
    setVb(sinirla({ w: v.w * k2, h: v.h * k2, x: cx - (v.w * k2) / 2, y: cy - (v.h * k2) / 2 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yakinlik?.n])

  const surukle = useRef<{ id: number; x: number; y: number; vb: Kutu; oynadi: boolean } | null>(null)
  const surukledi = useRef(false)
  const basildi = (e: RPointerEvent<SVGSVGElement>) => {
    if (e.button !== 0) return
    surukle.current = { id: e.pointerId, x: e.clientX, y: e.clientY, vb: vbRef.current, oynadi: false }
    surukledi.current = false
  }
  const oynadi = (e: RPointerEvent<SVGSVGElement>) => {
    const s = surukle.current
    const el = svgRef.current
    if (!s || !el || s.id !== e.pointerId) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (!s.oynadi && Math.hypot(dx, dy) < 6) return
    if (!s.oynadi) el.setPointerCapture(e.pointerId)
    s.oynadi = true
    surukledi.current = true
    const r = el.getBoundingClientRect()
    const olcek = Math.max(s.vb.w / r.width, s.vb.h / r.height)
    setVb(sinirla({ ...s.vb, x: s.vb.x - dx * olcek, y: s.vb.y - dy * olcek }))
  }
  const birakti = () => {
    surukle.current = null
  }
  const tekerlek = (e: RWheelEvent<SVGSVGElement>) => {
    const el = svgRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const v = vbRef.current
    const olcek = Math.max(v.w / r.width, v.h / r.height)
    const px = v.x + (e.clientX - r.left - (r.width - v.w / olcek) / 2) * olcek
    const py = v.y + (e.clientY - r.top - (r.height - v.h / olcek) / 2) * olcek
    const k2 = e.deltaY > 0 ? 1.1 : 1 / 1.1
    setVb(sinirla({ w: v.w * k2, h: v.h * k2, x: px - (px - v.x) * k2, y: py - (py - v.y) * k2 }))
  }
  const tikla = (fn: () => void) => (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    if (surukledi.current) return
    fn()
  }
  const klavye = (fn: () => void) => (e: { key: string; preventDefault: () => void }) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      fn()
    }
  }

  // ---------- Bu turun kazancı: alanların üstünde uçan sikkeler ----------
  const t = d.sonTur
  const m = S.MULKLER
  const kazanc: [string, Nokta[], number][] = t
    ? [
        ['hamam', BINA_ALANI.hamam, d.mulk.hamam * m.hamam.gelir],
        ['han', BINA_ALANI.han, t.olay === 'savas' ? 0 : d.mulk.han * m.han.gelir],
        ['arazi', BINA_ALANI.arazi, t.olay === 'kuraklik' ? 0 : d.mulk.arazi * m.arazi.gelir],
        ...ARSA_SIRASI.filter((a) => d.yapilar[a]).map((a) => [a, ARSA_ALANI[a], sehirTuru(d.yapilar, t.olay, 0, 0).ayrinti[a] ?? 0] as [string, Nokta[], number]),
      ]
    : []
  const sandikOrta = orta(BINA_ALANI.sandik)

  // ---------- Köylüler: oyun durumuna göre duraklar ----------
  // Kapalı aşevinin önünde kuyruk olmaz, kuru çeşmede su alınmaz; salgında hamam ve pazar boşalır.
  const hareketAz = typeof document !== 'undefined' && document.documentElement.dataset.hareket === 'az'
  const npcKosullari: NpcKosullari = {
    durakAcik: (yer) => {
      if (yer === 'asevi') return !(amac === 'asevi' && kapali)
      if (yer === 'cesme') return !(amac === 'cesme' && kapali) && olay !== 'kuraklik'
      if (yer === 'hamam' || yer === 'pazar') return olay !== 'salgin'
      return true
    },
  }

  // ---------- Olay efektleri ----------
  // Canlı olay (karar bekleniyor ya da müdahale oynanıyor) tam güçte; müdahalede söndürdükçe/kaldırdıkça azalır.
  const mt = mudahale?.m
  const yanginGucu = mt?.tur === 'yangin' ? Math.min(1, 0.2 + mt.hedefler.reduce((a, h) => a + h.deger, 0) / 6) : 1
  const enkazGucu = mt?.tur === 'deprem' ? Math.min(1, 0.35 + mt.hedefler.length * 0.13) : 1
  const sonHanOlayi = [...d.kararlar].reverse().find((x) => x.olay === 'yangin' || x.olay === 'deprem')?.olay
  const efektler: { id: string; alan: Nokta[]; tur: EfektTuru; guc: number; gorsel: string }[] = []
  // Müdahale edildiyse (soru bilindi ya da görev bitti) afet söner: yangın kararmış iz, deprem yatışmış moloz olarak kalır.
  const sondu = !!k?.mudahale && !mt
  if (olay === 'yangin' && k) {
    efektler.push({ id: 'han', alan: BINA_ALANI.han, tur: sondu ? 'yanik' : 'yangin', guc: sondu ? 0.8 : yanginGucu, gorsel: sondu ? 'han-yanik' : 'han-yangin' })
    if (d.yapilar.c1 && !sondu) efektler.push({ id: 'c1', alan: ARSA_ALANI.c1, tur: 'yangin', guc: yanginGucu, gorsel: 'arasta-yangin' })
  } else if (olay === 'deprem' && k) {
    if (k.hasarHamam > 0) efektler.push({ id: 'hamam', alan: BINA_ALANI.hamam, tur: sondu ? 'yikik' : 'deprem', guc: sondu ? 0.7 : enkazGucu, gorsel: 'hamam-yikik' })
    if (k.hasarHan > 0) efektler.push({ id: 'han', alan: BINA_ALANI.han, tur: sondu ? 'yikik' : 'deprem', guc: sondu ? 0.7 : enkazGucu, gorsel: 'han-yikik' })
  } else {
    if (hamamHasarli && d.mulk.hamam > 0) efektler.push({ id: 'hamam', alan: BINA_ALANI.hamam, tur: 'yikik', guc: 0.6, gorsel: 'hamam-yikik' })
    if (hanHasarli && d.mulk.han > 0) efektler.push({ id: 'han', alan: BINA_ALANI.han, tur: sonHanOlayi === 'yangin' ? 'yanik' : 'yikik', guc: 0.85, gorsel: sonHanOlayi === 'yangin' ? 'han-yanik' : 'han-yikik' })
    if (olay === 'salgin') efektler.push({ id: 'han', alan: BINA_ALANI.han, tur: 'salgin', guc: 0.85, gorsel: 'han-salgin' })
  }
  if (olay === 'kuraklik') {
    efektler.push({ id: 'arazi', alan: BINA_ALANI.arazi, tur: 'kurak', guc: 1, gorsel: 'arazi-kurak' })
    if (acik('koyler')) BOLGE_CEVRESI.koyler.forEach((a, i) => efektler.push({ id: `koy${i}`, alan: a, tur: 'kurak', guc: 1, gorsel: '' }))
  }

  // İki katman: alttaki sabit harita (üç kez çizilen resim, kuru toprak filtreleri, bulanık maskeler) yalnız
  // kadraj ya da soluk/kilitli alanlar değişince boyanır. Köylüler, halkalar ve efektler üst katmanda; onlar
  // hareket ettikçe yalnız üst katman yeniden boyanır (telefonda takılmayı bu ayrım giderir).
  const viewBox = `${vb.x.toFixed(1)} ${vb.y.toFixed(1)} ${vb.w.toFixed(1)} ${vb.h.toFixed(1)}`
  const oran = sezon && dar ? 'xMidYMin meet' : gorunum === 'sehir' && dar ? 'xMidYMid meet' : 'xMidYMid slice'
  return (
    <>
    <svg className={`koy-sahnesi harita-zemin ${sarsinti}`} viewBox={viewBox} preserveAspectRatio={oran} aria-hidden="true" focusable="false">
      <defs>
        {/* Vakfın henüz ulaşmadığı yerler kurak, tozlu bir arazi gibi görünür (sepya + kuru toprak dokusu). */}
        <filter id="vk-soluk" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="matrix" values="0.39 0.77 0.19 0 0  0.35 0.69 0.17 0 0  0.27 0.53 0.13 0 0  0 0 0 1 0" result="sepya" />
          <feComponentTransfer in="sepya" result="toz">
            <feFuncR type="linear" slope="0.48" intercept="0.40" />
            <feFuncG type="linear" slope="0.45" intercept="0.33" />
            <feFuncB type="linear" slope="0.38" intercept="0.22" />
          </feComponentTransfer>
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="doku" />
          <feColorMatrix in="doku" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.18  0 0 0 -1.4 0.95" result="catlak" />
          <feComposite in="catlak" in2="toz" operator="atop" result="kuru" />
          <feBlend in="kuru" in2="toz" mode="multiply" />
        </filter>
        {/* Kilitli bölgeler: neredeyse renksiz, kuma çalan, çatlak toprak dokulu. */}
        <filter id="vk-kilitli" colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
          <feColorMatrix type="saturate" values="0.12" result="gri" />
          <feComponentTransfer in="gri" result="kum">
            <feFuncR type="linear" slope="0.32" intercept="0.60" />
            <feFuncG type="linear" slope="0.30" intercept="0.52" />
            <feFuncB type="linear" slope="0.26" intercept="0.38" />
          </feComponentTransfer>
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="doku" />
          <feColorMatrix in="doku" type="matrix" values="0 0 0 0 0.42  0 0 0 0 0.30  0 0 0 0 0.17  0 0 0 -1.8 1.05" result="catlak" />
          <feComposite in="catlak" in2="kum" operator="atop" result="kuru" />
          <feBlend in="kuru" in2="kum" mode="multiply" />
        </filter>
        <mask id="vk-kilitli-maske" maskUnits="userSpaceOnUse" x="0" y="0" width={HARITA.w} height={HARITA.h}>
          <rect width={HARITA.w} height={HARITA.h} fill="#000" />
          <g filter="url(#vk-yumusak)" fill="#fff">
            {kilitli.map((p, i) => (
              <polygon key={i} points={noktalar(p)} />
            ))}
          </g>
        </mask>
        {/* Haritanın dışı: uzaklaşınca kasabanın çevresi kurak bozkır (küçük karo; bir kez çizilir). */}
        <filter id="vk-bozkir-doku" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="21" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.52  0 0 0 0 0.38  0 0 0 0 0.22  0 0 0 -2.2 1.2" />
        </filter>
        <pattern id="vk-bozkir" width={256} height={256} patternUnits="userSpaceOnUse">
          <rect width={256} height={256} fill="#D9C08C" />
          <rect width={256} height={256} filter="url(#vk-bozkir-doku)" opacity={0.55} />
          {[[30, 40], [180, 70], [90, 160], [220, 210], [140, 230], [60, 110]].map(([x, y], i) => (
            <g key={i} transform={`translate(${x},${y})`} opacity={0.7}>
              <ellipse cx={0} cy={4} rx={9} ry={3} fill="#9C8456" opacity={0.5} />
              <path d="M-6,3 Q-3,-6 0,2 Q3,-7 6,3" stroke="#8A7A45" strokeWidth={2} fill="none" strokeLinecap="round" />
            </g>
          ))}
          <path d="M10,200 l20,-8 l14,10 l18,-6 M150,20 l12,10 l20,-4 l10,12" stroke="#A8925F" strokeWidth={1.5} fill="none" opacity={0.6} />
        </pattern>
        <linearGradient id="vk-kenar-ust" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#D9C08C" /><stop offset="1" stopColor="#D9C08C" stopOpacity="0" /></linearGradient>
        <linearGradient id="vk-kenar-alt" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#D9C08C" /><stop offset="1" stopColor="#D9C08C" stopOpacity="0" /></linearGradient>
        <linearGradient id="vk-kenar-sol" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#D9C08C" /><stop offset="1" stopColor="#D9C08C" stopOpacity="0" /></linearGradient>
        <linearGradient id="vk-kenar-sag" x1="1" y1="0" x2="0" y2="0"><stop offset="0" stopColor="#D9C08C" /><stop offset="1" stopColor="#D9C08C" stopOpacity="0" /></linearGradient>
        <filter id="vk-yumusak">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <mask id="vk-soluk-maske" maskUnits="userSpaceOnUse" x="0" y="0" width={HARITA.w} height={HARITA.h}>
          <rect width={HARITA.w} height={HARITA.h} fill="#000" />
          <g filter="url(#vk-yumusak)" fill="#fff">
            {soluk.map((p, i) => (
              <polygon key={i} points={noktalar(p)} />
            ))}
          </g>
        </mask>
      </defs>

      <rect x={-3000} y={-3000} width={HARITA.w + 6000} height={HARITA.h + 6000} fill="url(#vk-bozkir)" />
      <image href={harita} x={0} y={0} width={HARITA.w} height={HARITA.h} preserveAspectRatio="none" />
      <image href={harita} x={0} y={0} width={HARITA.w} height={HARITA.h} preserveAspectRatio="none" filter="url(#vk-soluk)" mask="url(#vk-soluk-maske)" />
      <image href={harita} x={0} y={0} width={HARITA.w} height={HARITA.h} preserveAspectRatio="none" filter="url(#vk-kilitli)" mask="url(#vk-kilitli-maske)" />
      {/* haritanın kenarı bozkıra karışsın */}
      <g pointerEvents="none">
        <rect x={0} y={0} width={HARITA.w} height={70} fill="url(#vk-kenar-ust)" />
        <rect x={0} y={HARITA.h - 70} width={HARITA.w} height={70} fill="url(#vk-kenar-alt)" />
        <rect x={0} y={0} width={70} height={HARITA.h} fill="url(#vk-kenar-sol)" />
        <rect x={HARITA.w - 70} y={0} width={70} height={HARITA.h} fill="url(#vk-kenar-sag)" />
      </g>

    </svg>
    <svg
      ref={svgRef}
      className={`koy-sahnesi harita-sahnesi ust-katman ${sarsinti}`}
      viewBox={viewBox}
      preserveAspectRatio={oran}
      role="img"
      aria-label={L(`${hayratAd} vakfının şehri, ${d.yil}. yıl`, `City of the ${hayratAd} foundation, year ${d.yil}`)}
      onPointerDown={basildi}
      onPointerMove={oynadi}
      onPointerUp={birakti}
      onPointerCancel={birakti}
      onWheel={tekerlek}
      onClickCapture={(e) => {
        if (surukledi.current) {
          e.stopPropagation()
          surukledi.current = false
        }
      }}
    >
      <defs>
        <EfektTanimlari />
      </defs>

      {/* olaylar: binanın kendisi değişir (yanar, yıkılır, solar); hasar onarılana kadar izi kalır */}
      {efektler.map((e) => (
        <BinaEfekti key={e.id} id={e.id} alan={e.alan} tur={e.tur} guc={e.guc} harita={harita} W={HARITA.w} H={HARITA.h} gorsel={e.gorsel} />
      ))}
      {olay === 'savas' && (
        <Tabela nokta={[tepe(BINA_ALANI.han)[0], tepe(BINA_ALANI.han)[1] - 20]} metin={L('Savaş: yol kapalı', 'War: road closed')} renk="#4A4F5C" />
      )}
      {olay === 'bereket' && (
        <g style={{ mixBlendMode: 'screen', pointerEvents: 'none' }}>
          <polygon points={noktalar(BINA_ALANI.arazi)} fill="#F2C14E" opacity={0.45} className="sahne-parilti" />
        </g>
      )}
      {olay === 'bereket' && <Tabela nokta={[tepe(BINA_ALANI.arazi)[0], tepe(BINA_ALANI.arazi)[1] - 10]} metin={L('Bereketli yıl: ürün ×2', 'Bountiful year: crops ×2')} renk="#3F8A25" />}
      {olay === 'kervan' && <Tabela nokta={[tepe(BINA_ALANI.han)[0], tepe(BINA_ALANI.han)[1] - 20]} metin={L('Kervan geldi: kira +%50', 'Caravan arrived: rent +50%')} renk="#3F8A25" />}
      {olay === 'salgin' && (
        <>
          <Tabela nokta={[tepe(BINA_ALANI.han)[0], tepe(BINA_ALANI.han)[1] - 20]} metin={L('Salgın: kervan gelmedi', 'Epidemic: no caravans')} renk="#5E6B3A" />
          <Tabela nokta={[tepe(HAYRAT_ALANI[amac])[0], tepe(HAYRAT_ALANI[amac])[1] + 34]} metin={L('İhtiyaç arttı', 'Need has grown')} renk="#5E6B3A" />
        </>
      )}
      {olay === 'bagis' && <Tabela nokta={[sandikOrta[0], kutuOf(BINA_ALANI.sandik).y - 16]} metin={L(`Bağış: yedek fon +${S.BAGIS_FON}`, `Gift: reserve fund +${S.BAGIS_FON}`)} renk="#3F8A25" />}
      {kapali && <Tabela nokta={tepe(HAYRAT_ALANI[amac])} metin={L(`${hayratAd} kapalı`, `${hayratAd} closed`)} renk="#A9452F" />}

      {/* şehrin gündelik hayatı: yol ağında yürüyen köylüler (süs; dokunulmaz) */}
      {!sezon && !mudahale && <NpcKatmani kosullar={npcKosullari} sayi={olay === 'salgin' ? 6 : undefined} durgun={hareketAz} />}

      {/* para akışı: bu tur kazanılan sikkeler sandığa uçar */}
      {t &&
        kazanc
          .filter(([, , n]) => n > 0)
          .map(([id, p, n], i) => {
            const [x, y] = tepe(p)
            const yol = `M${x},${y} Q${(x + sandikOrta[0]) / 2},${Math.min(y, sandikOrta[1]) - 60} ${sandikOrta[0]},${sandikOrta[1]}`
            return (
              <g key={`${t.yil}-${id}`} aria-hidden="true" pointerEvents="none">
                <g className="sikke-ucusu">
                  <g className="ucan" style={{ animationDelay: `${i * 0.1}s` }}>
                    <circle cx={x - 22} cy={y - 10} r={12} fill="#F2B33D" stroke="#7A4A22" strokeWidth={2.5} />
                    <text x={x - 6} y={y - 3} fontSize={24} fontWeight={800} fill="#fff" stroke="#5A3A00" strokeWidth={4.5} paintOrder="stroke" fontFamily="Nunito, sans-serif">
                      +{tam(n)}
                    </text>
                  </g>
                </g>
                <circle r={7} fill="#F2B33D" stroke="#7A4A22" strokeWidth={2} opacity={0}>
                  <animate attributeName="opacity" values="0;1;1;0" dur="1.4s" begin={`${0.3 + i * 0.12}s`} fill="freeze" />
                  <animateMotion dur="1.4s" begin={`${0.3 + i * 0.12}s`} fill="freeze" path={yol} />
                </circle>
              </g>
            )
          })}

      {etiketler && t && (
        <>
          <Tabela nokta={[sandikOrta[0], kutuOf(BINA_ALANI.sandik).y - 16]} metin={L(`Sandık ${tam(t.hizmeteKalan)}`, `Chest ${tam(t.hizmeteKalan)}`)} renk="#1B2433" />
          {!kapali && <Tabela nokta={tepe(HAYRAT_ALANI[amac])} metin={`${hayratAd} −${tam(t.gereken)}`} renk="#0E6E6D" />}
        </>
      )}

      {mudahale && <MudahaleKatmani m={mudahale.m} alanlar={mudahale.alanlar} kuyu={mudahale.kuyu} yataklar={mudahale.yataklar} o={dar ? 1.6 : 1} onDokun={mudahale.onDokun} onKuyu={mudahale.onKuyu} tikla={tikla} klavye={klavye} />}

      {sezon && <SezonKatmani s={sezon.s} amac={amac} o={dar ? 2.4 : 1} onTopla={sezon.onTopla} onKese={sezon.onKese} tikla={tikla} klavye={klavye} />}

      {/* kümbet: binanın kendisine dokunulur (arsa açıksa arsa paneli bilgiyi de gösterir) */}
      {!sezon && !mudahale && bilgiYerleri?.yerler.filter((h) => !h.kisi).map((h) => (
        <path key={h.id} d={SILUET.kumbet} className="bina-alani yer-alani" tabIndex={0} role="button" aria-label={`${h.yerAd}: ${h.baslik}`} onClick={tikla(() => bilgiYerleri.onSec(h))} onKeyDown={klavye(() => bilgiYerleri.onSec(h))} />
      ))}

      {/* vakfa ait olmayan yerler: dokununca kümbet gibi kısa bilgi kartı */}
      {!sezon && !mudahale && onYer && (
        [
          ['kopru', SILUET.kopru, L('Köprü: bilgi', 'Bridge: info')],
          ['degirmen', SILUET.degirmen, L('Su değirmeni: bilgi', 'Water mill: info')],
          ...(Object.keys(HAYRAT_ALANI) as AmacId[]).filter((a) => a !== amac).map((a) => [a, SILUET[a], L(`${S.AMACLAR[a].ad}: bilgi`, `${S.AMACLAR[a].ad}: info`)] as const),
        ] as [YerId, string, string][]
      ).map(([id, yol, etiket]) => (
        <path key={`yer-${id}`} d={yol} className="bina-alani yer-alani" tabIndex={0} role="button" aria-label={etiket} onClick={tikla(() => onYer(id))} onKeyDown={klavye(() => onYer(id))} />
      ))}

      {/* vakfın binaları: dokunma alanları */}
      {!sezon && !mudahale && (['hayrat', 'hamam', 'han', 'arazi', 'sandik'] as BinaId[]).map((id) => {
        const ortak = {
          className: `bina-alani ${secili === id ? 'secili' : ''}`,
          tabIndex: 0,
          role: 'button',
          'aria-label': id === 'hayrat' ? hayratAd : BINA_ADI[id],
          onClick: tikla(() => onSec(secili === id ? null : id)),
          onKeyDown: klavye(() => onSec(secili === id ? null : id)),
        }
        // Yapının kendi silüeti; tarlalar (arazi) bir bina değil, alan olduğu için dikdörtgen kalır.
        return id === 'arazi' ? <polygon key={id} points={noktalar(alan(id))} {...ortak} /> : <path key={id} d={id === 'hayrat' ? SILUET[amac] : SILUET[id]} {...ortak} />
      })}

      {/* şehrin arsaları */}
      {!sezon && !mudahale && ARSA_SIRASI.map((a) => {
        if (!acik(ARSALAR[a].bolge) || ARSALAR[a].izin[0] === amac) return null
        const yapi = d.yapilar[a]
        const tanim = YAPILAR[yapi ?? ARSALAR[a].izin[0]]
        return (
          <g key={a}>
            <path
              d={SILUET[ARSALAR[a].izin[0]]}
              className={`bina-alani ${seciliArsa === a ? 'secili' : ''}`}
              tabIndex={0}
              role="button"
              aria-label={yapi ? `${tanim.ad}, ${ARSALAR[a].ad}` : L(`${tanim.ad} kurulabilir, ${tanim.maliyet} akçe`, `${tanim.ad} can be built, ${tanim.maliyet} akçe`)}
              onClick={tikla(() => onArsaSec?.(seciliArsa === a ? null : a))}
              onKeyDown={klavye(() => onArsaSec?.(seciliArsa === a ? null : a))}
            />
          </g>
        )
      })}

      {/* boş arsa tabelaları: poligonların üstünde çizilir ve dokununca arsayı seçer (artıya basınca da çalışır) */}
      {!sezon && !mudahale && ARSA_SIRASI.map((a) => {
        if (!acik(ARSALAR[a].bolge) || d.yapilar[a] || ARSALAR[a].izin[0] === amac) return null
        const tanim = YAPILAR[ARSALAR[a].izin[0]]
        const [x, y] = tepe(ARSA_ALANI[a])
        return <Tabela key={`tb-${a}`} nokta={[x, y]} metin={`${tanim.ad} · ${tanim.maliyet}`} renk="#7A4A22" arti onTikla={tikla(() => onArsaSec?.(seciliArsa === a ? null : a))} />
      })}

      {/* şehrin bilgi yerleri: yerinde duran kişiler (lonca kethüdası, ahi, mütevelli...); dokununca bilgi */}
      {!sezon && !mudahale && bilgiYerleri?.yerler.map((h) => {
        const okundu = bilgiYerleri.okunan.includes(h.id)
        const sec = () => bilgiYerleri.onSec(h)
        const etiket = `${h.yerAd}: ${h.baslik}${okundu ? L(' (okundu)', ' (read)') : ''}`
        if (!h.kisi) return null
        const k = h.kisi
        const o = dar ? 1.5 : 1.25
        const yazi = h.etiket ?? h.kim
        const w = yazi.length * 7.2 + (okundu ? 30 : 18)
        return (
          <g key={h.id} transform={`translate(${h.yer[0]},${h.yer[1]}) scale(${o})`} className={`bilgi-kisi ${okundu ? 'okundu' : ''}`} role="button" tabIndex={0} aria-label={etiket} onClick={tikla(sec)} onKeyDown={klavye(sec)}>
            <rect x={-k.en / 2 - 6} y={-k.boy - 26} width={k.en + 12} height={k.boy + 30} fill="transparent" />
            <ellipse cx={0} cy={0} rx={k.en * 0.55} ry={4} fill="#F2B33D" opacity={okundu ? 0.25 : 0.55} className="bilgi-halka" />
            <ellipse cx={0} cy={-0.5} rx={k.en * 0.38} ry={2.4} fill="#3A2412" opacity={0.3} />
            <image href={`${ortam.varlikKoku}insanlar/s${k.resim}.webp`} x={-k.en / 2} y={-k.boy} width={k.en} height={k.boy} transform={k.ayna ? 'scale(-1,1)' : undefined} />
            <g transform={`translate(0,${-k.boy - 12})`}>
              <rect x={-w / 2} y={-9} width={w} height={18} rx={9} fill="#FFF4D6" stroke={okundu ? '#3F8A25' : '#7A4A22'} strokeWidth={1.8} />
              <text x={okundu ? -6 : 0} y={4.5} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#3A2A18" fontFamily="Nunito, sans-serif">{yazi}</text>
              {okundu && <path d={`M${w / 2 - 15},0 l3,3 l5,-6`} stroke="#3F8A25" strokeWidth={2} fill="none" strokeLinecap="round" />}
            </g>
          </g>
        )
      })}
      {!sezon && !mudahale && hayirsever && (
        <g transform={`translate(1040,700) scale(${dar ? 1.5 : 1.25})`} className="bilgi-kisi hayirsever" role="button" tabIndex={0} aria-label={L('Sandığın başında bir hayırsever bekliyor: bilgi sorusu', 'A benefactor is waiting by the chest: quiz question')} onClick={tikla(hayirsever)} onKeyDown={klavye(hayirsever)}>
          <rect x={-16} y={-62} width={32} height={66} fill="transparent" />
          <ellipse cx={0} cy={0} rx={12} ry={4} fill="#13807D" opacity={0.5} className="bilgi-halka" />
          <image href={`${ortam.varlikKoku}insanlar/s24.webp`} x={-9.2} y={-35.8} width={18.4} height={35.8} />
          <g transform="translate(0,-48)">
            <rect x={-40} y={-9} width={80} height={18} rx={9} fill="#E4F3F2" stroke="#13807D" strokeWidth={1.8} />
            <text y={4.5} textAnchor="middle" fontSize={11.5} fontWeight={800} fill="#0E4F4D" fontFamily="Nunito, sans-serif">{L('Hayırsever ?', 'Benefactor ?')}</text>
          </g>
        </g>
      )}

      {/* kilitli bölgeler: yalnızca bir tabela */}
      {!sezon && !mudahale && (Object.keys(BOLGELER) as BolgeId[])
        .filter((b) => !acik(b))
        .map((b) => {
          const tb = BOLGELER[b]
          return <Tabela key={b} nokta={BOLGE_TABELASI[b]} metin={L(`${tb.ad} · ${tb.yil}. yıl ya da ${tb.pul} pul`, `${tb.ad} · yr ${tb.yil} or ${tb.pul} stamp${tb.pul > 1 ? "s" : ""}`)} renk="#5B4632" kilit />
        })}
    </svg>
    </>
  )
}

function Tabela({ nokta: [x, y], metin, renk, arti, kilit, onTikla }: { nokta: Nokta; metin: string; renk: string; arti?: boolean; kilit?: boolean; onTikla?: (e: { stopPropagation: () => void }) => void }) {
  const w = metin.length * 10.5 + (arti || kilit ? 58 : 30)
  const sol = x - w / 2
  return (
    <g className={arti ? 'arsa-tabelasi' : ''} pointerEvents={onTikla ? 'all' : 'none'} style={onTikla ? { cursor: 'pointer' } : undefined} onClick={onTikla} aria-hidden="true">
      <rect x={sol} y={y - 19} width={w} height={38} rx={19} fill="#FFF4D6" stroke={renk} strokeWidth={3} />
      {arti && (
        <g transform={`translate(${sol + 22},${y})`}>
          <circle r={12} fill="#F2B33D" stroke="#7A4A22" strokeWidth={2.5} />
          <path d="M-5,0 H5 M0,-5 V5" stroke="#3A2205" strokeWidth={3} strokeLinecap="round" />
        </g>
      )}
      {kilit && (
        <g transform={`translate(${sol + 22},${y})`}>
          <rect x={-8} y={-3} width={16} height={12} rx={2} fill={renk} />
          <path d="M-5,-3 V-7 A5,5 0 0 1 5,-7 V-3" fill="none" stroke={renk} strokeWidth={2.6} />
        </g>
      )}
      <text x={arti || kilit ? sol + 40 : x} y={y + 6} textAnchor={arti || kilit ? 'start' : 'middle'} fontSize={18} fontWeight={800} fill="#3A2A18" fontFamily="Nunito, sans-serif">
        {metin}
      </text>
    </g>
  )
}

/** Verilen noktaları kapsayan, ekranın en-boy oranına uygun kadraj (müdahalede yakın çekim). */
function odakKadraj(p: Nokta[], dar: boolean): Kutu {
  const k = kutuOf(p)
  const pay = 110
  let w = k.w + pay * 2
  let h = k.h + pay * 2
  const oran = dar ? 0.55 : 1.55
  if (w / h > oran) h = w / oran
  else w = h * oran
  // Haritanın dışına taşmasın: gerekirse küçült, sonra içeri kaydır.
  if (h > HARITA.h) { h = HARITA.h; w = h * oran }
  if (w > HARITA.w) { w = HARITA.w; h = w / oran }
  const x = Math.min(Math.max(k.x + k.w / 2 - w / 2, 0), HARITA.w - w)
  const y = Math.min(Math.max(k.y + k.h / 2 - h / 2, 0), HARITA.h - h)
  return { x, y, w, h }
}
