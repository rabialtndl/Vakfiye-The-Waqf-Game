import { ortam } from './ortam'

// Oyunun dili: Türkçe ya da İngilizce. Ana menüde ve Ayarlar'da seçilir, cihazda saklanır.
// Metinler yerinde iki dilde yazılır: L('Türkçe', 'English'). Varsayılan Türkçe (testler de Türkçe çalışır).

export type Dil = 'tr' | 'en'

const ANAHTAR = 'vakfiye.dil'

function ilkDil(): Dil {
  try {
    const kayitli = ortam.araclar.oku ? ortam.araclar.oku<{ dil?: Dil }>(ANAHTAR, {}).dil : (JSON.parse(localStorage.getItem(ANAHTAR) ?? '{}') as { dil?: Dil }).dil
    if (kayitli === 'tr' || kayitli === 'en') return kayitli
  } catch {
    /* depolama yok */
  }
  return 'tr'
}

let gecerli: Dil = typeof window === 'undefined' ? 'tr' : ilkDil()
const dinleyiciler = new Set<() => void>()

/** Geçerli dil. */
export const dil = (): Dil => gecerli
export const ingilizce = () => gecerli === 'en'

/** İki dilli metin: geçerli dile göre birini döndürür. */
export function L<T>(tr: T, en: T): T {
  return gecerli === 'en' ? en : tr
}

/** Dili değiştirir, saklar ve ekranı yeniden çizdirir. */
export function dilDegistir(d: Dil) {
  gecerli = d
  try {
    if (ortam.araclar.kaydet) ortam.araclar.kaydet(ANAHTAR, { dil: d })
    else localStorage.setItem(ANAHTAR, JSON.stringify({ dil: d }))
  } catch {
    /* yalnız bu oturum */
  }
  sayfaDili()
  dinleyiciler.forEach((f) => f())
}

/** Tek başına çalışırken sayfanın dilini ve başlığını ayarlar (gömülüyken ev sahibininkine dokunmaz). */
export function sayfaDili() {
  if (typeof document === 'undefined' || ortam.gomulu) return
  document.documentElement.lang = gecerli
  document.title = gecerli === 'en' ? 'Vakfiye · A Foundation Game' : 'Vakfiye · Vakıf Oyunu'
}

/** Gömülü girişte: ev sahibi dil verdiyse o, yoksa ev sahibinin kaydındaki son seçim. */
export function dilYenidenOku() {
  const ev = ortam.araclar.dil
  gecerli = ev === 'tr' || ev === 'en' ? ev : ilkDil()
}

export function dilDinle(f: () => void) {
  dinleyiciler.add(f)
  return () => {
    dinleyiciler.delete(f)
  }
}

/** Sayıyı dile göre yazar (ondalık: TR virgül, EN nokta). */
export function sayi(n: number, basamak = 0): string {
  return n.toLocaleString(gecerli === 'en' ? 'en-US' : 'tr-TR', { maximumFractionDigits: basamak, minimumFractionDigits: 0 })
}

/**
 * Veri nesnesine İngilizce karşılık bağlar: İngilizcedeyken `en`deki alan, yoksa Türkçesi okunur.
 * Nesne her okunuşta dile bakar; dil değişince ekran yeniden çizilir, veri kendiliğinden çevrilir.
 */
export function iki<T extends object>(tr: T, en: { [K in keyof T]?: unknown }): T {
  return new Proxy(tr, {
    get(hedef, k, alici) {
      if (gecerli === 'en' && typeof k === 'string' && k in en && (en as Record<string, unknown>)[k] !== undefined) return (en as Record<string, unknown>)[k]
      return Reflect.get(hedef, k, alici)
    },
  })
}
