import { describe, expect, it } from 'vitest'
import { dokun, mudahaleAdim, mudahaleKur, mudahaleOrani, SU_EN_COK, suDoldur, type Mudahale } from './mudahale'
import { mudahaleEt, salginHafiflet, turOyna, varsayilanAyarlar, yeniOyun } from './motor/motor'

const ilerlet = (m: Mudahale, sn: number) => {
  for (let i = 0; i < sn * 10 && !m.bitti; i++) m = mudahaleAdim(m, 0.1)
  return m
}
function iyi(m: Mudahale): Mudahale {
  while (!m.bitti) {
    m = mudahaleAdim(m, 0.1)
    if (m.tur === 'yangin' && m.su === 0) m = suDoldur(m)
    for (const h of m.hedefler) if (h.yatak == null) m = dokun(m, h.id)
  }
  return m
}

describe('afet müdahalesi', () => {
  for (const tur of ['yangin', 'deprem', 'salgin'] as const) {
    it(`${tur}: hiçbir şey yapmayan kaybeder, iyi oynayan çoğunu kurtarır`, () => {
      expect(mudahaleOrani(ilerlet(mudahaleKur(tur, 2, 5), 25))).toBe(0)
      expect(mudahaleOrani(iyi(mudahaleKur(tur, 2, 5)))).toBeGreaterThan(0.7)
    })
  }

  it('yangın: her dokunuş bir kova su; su bitince çeşmeden dolar', () => {
    let m = ilerlet(mudahaleKur('yangin', 1, 1), 1)
    const id = m.hedefler[0].id
    m = dokun(m, id)
    expect(m.su).toBe(SU_EN_COK - 1)
    expect(m.kurtarilan).toBe(1)
    m = { ...m, su: 0 }
    expect(dokun(m, id)).toBe(m)
    expect(suDoldur(m).su).toBe(SU_EN_COK)
  })

  it('deprem: üç dokunuşta yığın kalkar', () => {
    let m = ilerlet(mudahaleKur('deprem', 1, 3), 0.6)
    const id = m.hedefler[0].id
    m = dokun(dokun(m, id), id)
    expect(m.kurtarilan).toBe(0)
    m = dokun(m, id)
    expect(m.kurtarilan).toBe(1)
  })

  it('salgın: hasta yatağa yatar, birkaç saniyede iyileşir, yatak boşalır', () => {
    let m = ilerlet(mudahaleKur('salgin', 1, 4), 0.6)
    m = dokun(m, m.hedefler[0].id)
    expect(m.yataklar.filter((y) => y !== null)).toHaveLength(1)
    m = ilerlet(m, 3.2)
    expect(m.kurtarilan).toBeGreaterThanOrEqual(1)
  })

  it('motor: müdahale hasarı ve onarım bedelini en çok yarıya indirir, bir kez', () => {
    const d = turOyna(yeniOyun({ ...varsayilanAyarlar(), zorlaOlaylar: { 10: 'deprem' } }))
    const k = d.bekleyenKarar!
    const tam = mudahaleEt(d, 1, 'test')
    expect(tam.bekleyenKarar!.hasarHamam).toBe(Math.round(k.hasarHamam * 0.5))
    expect(tam.bekleyenKarar!.bedel).toBeLessThan(k.bedel)
    expect(mudahaleEt(tam, 1, 'test')).toBe(tam)
  })

  it('motor: salgın yardımı fazladan giderin oranını fona koyar, tur başına bir kez', () => {
    const d = turOyna(yeniOyun({ ...varsayilanAyarlar(), zorlaOlaylar: { 10: 'salgin' } }))
    const y = salginHafiflet(d, 1, 'test')
    expect(y.fon).toBeCloseTo(d.fon + (d.sonTur!.gereken - d.sonTur!.gereken / 1.5))
    expect(salginHafiflet(y, 1, 'test')).toBe(y)
  })
})
