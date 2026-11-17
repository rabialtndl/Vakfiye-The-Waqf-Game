import { describe, expect, it } from 'vitest'
import { paraYoluRakamlari } from './paraYolu'
import { SABITLER as S, type AmacId } from './motor/sabitler'

describe('paraYoluRakamlari', () => {
  it('aşevi için önizlemedeki rakamları motordan verir', () => {
    const r = paraYoluRakamlari('asevi')
    expect(r.gelir).toBeCloseTo(54.6, 6)
    expect(r.fon).toBeCloseTo(10.92, 6)
    expect(r.bakim).toBeCloseTo(9.4, 6)
    expect(r.kalan).toBeCloseTo(34.58, 6)
    expect(r.artan).toBeCloseTo(8.58, 6)
  })

  it('her hizmette para korunur: gelir = fon + bakım + hizmet + artan − nakit katkısı', () => {
    for (const amac of Object.keys(S.AMACLAR) as AmacId[]) {
      const r = paraYoluRakamlari(amac)
      expect(r.gereken).toBe(S.AMACLAR[amac].gider)
      expect(r.hamam + r.han + r.arazi).toBeCloseTo(r.gelir, 6)
      expect(r.fon + r.bakim + r.gereken + r.artan - r.nakit).toBeCloseTo(r.gelir, 6)
    }
  })

  it('ucuz hizmet daha çok artan bırakır', () => {
    expect(paraYoluRakamlari('cesme').artan).toBeGreaterThan(paraYoluRakamlari('asevi').artan)
  })
})
