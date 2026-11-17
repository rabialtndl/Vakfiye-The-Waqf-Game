// Kasabada yürüyen köylüler (NPC): saf hareket mantığı, çizimden bağımsız ve test edilebilir.
// Her NPC yol ağının bir kenarında yürür; düğüme varınca ağırlıklı rastgele yeni bir kenar seçer,
// duraklarda (çeşme, aşevi, pazar...) kısa süre durur, girişlerde (köy yolu, kervan yolu, mahalle) kaybolup
// başka bir girişten yeniden belirir. Aynı kenarda öndekine yaklaşınca yavaşlar; karşıdan gelenle
// yolun iki yanına (şerit) ayrılır.
import type { Nokta } from '../harita'
import { cizgideNokta, YOL_AGI, type DurakTuru, type Dugum, type Yon } from './yolAgi'

export type NpcTuru =
  | 'su_tasiyici' | 'pazarci' | 'firinci' | 'hamal' | 'alim' | 'asci' | 'esnaf' | 'cocuk'
  | 'gezgin' | 'yasli' | 'ciftci' | 'tuccar' | 'cift' | 'esek'

/** Ekranda dört yön: ayak noktasından bakışa göre. */
export type Bakis = 'sag' | 'sol' | 'yukari' | 'asagi'

export type Npc = {
  id: number
  type: NpcTuru
  /** Şu an yürünen kenarın çizgisi (bir düğümden diğerine). */
  path: Nokta[]
  /** Çizgi üzerinde katedilen yol (piksel) ve toplam uzunluk. */
  pathProgress: number
  pathLength: number
  /** Kenarın çıkış ve varış düğümleri. */
  from: string
  to: string
  /** Yürüme hızı (harita pikseli / sn). */
  speed: number
  state: 'yuru' | 'bekle' | 'gizli'
  /** Bekleme ya da görünmez kalma süresi (sn). */
  kalan: number
  facing: Bakis
  /** Son yatay yön (1 sağ, -1 sol): tek kare resimler bu yöne çevrilir. */
  yatay: 1 | -1
  /** Çizim sırası: ayak noktasının y'si (büyük olan önde). */
  depth: number
  /** Ayak noktası (şerit kaydırması dahil). */
  x: number
  y: number
  /** Yolun ortasından yana kayma (piksel): yolu genişçe kullansınlar, karşılaşınca ayrılsınlar. */
  serit: number
  hedefSerit: number
  /** Yürüyüş adımı (animasyon fazı) ve görünürlük (belirme/kaybolma için 0..1). */
  adim: number
  gorunurluk: number
}

/** Oyun durumundan gelen kısıtlar: kapalı aşevinin önünde kuyruk olmasın, kuru çeşmede su alınmasın. */
export type NpcKosullari = { durakAcik: (d: DurakTuru) => boolean }
export const HER_SEY_ACIK: NpcKosullari = { durakAcik: () => true }

type TurBilgisi = { hiz: [number, number]; durakSevgisi: Partial<Record<DurakTuru, number>>; bekle: [number, number] }

/** Tür başına hız (px/sn), hangi duraklarda durmayı sevdiği ve ne kadar beklediği. */
export const TURLER: Record<NpcTuru, TurBilgisi> = {
  su_tasiyici: { hiz: [13, 16], durakSevgisi: { cesme: 5, mahalle: 2 }, bekle: [3, 6] },
  pazarci: { hiz: [13, 16], durakSevgisi: { pazar: 5, han: 1 }, bekle: [3, 7] },
  firinci: { hiz: [14, 17], durakSevgisi: { pazar: 2, asevi: 3 }, bekle: [2, 4] },
  hamal: { hiz: [10, 12], durakSevgisi: { han: 4, pazar: 3 }, bekle: [2, 5] },
  alim: { hiz: [10, 12], durakSevgisi: { cami: 5 }, bekle: [4, 8] },
  asci: { hiz: [13, 15], durakSevgisi: { asevi: 6 }, bekle: [3, 6] },
  esnaf: { hiz: [13, 16], durakSevgisi: { pazar: 4, han: 2 }, bekle: [3, 6] },
  cocuk: { hiz: [18, 24], durakSevgisi: { cesme: 2, mahalle: 2 }, bekle: [1, 3] },
  gezgin: { hiz: [12, 14], durakSevgisi: { han: 3, cesme: 2 }, bekle: [2, 4] },
  yasli: { hiz: [8, 10], durakSevgisi: { cami: 4, cesme: 2 }, bekle: [5, 9] },
  ciftci: { hiz: [12, 14], durakSevgisi: { pazar: 3, asevi: 1 }, bekle: [2, 5] },
  tuccar: { hiz: [12, 15], durakSevgisi: { han: 5, pazar: 3 }, bekle: [3, 7] },
  cift: { hiz: [11, 13], durakSevgisi: { cesme: 2, cami: 2, pazar: 2 }, bekle: [4, 8] },
  esek: { hiz: [8, 10], durakSevgisi: { han: 4, pazar: 3 }, bekle: [4, 7] },
}

/** Varsayılan kadro (12 kişi). Düşük güçte ilk N kullanılır; sıra ilk gelenlerin çeşitli olmasını sağlar. */
export const KADRO: NpcTuru[] = ['su_tasiyici', 'pazarci', 'hamal', 'alim', 'cocuk', 'esnaf', 'gezgin', 'asci', 'tuccar', 'yasli', 'cift', 'esek', 'ciftci', 'firinci', 'pazarci', 'cocuk']
export const VARSAYILAN_NPC = 12
/** Yol genişliği: NPC'ler ortadan bu kadar yana açılabilir (piksel). */
export const SERIT_GENISLIGI = 9
/** Öndekine bu kadar yaklaşınca yavaşlar (piksel). */
const ARA_MESAFE = 16

export type Rastgele = () => number
export function rastgeleKur(tohum: number): Rastgele {
  let a = tohum >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
const arada = (r: Rastgele, [a, b]: [number, number]) => a + (b - a) * r()

function bakisBul(yon: Nokta): Bakis {
  // Harita izometrik: yatay bileşen baskınsa sağ/sol, değilse yukarı/aşağı.
  if (Math.abs(yon[0]) >= Math.abs(yon[1]) * 0.8) return yon[0] >= 0 ? 'sag' : 'sol'
  return yon[1] >= 0 ? 'asagi' : 'yukari'
}

function kenaraKoy(n: Npc, from: Dugum, y: Yon) {
  n.path = y.cizgi
  n.pathLength = y.uzunluk
  n.pathProgress = 0
  n.from = from.ad
  n.to = y.hedef
}

/** Kavşakta yeni yön: geri dönmek az olası, sevdiği durağa giden kenar daha olası. */
export function yonSec(ag: Map<string, Dugum>, n: Npc, d: Dugum, r: Rastgele, k: NpcKosullari): Yon {
  const bilgi = TURLER[n.type]
  const agirlik = d.komsu.map((y) => {
    const hedef = ag.get(y.hedef)!
    let w = 1
    if (y.hedef === n.from && d.komsu.length > 1) w *= 0.12
    if (hedef.durak && k.durakAcik(hedef.durak)) w *= 1 + (bilgi.durakSevgisi[hedef.durak] ?? 0) * 0.5
    if (hedef.giris) w *= 0.6
    return w
  })
  let top = agirlik.reduce((a, b) => a + b, 0) * r()
  for (let i = 0; i < agirlik.length; i++) {
    top -= agirlik[i]
    if (top <= 0) return d.komsu[i]
  }
  return d.komsu[d.komsu.length - 1]
}

function girisler(ag: Map<string, Dugum>): Dugum[] {
  return [...ag.values()].filter((d) => d.giris && d.komsu.length)
}

/** Görünmez NPC'yi bir girişte yeniden belirt: o girişten ağın içine doğru yürümeye başlar. */
function belir(ag: Map<string, Dugum>, n: Npc, r: Rastgele) {
  const g = girisler(ag)
  const d = g[Math.floor(r() * g.length)]
  const y = d.komsu[Math.floor(r() * d.komsu.length)]
  kenaraKoy(n, d, y)
  n.state = 'yuru'
  n.gorunurluk = 0
}

export function npcKur(sayi: number, tohum: number, ag: Map<string, Dugum> = YOL_AGI): Npc[] {
  const r = rastgeleKur(tohum)
  const dugumler = [...ag.values()].filter((d) => d.komsu.length)
  const out: Npc[] = []
  for (let i = 0; i < sayi; i++) {
    const type = KADRO[i % KADRO.length]
    const bilgi = TURLER[type]
    // Başlangıç: ağın her yerine dağılmış, kenarların ortasında (kümelenmesin diye farklı düğümlerden).
    const d = dugumler[(i * 7 + Math.floor(r() * 3)) % dugumler.length]
    const y = d.komsu[Math.floor(r() * d.komsu.length)]
    const n: Npc = {
      id: i, type, path: y.cizgi, pathProgress: y.uzunluk * (0.15 + 0.7 * r()), pathLength: y.uzunluk, from: d.ad, to: y.hedef,
      speed: arada(r, bilgi.hiz), state: 'yuru', kalan: 0, facing: 'sag', yatay: 1, depth: 0, x: 0, y: 0,
      serit: 0, hedefSerit: (r() * 2 - 1) * SERIT_GENISLIGI, adim: r() * 10, gorunurluk: 1,
    }
    konumla(n)
    out.push(n)
  }
  return out
}

function konumla(n: Npc) {
  const { n: p, yon } = cizgideNokta(n.path, n.pathProgress)
  // şerit: yürüme yönüne dik kaydırma
  n.x = p[0] - yon[1] * n.serit
  n.y = p[1] + yon[0] * n.serit * 0.6
  n.depth = n.y
  if (n.state === 'yuru') {
    n.facing = bakisBul(yon)
    if (Math.abs(yon[0]) > 0.2) n.yatay = yon[0] > 0 ? 1 : -1
  }
}

/**
 * Bir zaman adımı. `dt` saniye (büyük atlamalar 0.1 sn ile sınırlanır; sekme ve ışınlanma olmasın).
 * Diziyi yerinde günceller ve döndürür.
 */
export function npcAdim(npcs: Npc[], dt: number, r: Rastgele, k: NpcKosullari = HER_SEY_ACIK, ag: Map<string, Dugum> = YOL_AGI): Npc[] {
  const t = Math.min(Math.max(dt, 0), 0.1)
  for (const n of npcs) {
    // belirme/kaybolma yumuşak olsun
    const hedefGorunurluk = n.state === 'gizli' ? 0 : 1
    n.gorunurluk += Math.sign(hedefGorunurluk - n.gorunurluk) * Math.min(Math.abs(hedefGorunurluk - n.gorunurluk), t * 2.5)

    if (n.state === 'gizli') {
      n.kalan -= t
      if (n.kalan <= 0) belir(ag, n, r)
      else continue
    }
    if (n.state === 'bekle') {
      n.kalan -= t
      n.adim += t * 0.8 // nefes alır gibi hafif kıpırtı
      if (n.kalan <= 0) {
        const d = ag.get(n.to)!
        kenaraKoy(n, d, yonSec(ag, n, d, r, k))
        n.state = 'yuru'
      }
      konumla(n)
      continue
    }

    // trafik: aynı kenarda aynı yöne giden öndekine yaklaşınca yavaşla; karşıdan gelen varsa şerit değiştir
    let hiz = n.speed
    for (const o of npcs) {
      if (o === n || o.state === 'gizli') continue
      if (o.from === n.from && o.to === n.to) {
        const ara = o.pathProgress - n.pathProgress
        if (ara > 0 && ara < ARA_MESAFE) hiz = Math.min(hiz, o.state === 'bekle' ? 0 : o.speed * 0.9, n.speed * (ara / ARA_MESAFE))
      } else if (o.from === n.to && o.to === n.from) {
        const karsi = n.pathLength - o.pathProgress - n.pathProgress
        if (Math.abs(karsi) < 40) n.hedefSerit = SERIT_GENISLIGI * (n.id < o.id ? 1 : -1)
      }
    }
    n.serit += Math.sign(n.hedefSerit - n.serit) * Math.min(Math.abs(n.hedefSerit - n.serit), t * 6)
    n.pathProgress += hiz * t
    n.adim += (hiz * t) / 4.5 // adım ritmi katedilen yola bağlı

    if (n.pathProgress >= n.pathLength) {
      n.pathProgress = n.pathLength
      const d = ag.get(n.to)!
      const bilgi = TURLER[n.type]
      const sevgi = d.durak && k.durakAcik(d.durak) ? bilgi.durakSevgisi[d.durak] ?? 0 : 0
      if (d.giris && r() < 0.3) {
        // girişten çıkıp gider; bir süre sonra başka bir girişten gelir
        n.state = 'gizli'
        n.kalan = 3 + r() * 6
      } else if (d.durak && k.durakAcik(d.durak) && r() < 0.25 + sevgi * 0.12) {
        n.state = 'bekle'
        n.kalan = arada(r, bilgi.bekle)
      } else {
        kenaraKoy(n, d, yonSec(ag, n, d, r, k))
        n.hedefSerit = (r() * 2 - 1) * SERIT_GENISLIGI
      }
    }
    konumla(n)
  }
  return npcs
}
