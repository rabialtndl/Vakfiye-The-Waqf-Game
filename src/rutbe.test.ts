import { describe, expect, it } from 'vitest'
import { canEnCok, rutbe, rutbeAtladi, RUTBELER } from './rutbe'
import { AFET_SORULARI, afetSorusuSec } from './veri/afetSorulari'

describe('rütbe', () => {
  it('doğru sayısına göre sıralanır', () => {
    expect(rutbe(0).simdiki.ad).toBe('Çırak')
    expect(rutbe(2).kalan).toBe(1)
    expect(rutbe(3).simdiki.ad).toBe('Kalfa')
    expect(rutbe(6).simdiki.ad).toBe('Usta')
    expect(rutbe(50).simdiki.ad).toBe('Ahi')
    expect(rutbe(50).sonraki).toBeNull()
  })
  it('atlama yalnız eşikte bildirilir', () => {
    expect(rutbeAtladi(2, 3)?.ad).toBe('Kalfa')
    expect(rutbeAtladi(3, 4)).toBeNull()
    expect(RUTBELER.map((r) => r.gereken)).toEqual([...RUTBELER.map((r) => r.gereken)].sort((a, b) => a - b))
  })
  it('kalfa bir fazla canla başlar', () => {
    expect(canEnCok(0)).toBe(3)
    expect(canEnCok(3)).toBe(4)
  })
})

describe('afet soruları', () => {
  it('her afet için en az dört soru, kimlikler eşsiz, kaynaklı', () => {
    for (const t of ['yangin', 'deprem', 'salgin'] as const) expect(AFET_SORULARI.filter((q) => q.tur === t).length).toBeGreaterThanOrEqual(4)
    expect(new Set(AFET_SORULARI.map((q) => q.id)).size).toBe(AFET_SORULARI.length)
    for (const q of AFET_SORULARI) {
      expect(q.secenekler[0]).not.toBe(q.secenekler[1])
      expect(q.kaynak.eser).toMatch(/^[a-z0-9-]+$/)
    }
  })
  it('sorulan soru bir daha gelmez; bitince soru yok', () => {
    const yangin = AFET_SORULARI.filter((q) => q.tur === 'yangin').map((q) => q.id)
    const ilk = afetSorusuSec('yangin', [], 0)!
    expect(afetSorusuSec('yangin', [ilk.id], 0)!.id).not.toBe(ilk.id)
    expect(afetSorusuSec('yangin', yangin, 7)).toBeNull()
    // yeni oyunda önce önceki oyunlarda hiç sorulmamışlar gelir; hepsi sorulduysa en eskisi
    const bir = yangin.slice(0, -1)
    expect(afetSorusuSec('yangin', [], 3, bir)!.id).toBe(yangin[yangin.length - 1])
    expect(afetSorusuSec('yangin', [], 3, yangin)!.id).toBe(yangin[0])
  })
})
