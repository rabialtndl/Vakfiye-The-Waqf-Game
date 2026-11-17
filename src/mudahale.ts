// Afet müdahalesi: felaket anında oyuncu kısa bir rol üstlenir (yaklaşık 20 sn), haritanın üstünde.
//  - Yangın: tulumbacı (1720 öncesinde kova zinciri kuran esnaf ve mahalleli). Alevlere dokun, su biterse kuyudan doldur.
//  - Deprem: yardım ekibi. Enkaz yığınlarına üç kez dokunup kaldır; altındaki insanlara ulaş, sağlam taşları onarım için ayır.
//  - Salgın: darüşşifa hekimi. Ateşi yükselen hastayı boş yatağa yatır; yatakta iyileşir.
// Sonuç 0–1 arası bir orandır. Yangın ve depremde hasarı en çok %50 azaltır (motor: mudahaleEt), salgında
// salgının fazladan giderinin o oranını yedek fona geri koyar (motor: salginHafiflet). Zar ve olaylar değişmez.

export type MudahaleTuru = 'yangin' | 'deprem' | 'salgin'

/** Hedef haritadaki bir alanın içinde (alan sırası + 0–1 arası konum). */
export type Hedef = {
  id: number
  alan: number
  u: number
  v: number
  dogduSn: number
  /** yangın: alev büyüklüğü 1–3 · deprem: kalan dokunuş · salgın: ateş 0–1 */
  deger: number
  /** yangın: en büyük hâle geldiği an · salgın: yatağa yattığı an */
  anSn: number | null
  /** deprem: enkazın altında insan mı var, taş mı · salgın: yattığı yatak */
  kisi?: boolean
  yatak?: number | null
}

export type Mudahale = {
  tur: MudahaleTuru
  t: number
  sure: number
  rng: number
  alanSayisi: number
  hedefler: Hedef[]
  no: number
  sonrakiSn: number
  su: number
  yataklar: (number | null)[]
  kurtarilan: number
  kisiKurtarilan: number
  kaybedilen: number
  bitti: boolean
}

export const MUDAHALE_SURESI = 20
export const SU_EN_COK = 6
export const YATAK_SAYISI = 3
const YANGIN_BUYUME = 2.2
const YANGIN_YAYILMA = 2.5
const ENKAZ_OMUR = 7
const ATES_ARTIS = 0.09
const IYILESME = 3

function rastgele(m: Mudahale): number {
  let t = (m.rng = (m.rng + 0x6d2b79f5) >>> 0)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

export function mudahaleKur(tur: MudahaleTuru, alanSayisi: number, tohum: number, ekSure = 0): Mudahale {
  return {
    tur, t: 0, sure: MUDAHALE_SURESI + ekSure, rng: tohum >>> 0, alanSayisi: Math.max(1, alanSayisi), hedefler: [], no: 0, sonrakiSn: 0.4,
    su: SU_EN_COK, yataklar: Array(YATAK_SAYISI).fill(null), kurtarilan: 0, kisiKurtarilan: 0, kaybedilen: 0, bitti: false,
  }
}

const kopya = (m: Mudahale): Mudahale => ({ ...m, hedefler: m.hedefler.map((h) => ({ ...h })), yataklar: [...m.yataklar] })

const EN_COK = { yangin: 6, deprem: 5, salgin: 5 }
const ARALIK = { yangin: 1.5, deprem: 1.9, salgin: 1.8 }

export function mudahaleAdim(onceki: Mudahale, dt: number): Mudahale {
  if (onceki.bitti) return onceki
  const m = kopya(onceki)
  m.t += dt

  // yeni hedef
  const bekleyen = m.hedefler.filter((h) => h.yatak == null).length
  if (m.t >= m.sonrakiSn && bekleyen < EN_COK[m.tur] && m.t < m.sure - 1.5) {
    const h: Hedef = { id: ++m.no, alan: Math.floor(rastgele(m) * m.alanSayisi), u: 0.15 + rastgele(m) * 0.7, v: 0.2 + rastgele(m) * 0.6, dogduSn: m.t, deger: 0, anSn: null }
    if (m.tur === 'yangin') h.deger = 1
    if (m.tur === 'deprem') { h.deger = 3; h.kisi = rastgele(m) < 0.5 }
    if (m.tur === 'salgin') { h.deger = 0.25 + rastgele(m) * 0.15; h.yatak = null }
    m.hedefler.push(h)
    m.sonrakiSn = m.t + ARALIK[m.tur] * (0.7 + rastgele(m) * 0.6)
  }

  // hedefler zamanla kötüleşir
  m.hedefler = m.hedefler.filter((h) => {
    if (m.tur === 'yangin') {
      const yeniDeger = Math.min(3, Math.max(h.deger, 1 + Math.floor((m.t - h.dogduSn) / YANGIN_BUYUME)))
      if (yeniDeger > h.deger) h.deger = yeniDeger
      if (h.deger >= 3 && h.anSn === null) h.anSn = m.t
      if (h.anSn !== null && m.t - h.anSn > YANGIN_YAYILMA) { m.kaybedilen++; return false }
    } else if (m.tur === 'deprem') {
      if (m.t - h.dogduSn > ENKAZ_OMUR) { m.kaybedilen++; return false }
    } else if (h.yatak == null) {
      h.deger += ATES_ARTIS * dt
      if (h.deger >= 1) { m.kaybedilen++; return false }
    } else if (h.anSn !== null && m.t - h.anSn >= IYILESME) {
      m.yataklar[h.yatak] = null
      m.kurtarilan++
      return false
    }
    return true
  })

  if (m.t >= m.sure) m.bitti = true
  return m
}

/** Bir hedefe dokunmak: alevi küçült, enkazı kaldır, hastayı yatağa yatır. */
export function dokun(onceki: Mudahale, id: number): Mudahale {
  const h0 = onceki.hedefler.find((h) => h.id === id)
  if (onceki.bitti || !h0) return onceki
  const m = kopya(onceki)
  const h = m.hedefler.find((x) => x.id === id)!
  if (m.tur === 'yangin') {
    if (m.su <= 0) return onceki
    m.su--
    h.deger--
    h.anSn = null
    h.dogduSn = m.t - (h.deger - 1) * YANGIN_BUYUME // küçülen alev yeniden büyümeye baştan başlar
    if (h.deger <= 0) { m.hedefler = m.hedefler.filter((x) => x.id !== id); m.kurtarilan++ }
  } else if (m.tur === 'deprem') {
    h.deger--
    if (h.deger <= 0) {
      m.hedefler = m.hedefler.filter((x) => x.id !== id)
      m.kurtarilan++
      if (h.kisi) m.kisiKurtarilan++
    }
  } else {
    if (h.yatak != null) return onceki
    const bos = m.yataklar.indexOf(null)
    if (bos < 0) return onceki
    m.yataklar[bos] = h.id
    h.yatak = bos
    h.anSn = m.t
  }
  return m
}

/** Yangında kuyudan su doldurmak. */
export function suDoldur(onceki: Mudahale): Mudahale {
  if (onceki.bitti || onceki.tur !== 'yangin' || onceki.su >= SU_EN_COK) return onceki
  return { ...kopya(onceki), su: SU_EN_COK }
}

export function mudahaleBitir(m: Mudahale): Mudahale {
  return m.bitti ? m : { ...m, bitti: true }
}

/** Başarı oranı: kurtarılan / (kurtarılan + kaybedilen). Süre bitince elde kalanlar sayılmaz. */
export function mudahaleOrani(m: Mudahale): number {
  const toplam = m.kurtarilan + m.kaybedilen
  return toplam > 0 ? m.kurtarilan / toplam : 0
}
