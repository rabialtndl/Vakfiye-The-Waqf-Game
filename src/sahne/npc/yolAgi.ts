// Yürünebilir yol ağı: düğümler (kavşak, durak, giriş) ve aralarındaki kenarlar (kaldırım üstünde çizgi).
// Koordinatlar harita pikseli (public/harita.webp, 1536×1024). Ağ scripts/yol_agi.py ile haritadan üretilir:
// düğüm eklemek/taşımak için o betikteki DUGUMLER/KENARLAR listesini düzenleyip betiği çalıştırın.
import veri from './yolAgi.json'
import type { Nokta } from '../harita'

/** Durak türleri: NPC'ler bu düğümlerde kısa süre durur (oyun durumuna göre kapatılabilir). */
export type DurakTuru = 'asevi' | 'cesme' | 'cami' | 'hamam' | 'pazar' | 'han' | 'mahalle'

export type Dugum = { ad: string; n: Nokta; giris: boolean; kopru: boolean; durak: DurakTuru | null; komsu: Yon[] }
/** Bir düğümden çıkan yön: hangi düğüme, hangi çizgi üzerinden (düğümden başlayıp ona giden), uzunluğu. */
export type Yon = { hedef: string; cizgi: Nokta[]; uzunluk: number }

type HamVeri = { dugumler: Record<string, { x: number; y: number; etiket: string[] }>; kenarlar: { a: string; b: string; noktalar: number[][] }[] }

export function uzunluk(c: Nokta[]): number {
  let u = 0
  for (let i = 1; i < c.length; i++) u += Math.hypot(c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1])
  return u
}

export function agKur(v: HamVeri): Map<string, Dugum> {
  const ag = new Map<string, Dugum>()
  for (const [ad, d] of Object.entries(v.dugumler)) {
    const dur = d.etiket.find((e) => e.startsWith('dur:'))
    ag.set(ad, { ad, n: [d.x, d.y], giris: d.etiket.includes('giris'), kopru: d.etiket.includes('kopru'), durak: dur ? (dur.slice(4) as DurakTuru) : null, komsu: [] })
  }
  for (const k of v.kenarlar) {
    const a = ag.get(k.a)
    const b = ag.get(k.b)
    if (!a || !b) continue
    const c = k.noktalar.map((p) => [p[0], p[1]] as Nokta)
    // uçlar düğümün kendisi olsun (betik zaten öyle üretir; elle düzenlemeye karşı güvence)
    c[0] = a.n
    c[c.length - 1] = b.n
    const u = uzunluk(c)
    a.komsu.push({ hedef: b.ad, cizgi: c, uzunluk: u })
    b.komsu.push({ hedef: a.ad, cizgi: [...c].reverse(), uzunluk: u })
  }
  return ag
}

export const YOL_AGI = agKur(veri as HamVeri)

/** Çizgi üzerinde baştan `s` piksel ötedeki nokta ve o andaki yön (birim vektör). */
export function cizgideNokta(c: Nokta[], s: number): { n: Nokta; yon: Nokta } {
  let kalan = Math.max(0, s)
  for (let i = 1; i < c.length; i++) {
    const dx = c[i][0] - c[i - 1][0]
    const dy = c[i][1] - c[i - 1][1]
    const l = Math.hypot(dx, dy)
    if (l === 0) continue
    if (kalan <= l || i === c.length - 1) {
      const k = Math.min(1, kalan / l)
      return { n: [c[i - 1][0] + dx * k, c[i - 1][1] + dy * k], yon: [dx / l, dy / l] }
    }
    kalan -= l
  }
  return { n: c[c.length - 1], yon: [1, 0] }
}
