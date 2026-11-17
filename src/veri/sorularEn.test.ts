import { afterEach, describe, expect, it } from 'vitest'
import sorular from './sorular.json'
import { SORU_SAYISI_EN, kaynakAdi, soruBilgisi } from './sorularEn'
import { AFET_CEVIRI_EKSIK, AFET_SORULARI } from './afetSorulari'
import { dilDegistir } from '../dil'
import { LEVELLER } from '../leveller'

describe('İngilizce', () => {
  afterEach(() => dilDegistir('tr'))

  it('her bilgi sorusunun çevirisi var', () => {
    expect(SORU_SAYISI_EN).toBe(sorular.length)
    dilDegistir('en')
    for (const s of sorular) expect(soruBilgisi(s)).not.toBe(s.bilgi)
    expect(kaynakAdi('Konya Vakıf Eserleri Envanteri, II. Cilt')).toBe('Konya Foundation Works Inventory, Vol. II')
  })

  it('her afet sorusunun çevirisi var, doğru şık aynı yerde', () => {
    expect(AFET_CEVIRI_EKSIK).toEqual([])
    const tr = AFET_SORULARI.map((q) => [q.soru, q.dogru])
    dilDegistir('en')
    AFET_SORULARI.forEach((q, i) => {
      expect(q.soru).not.toBe(tr[i][0])
      expect(q.dogru).toBe(tr[i][1])
      expect(q.secenekler).toHaveLength(2)
    })
  })

  it('leveller dile göre okunur', () => {
    expect(LEVELLER[0].ad).toBe('İlk aşevi')
    dilDegistir('en')
    expect(LEVELLER[0].ad).toBe('The first soup kitchen')
    expect(LEVELLER[0].tarih[0].baslik).toBe('Timur’s army in Bursa')
  })
})
