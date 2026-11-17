import { describe, expect, it } from 'vitest'
import { ARSA_ALANI, BINA_ALANI, HAYRAT_ALANI, type Nokta } from '../harita'
import { npcAdim, npcKur, rastgeleKur, SERIT_GENISLIGI, type NpcKosullari } from './npc'
import { cizgideNokta, YOL_AGI } from './yolAgi'
import { GORUNUMLER } from './gorunum'

function icinde(p: Nokta, c: Nokta[]): boolean {
  let ic = false
  for (let i = 0, j = c.length - 1; i < c.length; j = i++) {
    const [xi, yi] = c[i]
    const [xj, yj] = c[j]
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) ic = !ic
  }
  return ic
}
function kenaraUzaklik(p: Nokta): number {
  let en = Infinity
  for (const d of YOL_AGI.values())
    for (const y of d.komsu)
      for (let s = 0; s <= y.uzunluk; s += 2) {
        const q = cizgideNokta(y.cizgi, s).n
        en = Math.min(en, Math.hypot(q[0] - p[0], q[1] - p[1]))
      }
  return en
}

// scripts/yol_agi.py'deki YASAK_DUZELTME ile aynı: dikdörtgen alanların resimdeki gerçek tabanları
const BINALAR: Record<string, Nokta[]> = {
  ...Object.fromEntries(Object.entries(HAYRAT_ALANI).map(([k, v]) => [`hayrat.${k}`, v])),
  'hayrat.medrese': [[1088, 545], [1345, 545], [1345, 705], [1088, 705]],
  'bina.hamam': [[877, 427], [940, 392], [1000, 368], [1092, 368], [1092, 522], [877, 522]],
  'bina.han': BINA_ALANI.han,
  'arsa.c1': ARSA_ALANI.c1,
  'arsa.c3': [[805, 215], [900, 215], [900, 366], [805, 366]],
}

describe('yol ağı', () => {
  it('bağlı: her düğümden her düğüme gidilebilir', () => {
    const ilk = YOL_AGI.keys().next().value!
    const gorulen = new Set([ilk])
    const sira = [ilk]
    while (sira.length) for (const y of YOL_AGI.get(sira.pop()!)!.komsu) if (!gorulen.has(y.hedef)) (gorulen.add(y.hedef), sira.push(y.hedef))
    expect(gorulen.size).toBe(YOL_AGI.size)
  })
  it('köprü, girişler ve duraklar var', () => {
    const d = [...YOL_AGI.values()]
    expect(d.filter((x) => x.kopru).length).toBeGreaterThanOrEqual(2)
    expect(d.filter((x) => x.giris).length).toBeGreaterThanOrEqual(4)
    expect(new Set(d.map((x) => x.durak).filter(Boolean))).toEqual(new Set(['asevi', 'cesme', 'cami', 'hamam', 'pazar', 'han', 'mahalle']))
  })
  it('hiçbir kenar büyük binaların içinden geçmez', () => {
    for (const d of YOL_AGI.values())
      for (const y of d.komsu)
        for (let s = 0; s <= y.uzunluk; s += 3) {
          const p = cizgideNokta(y.cizgi, s).n
          for (const [ad, c] of Object.entries(BINALAR)) expect(icinde(p, c), `${d.ad}→${y.hedef} ${ad} içinden geçiyor (${p.map(Math.round)})`).toBe(false)
        }
  })
})

describe('köylüler', () => {
  it('yalnız yol ağında yürür, takılmaz, durur, köprüden geçer, kaybolup belirir', () => {
    const r = rastgeleKur(3)
    const npc = npcKur(12, 42)
    let durdu = 0
    let kopru = 0
    let gizlendi = 0
    for (let i = 0; i < 6000; i++) {
      npcAdim(npc, 0.05, r)
      for (const n of npc) {
        expect(Number.isFinite(n.x) && Number.isFinite(n.y)).toBe(true)
        if (n.state === 'bekle') durdu++
        if (n.state === 'gizli') gizlendi++
        if (YOL_AGI.get(n.from)!.kopru && YOL_AGI.get(n.to)!.kopru && n.state === 'yuru') kopru++
      }
      if (i % 500 === 0) for (const n of npc) if (n.gorunurluk > 0.5) expect(kenaraUzaklik([n.x, n.y])).toBeLessThanOrEqual(SERIT_GENISLIGI + 1.5)
    }
    expect(durdu).toBeGreaterThan(0)
    expect(kopru).toBeGreaterThan(0)
    expect(gizlendi).toBeGreaterThan(0)
  })
  it('kapalı durakta durmaz (kapalı aşevi, kuru çeşme)', () => {
    const kapali: NpcKosullari = { durakAcik: (d) => d !== 'asevi' && d !== 'cesme' }
    const r = rastgeleKur(9)
    const npc = npcKur(14, 1)
    for (let i = 0; i < 6000; i++) {
      npcAdim(npc, 0.05, r, kapali)
      for (const n of npc) if (n.state === 'bekle') expect(['asevi', 'cesme']).not.toContain(YOL_AGI.get(n.to)!.durak)
    }
  })
  it('her türün görünümü var', () => {
    for (const g of Object.values(GORUNUMLER)) expect(g.length).toBeGreaterThan(0)
  })
})
