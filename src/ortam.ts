import { ingilizce } from './dil'

// Oyunun çalıştığı ortam: tek başına (bu repo) ya da başka bir uygulamanın içinde (web /tr/oyun, mobil Oyun sekmesi).
// Gömülü çalışırken ev sahibi uygulama `araclar` verir; verilmeyen her şey için güvenli varsayılanlar kullanılır.

export type GercekEser = {
  id: string
  ad: string
  il: string
  tur: string
  ilce?: string
  gorsel?: string // tam adres
  /** Bütün fotoğraflar (varsa), sırayla. */
  gorseller?: string[]
}

/** Ev sahibi uygulamanın oyuna verdiği yardımcılar (feyzabb/vakfiye oyun.js sözleşmesi + iki ek). */
export type Araclar = {
  bildir?: (metin: string) => void
  pullar?: () => string[]
  kaydet?: (anahtar: string, deger: unknown) => void
  oku?: <T>(anahtar: string, varsayilan: T) => T
  /** Ek: o türdeki gerçek eserler. Verilmezse ESER_API'den çekilir. */
  eserler?: (turler: string[]) => Promise<GercekEser[]>
  /** Ek: eser kartını aç. Verilmezse sitedeki eser sayfası yeni sekmede açılır. */
  eserAc?: (id: string) => void
  /** Ek: ev sahibinin dili (ör. web'de /en/oyun → 'en'). Verilirse oyun bu dilde açılır; verilmezse oyuncunun son seçimi. */
  dil?: 'tr' | 'en'
  /** Ek: sitede giriş yapmış üyenin adı. Verilirse vakfiyedeki vâkıf adı buradan gelir; üye yoksa/boşsa "Bir hayır sahibi" yazılır. */
  uyeAdi?: () => string | null | undefined
}

/** Yayındaki eserlerin herkese açık ucu (Tekinoglu-Firin/web, CORS açık). */
export const SITE = 'https://vakfiye.vercel.app'

export const ortam: { araclar: Araclar; kok: HTMLElement | null; gomulu: boolean; varlikKoku: string } = {
  araclar: {},
  kok: null,
  gomulu: false,
  /** Bina görsellerinin (binalar/) bulunduğu klasör. Gömülüyken oyun dosyasının yanındaki klasör. */
  varlikKoku: import.meta.env.BASE_URL ?? '/',
}

type HamEser = { id: string; ad: { tr: string; en?: string } | string; il: string; tur: string; ilce?: string; gorseller?: { dosya: string }[]; taslak?: boolean }

let onbellek: Promise<HamEser[]> | null = null

function siteEserleri(): Promise<HamEser[]> {
  onbellek ??= fetch(`${SITE}/api/eserler`)
    .then((y) => (y.ok ? y.json() : { eserler: [] }))
    .then((j: { eserler: HamEser[] }) => j.eserler ?? [])
    .catch(() => {
      onbellek = null // bağlantı yoksa bir dahaki sefere tekrar dene
      return []
    })
  return onbellek
}

function tamAdres(dosya: string) {
  if (/^https?:/.test(dosya)) return dosya
  return `${SITE}${dosya.startsWith('/') ? '' : '/'}${dosya}`
}

export async function gercekEserler(turler: string[]): Promise<GercekEser[]> {
  if (ortam.araclar.eserler) return ortam.araclar.eserler(turler)
  const hepsi = await siteEserleri()
  return hepsi
    .filter((e) => !e.taslak && turler.includes(e.tur))
    .map((e) => ({
      id: e.id,
      ad: typeof e.ad === 'string' ? e.ad : (ingilizce() && e.ad.en) || e.ad.tr,
      il: e.il,
      tur: e.tur,
      ilce: e.ilce,
      gorsel: e.gorseller?.[0]?.dosya ? tamAdres(e.gorseller[0].dosya) : undefined,
      gorseller: e.gorseller?.map((g) => tamAdres(g.dosya)),
    }))
}

/** Eser sitesindeki tam sayfa adresi. */
export function eserSayfasi(id: string) {
  return `${SITE}/${ingilizce() ? 'en' : 'tr'}/eser/${encodeURIComponent(id)}`
}

/** Tek bir eserin bilgisi (oyun içi eser paneli için). Bulunamazsa null. */
export async function eserBul(id: string): Promise<GercekEser | null> {
  const e = (await siteEserleri()).find((x) => x.id === id)
  if (!e) return null
  return {
    id: e.id,
    ad: typeof e.ad === 'string' ? e.ad : (ingilizce() && e.ad.en) || e.ad.tr,
    il: e.il,
    tur: e.tur,
    ilce: e.ilce,
    gorsel: e.gorseller?.[0]?.dosya ? tamAdres(e.gorseller[0].dosya) : undefined,
    gorseller: e.gorseller?.map((g) => tamAdres(g.dosya)),
  }
}

// Oyun içi eser paneli (sağda açılan) şimdilik kapalı: App eserDinle ile dinlemezse eser sitedeki sayfasında
// yeni sekmede açılır, oyun yerinde kalır. Paneli geri getirmek için App'te eserDinle'yi yeniden bağla
// (src/arayuz/EserPaneli.tsx duruyor).
let eserDinleyici: ((id: string) => void) | null = null
export function eserDinle(f: ((id: string) => void) | null) {
  eserDinleyici = f
}

export function eserAc(id: string) {
  if (eserDinleyici) return eserDinleyici(id)
  if (ortam.araclar.eserAc) return ortam.araclar.eserAc(id)
  window.open(eserSayfasi(id), '_blank', 'noopener')
}

/** Sitenin ana sayfasını bu tür filtresiyle yeni sekmede açar (ör. ?tur=cami). Gömülüyken aynı sitede kalır. */
export function turSayfasiAc(tur: string) {
  window.open(`${ortam.gomulu ? '' : SITE}/${ingilizce() ? 'en' : 'tr'}?tur=${encodeURIComponent(tur)}`, '_blank', 'noopener')
}
