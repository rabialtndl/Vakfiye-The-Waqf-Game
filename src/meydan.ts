// Meydan okuma: oyuncu sonucunu bir bağlantıyla paylaşır. Bağlantıyı açan arkadaş aynı leveli aynı
// olaylarla oynar (leveller sabit tohumludur), kilitli olsa bile; sonunda iki sonuç karşılaştırılır.

export type Meydan = {
  /** Level no (0: serbest oyun). */
  l: number
  /** Yıldız (0-3). */
  y: number
  /** Vakfın yaşadığı yıl. */
  yil: number
  /** Ayakta kaldı mı? */
  a: boolean
  /** Paylaşanın adı (isteğe bağlı). */
  ad?: string
}

const PARAM = 'meydan'

function b64url(s: string): string {
  const b = btoa(unescape(encodeURIComponent(s)))
  return b.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlCoz(s: string): string {
  const b = s.replace(/-/g, '+').replace(/_/g, '/')
  return decodeURIComponent(escape(atob(b + '='.repeat((4 - (b.length % 4)) % 4))))
}

export function meydanKodu(m: Meydan): string {
  return b64url(JSON.stringify({ l: m.l, y: m.y, yil: m.yil, a: m.a ? 1 : 0, ...(m.ad ? { ad: m.ad.slice(0, 24) } : {}) }))
}

export function meydanCoz(kod: string): Meydan | null {
  try {
    const o = JSON.parse(b64urlCoz(kod))
    if (typeof o !== 'object' || o === null) return null
    const l = Number(o.l)
    const y = Number(o.y)
    const yil = Number(o.yil)
    if (!Number.isInteger(l) || l < 0 || l > 20 || !(y >= 0 && y <= 3) || !(yil >= 0 && yil <= 1000)) return null
    const ad = typeof o.ad === 'string' ? o.ad.replace(/[<>]/g, '').slice(0, 24) : undefined
    return { l, y: Math.round(y), yil: Math.round(yil), a: !!o.a, ...(ad ? { ad } : {}) }
  } catch {
    return null
  }
}

/** Sayfa adresinden meydan okumayı okur (?meydan=...). */
export function meydanOku(search: string): Meydan | null {
  const kod = new URLSearchParams(search).get(PARAM)
  return kod ? meydanCoz(kod) : null
}

/** Bulunulan sayfanın adresine meydan okumayı ekler (gömülüyken ev sahibi sayfanın adresi). */
export function meydanBaglantisi(m: Meydan, adres: string): string {
  const u = new URL(adres)
  u.searchParams.set(PARAM, meydanKodu(m))
  u.hash = ''
  return u.toString()
}

/** Adres çubuğundan meydan parametresini siler (yenileyince tekrar açılmasın). */
export function meydanTemizle() {
  try {
    const u = new URL(window.location.href)
    if (!u.searchParams.has(PARAM)) return
    u.searchParams.delete(PARAM)
    window.history.replaceState(window.history.state, '', u.toString())
  } catch {
    /* önemli değil */
  }
}

export type Karsilastirma = 'kazandin' | 'berabere' | 'kaybettin'
export function karsilastir(m: Meydan, y: number, yil: number): Karsilastirma {
  if (y !== m.y) return y > m.y ? 'kazandin' : 'kaybettin'
  if (yil !== m.yil) return yil > m.yil ? 'kazandin' : 'kaybettin'
  return 'berabere'
}
