// Oyun haritası: minyatür üslubunda çizilmiş tek bir şehir resmi (public/harita.webp, 1536×1024).
// Resimdeki her yapının alanı burada tanımlıdır. Vakfa ait yapılar renkli görünür; henüz kurulmamış
// ya da başka vakfa ait olanlar soluk. Olaylar (yangın, deprem, kuraklık, savaş) alanların üstüne efektle çizilir.
import type { AmacId } from '../motor/sabitler'
import type { ArsaId, BolgeId } from '../motor/sehir'

export type Nokta = [number, number]
export type BinaId = 'hamam' | 'han' | 'arazi' | 'sandik' | 'hayrat'

export const HARITA = { w: 1536, h: 1024, dosya: 'harita.webp' }

const D = (x1: number, y1: number, x2: number, y2: number): Nokta[] => [[x1, y1], [x2, y1], [x2, y2], [x1, y2]]

/** Vakfın hizmet binası, seçilen amaca göre resimdeki yapılardan biridir. */
export const HAYRAT_ALANI: Record<AmacId, Nokta[]> = {
  asevi: D(472, 368, 742, 535),
  medrese: [[1088, 545], [1262, 545], [1262, 425], [1305, 425], [1305, 545], [1345, 545], [1345, 705], [1088, 705]],
  cami: [[478, 150], [705, 150], [705, 25], [742, 25], [742, 150], [805, 150], [805, 385], [478, 385]],
  cesme: D(800, 528, 912, 648),
}

export const BINA_ALANI: Record<Exclude<BinaId, 'hayrat'>, Nokta[]> = {
  hamam: D(873, 368, 1092, 522),
  han: D(1030, 125, 1425, 398),
  arazi: D(0, 78, 215, 338),
  sandik: D(893, 703, 1012, 812),
}

export const ARSA_ALANI: Record<ArsaId, Nokta[]> = {
  c1: [[990, 300], [1062, 300], [1335, 395], [1335, 470], [1478, 520], [1478, 540], [1368, 540], [990, 372]],
  // bedesten: hanın kapısının sağındaki uzun taş galeri (çarşının ortası)
  c2: [[1336, 345], [1536, 398], [1536, 470], [1336, 418]],
  c3: D(800, 215, 902, 385),
  // Mahallenin hizmet binası arsaları: vakfın kendi hizmeti dışındaki üç hayrat burada kurulur.
  a1: HAYRAT_ALANI.asevi,
  a2: HAYRAT_ALANI.cesme,
  a3: HAYRAT_ALANI.medrese,
  a4: HAYRAT_ALANI.cami,
  m1: D(448, 688, 702, 905),
  m2: D(592, 600, 705, 690),
  k1: [[58, 555], [240, 535], [500, 598], [500, 668], [330, 668], [130, 642], [58, 628]],
  k2: D(138, 350, 302, 494),
  y1: D(1245, 0, 1536, 135),
}

/** Haritada dokunulabilen, vakfa ait olmayan yerler: dokununca gerçek örnekleri açılır. */
export const YER_ALANI = {
  kopru: [[55, 560], [250, 548], [350, 570], [480, 630], [480, 680], [420, 668], [330, 612], [240, 590], [55, 604]] as Nokta[],
  degirmen: D(135, 350, 290, 465),
}

/** Bölge kilitliyken arsaların yanında soluk kalan çevre (tarlalar, yollar). */
export const BOLGE_CEVRESI: Record<BolgeId, Nokta[][]> = {
  carsi: [],
  mahalle: [D(320, 860, 1000, 1024), D(1140, 780, 1536, 1024)],
  koyler: [D(0, 478, 175, 1024)],
  yol: [],
}

/** Kilitli bölgenin tabelasının yeri. */
export const BOLGE_TABELASI: Record<BolgeId, Nokta> = {
  carsi: [1250, 470],
  mahalle: [760, 800],
  koyler: [200, 880],
  yol: [1060, 60],
}

export const kutuOf = (p: Nokta[]) => {
  const xs = p.map((q) => q[0])
  const ys = p.map((q) => q[1])
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
}

/** Alanın tepe ortası: uçan sikke ve etiketler buradan çıkar. */
export function tepe(p: Nokta[]): Nokta {
  const k = kutuOf(p)
  return [k.x + k.w / 2, k.y + k.h * 0.18]
}

export function orta(p: Nokta[]): Nokta {
  const k = kutuOf(p)
  return [k.x + k.w / 2, k.y + k.h / 2]
}

export const noktalar = (p: Nokta[]) => p.map((q) => `${q[0]},${q[1]}`).join(' ')

// ---------- Sezon mini oyunu ----------

/** Yardım keselerinin belirdiği yol ve meydan noktaları (sezon.ts > KESE_YER_SAYISI kadar). */
export const KESE_YERLERI: Nokta[] = [
  [780, 470], [1010, 590], [640, 650], [470, 640], [1180, 500], [930, 340], [790, 750], [330, 560],
]

/** Arabanın sandıktan hayrata gittiği yol (sokaklar boyunca). İlk nokta sandığın kapısı, son nokta hayratın önü. */
export const ARABA_YOLU: Record<AmacId, Nokta[]> = {
  asevi: [[950, 772], [940, 662], [770, 642], [612, 560]],
  cami: [[950, 772], [940, 662], [862, 560], [862, 412], [720, 392]],
  medrese: [[950, 772], [1000, 690], [1062, 622]],
  cesme: [[950, 772], [932, 690], [858, 664]],
}

/** Yolun t (0–1) oranındaki noktası ve o andaki yönü (araba sağa mı sola mı bakıyor). */
export function yolNoktasi(yol: Nokta[], t: number): { n: Nokta; sola: boolean } {
  const parcalar = yol.slice(1).map((b, i) => Math.hypot(b[0] - yol[i][0], b[1] - yol[i][1]))
  const toplam = parcalar.reduce((a, b) => a + b, 0)
  let kalan = Math.min(Math.max(t, 0), 1) * toplam
  for (let i = 0; i < parcalar.length; i++) {
    const [a, b] = [yol[i], yol[i + 1]]
    if (kalan <= parcalar[i] || i === parcalar.length - 1) {
      const u = parcalar[i] ? Math.min(1, kalan / parcalar[i]) : 0
      return { n: [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], sola: b[0] < a[0] }
    }
    kalan -= parcalar[i]
  }
  return { n: yol[yol.length - 1], sola: false }
}
