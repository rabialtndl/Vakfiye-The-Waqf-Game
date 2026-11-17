import { ortam } from './ortam'

// Oyuncu ayarları ve ilerleme: cihazda saklanır, hesap gerekmez.
// Oyunun kurallarını değiştirmez (zorluk hariç: kolay modda çöküş sınırı 4 tur).

export type OyunHizi = 'yavas' | 'normal' | 'hizli'
export type YaziBoyutu = 'normal' | 'buyuk' | 'cokBuyuk'

export type OyunAyarlari = {
  zorluk: 'kolay' | 'normal'
  hiz: OyunHizi
  paraEtiketleri: boolean
  ipuclari: boolean
  titresim: boolean
  yaziBoyutu: YaziBoyutu
  yuksekKontrast: boolean
  hareketiAzalt: boolean
  /** +10 yıl turundan önce sezon mini oyunu. */
  sezonOyunu: boolean
  /** Sezon süresiz oynanır (kişiler beklemekten sıkılmaz). */
  sezonSuresiz: boolean
  /** Yangın, deprem ve salgında kısa müdahale oyunu önerilir. */
  mudahale: boolean
  /** Felaket anında iki şıklı soru: bilirsen afet söner. */
  afetSorusu: boolean
  /** Her olay oyunda bir kez çıkar: şehri incelemeye vakit kalır. */
  olayBirKez: boolean
  /** İki olay arasında en az 30 yıl sakin geçer. */
  olayArasi: boolean
  /** Oyun sesleri. */
  ses: boolean
  /** Oyun ekranında sakin fon müziği. */
  muzik: boolean
}

export const VARSAYILAN_AYARLAR: OyunAyarlari = {
  zorluk: 'kolay',
  hiz: 'normal',
  paraEtiketleri: false,
  ipuclari: true,
  titresim: true,
  yaziBoyutu: 'normal',
  yuksekKontrast: false,
  sezonOyunu: false,
  sezonSuresiz: false,
  mudahale: true,
  afetSorusu: true,
  olayBirKez: true,
  olayArasi: true,
  ses: true,
  muzik: true,
  hareketiAzalt: typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
}

/** Bir tur (10 yıl) kaç ms sürer: şehri izlemeye, köylüleri görmeye vakit kalsın. */
export const HIZ_MS: Record<OyunHizi, number> = { yavas: 1500, normal: 950, hizli: 450 }

export type Ilerleme = {
  toplamYildiz: number
  oynananOyun: number
  enIyiYil: number
  ogreticiBitti: boolean
  sonOyun: { yil: number; ayakta: boolean; yildiz: number } | null
  /** Eser albümünde açılmış kartlar (eser kimlikleri). */
  album: string[]
  /** Kartı okunup ürünü açılan eserler. */
  okunan: string[]
  /** Sorulmuş bilgi soruları ve doğru cevap sayısı. */
  sorulan: string[]
  dogruCevap: number
  /** Felaket anında sorulan sorular (sırayla) ve doğru cevap sayısı: rütbeyi belirler. */
  afetSorulan: string[]
  afetDogru: number
  /** Geçilen leveller: level no → en iyi yıldız. */
  leveller: Record<string, number>
}

export const BOS_ILERLEME: Ilerleme = { toplamYildiz: 0, oynananOyun: 0, enIyiYil: 0, ogreticiBitti: false, sonOyun: null, album: [], okunan: [], sorulan: [], dogruCevap: 0, afetSorulan: [], afetDogru: 0, leveller: {} }

/** Her seviye için gereken yıldız: 3, 6, 9 ... */
export function seviye(toplamYildiz: number): { seviye: number; buSeviyede: number; gereken: number } {
  const s = Math.floor(toplamYildiz / 3) + 1
  return { seviye: s, buSeviyede: toplamYildiz % 3, gereken: 3 }
}

function oku<T>(anahtar: string, varsayilan: T): T {
  // Gömülüyken ev sahibi uygulamanın kaydını kullan (mobilde "vakfiye:oyun:" önekiyle saklanır).
  if (ortam.araclar.oku) return { ...varsayilan, ...ortam.araclar.oku<Partial<T>>(anahtar, {}) }
  try {
    const ham = localStorage.getItem(anahtar)
    return ham ? { ...varsayilan, ...JSON.parse(ham) } : varsayilan
  } catch {
    return varsayilan
  }
}

function yaz(anahtar: string, deger: unknown) {
  if (ortam.araclar.kaydet) return ortam.araclar.kaydet(anahtar, deger)
  try {
    localStorage.setItem(anahtar, JSON.stringify(deger))
  } catch {
    /* gizli sekme ya da kapalı depolama: ayar yalnızca bu oturumda geçerli */
  }
}

export const ayarlariOku = () => oku('vakfiye.ayarlar', VARSAYILAN_AYARLAR)
export const ayarlariYaz = (a: OyunAyarlari) => yaz('vakfiye.ayarlar', a)
export const ilerlemeyiOku = () => oku('vakfiye.ilerleme', BOS_ILERLEME)
export const ilerlemeyiYaz = (i: Ilerleme) => yaz('vakfiye.ilerleme', i)

/** Yazı boyutu, kontrast ve hareket ayarlarını sayfaya uygular (CSS bunları okur). */
export function sayfayaUygula(a: OyunAyarlari) {
  const k = ortam.kok ?? document.documentElement
  k.dataset.yazi = a.yaziBoyutu
  k.dataset.kontrast = a.yuksekKontrast ? 'yuksek' : 'normal'
  k.dataset.hareket = a.hareketiAzalt ? 'az' : 'normal'
}

export function titret(a: OyunAyarlari, desen: number | number[]) {
  if (a.titresim && 'vibrate' in navigator) {
    try {
      navigator.vibrate(desen)
    } catch {
      /* desteklenmiyor */
    }
  }
}
