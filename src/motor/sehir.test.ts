// Şehir genişlemesi: docs/vakif-oyunu-kurallari-v2.md, bölüm 13.
import { describe, expect, it } from 'vitest'
import { bagisEkle, botlaOyna, canBitti, insaEt, turOyna, varsayilanAyarlar, yeniOyun, type Durum } from './motor'
import { bolgeAcik, insaKontrol, sehirTuru } from './sehir'

const ileri = (d: Durum, tur: number) => {
  for (let i = 0; i < tur && !d.bitti && !d.bekleyenKarar; i++) d = turOyna(d)
  return d
}

describe('şehir genişlemesi', () => {
  it('bölgeler yılla ya da pulla açılır', () => {
    expect(bolgeAcik('carsi', 40, 0)).toBe(false)
    expect(bolgeAcik('carsi', 50, 0)).toBe(true)
    expect(bolgeAcik('carsi', 0, 1)).toBe(true)
    expect(bolgeAcik('yol', 300, 3)).toBe(false)
    expect(bolgeAcik('yol', 0, 4)).toBe(true)
  })

  it('artan para inşa kasasında birikir, kasa yetmezse kurulmaz', () => {
    let d = yeniOyun({ ...varsayilanAyarlar(), zorlaOlaylar: {} })
    expect(d.artan).toBe(0)
    d = ileri(d, 1)
    expect(d.artan).toBeGreaterThan(0)
    expect(insaKontrol(d, 'c1', 'arasta', 0).neden).toMatch(/50\. yılda/)
    expect(insaKontrol(d, 'c1', 'arasta', 1).neden).toMatch(/akçe gerekir/)
    d = ileri(d, 4)
    expect(insaKontrol(d, 'c1', 'arasta', 0).olur).toBe(true)
    const once = d.artan
    d = insaEt(d, 'c1', 'arasta')
    expect(d.yapilar.c1).toBe('arasta')
    expect(d.artan).toBeCloseTo(once - 25)
  })

  it('kural dışı inşa durumu değiştirmez', () => {
    const d = { ...yeniOyun({ ...varsayilanAyarlar(), kesifBagisi: 100 }), yil: 400 }
    expect(insaEt(d, 'c1', 'evler')).toBe(d) // izinli değil
    expect(insaEt(d, 'k2', 'degirmen')).toBe(d) // köprü yok
    const k = insaEt(d, 'k1', 'kopru')
    expect(insaEt(k, 'k2', 'degirmen').yapilar.k2).toBe('degirmen')
    const m = insaEt(k, 'm2', 'mektep')
    expect(insaEt(m, 'm2', 'evler')).toBe(m) // arsa dolu
  })

  it('yapılar olaylara göre gelir getirir', () => {
    const y = { c1: 'arasta', m1: 'evler', m2: 'mektep', y1: 'kervan', k1: 'kopru', k2: 'degirmen', c3: 'kumbet' } as const
    const normal = sehirTuru(y, null, 20, 9)
    expect(normal.ayrinti.c1).toBe(8) // arasta 6 + kervan yolu 2
    expect(normal.ayrinti.m1).toBe(6) // evler 4 × mektep 1,5
    expect(normal.ek).toBeCloseTo(8 + 6 + 5 + 3 + 20 * 0.25 + 9 * 0.2)
    expect(sehirTuru(y, 'yangin', 20, 9).ayrinti.c1).toBe(0)
    expect(sehirTuru(y, 'kuraklik', 20, 9).ayrinti.k2).toBe(0)
    expect(normal.bakim).toBeCloseTo(0.6 + 0.4 + 1.5 + 2 + 0.5 + 0.6 + 0.5)
  })

  it('sezon bonusu geliri artırır, zarlar aynı kalır, sınırı aşamaz', () => {
    const d = yeniOyun(varsayilanAyarlar())
    const a = turOyna(d)
    const b = turOyna(d, 0.1)
    const c = turOyna(d, 5)
    expect(b.sonTur!.gelir).toBeCloseTo(a.sonTur!.gelir * 1.1)
    expect(c.sonTur!.sezonBonusu).toBe(0.2)
    expect(b.rng).toBe(a.rng)
    expect(b.sonTur!.olay).toBe(a.sonTur!.olay)
  })

  it('bağış kasaya girer ve günlüğe yazılır', () => {
    const d = bagisEkle(yeniOyun(varsayilanAyarlar()), 5, 'Doğru cevap: 5 akçe bağış')
    expect(d.artan).toBe(5)
    expect(d.gunluk.at(-1)!.mesaj).toMatch(/bağış/)
  })

  it('pasaport bağışı kasaya girer', () => {
    expect(yeniOyun({ ...varsayilanAyarlar(), kesifBagisi: 15 }).artan).toBe(15)
  })

  it('inşa etmeyen oyuncunun oyunu aynı kalır', () => {
    const a = botlaOyna(varsayilanAyarlar())
    expect(a.sonuc).toBe('ayakta')
    expect(a.olaySayisi).toBe(24)
    expect(a.kararSayisi).toBe(9)
  })

  it('akıllıca inşa eden oyuncu daha sık ayakta kalır (300 tohum)', () => {
    let duz = 0
    let insa = 0
    for (let t = 1; t <= 300; t++) {
      const a = { ...varsayilanAyarlar(), tohum: t }
      if (botlaOyna(a).sonuc === 'ayakta') duz++
      if (botlaOyna(a, 'onaran', true).sonuc === 'ayakta') insa++
    }
    console.log({ duz, insa })
    expect(insa).toBeGreaterThan(duz)
    expect(insa).toBeLessThan(300) // hâlâ kaybedilebilir
  })
})

describe('mahallenin hizmet binaları', () => {
  it('mahalle baştan açık; vakfın kendi hizmetinden ikincisi kurulmaz', () => {
    expect(bolgeAcik('mahalle', 0, 0)).toBe(true)
    const d = bagisEkle(yeniOyun({ ...varsayilanAyarlar(), amac: 'asevi', zorlaOlaylar: {} }), 100, 'test')
    expect(insaKontrol(d, 'a1', 'asevi', 0).neden).toMatch(/zaten aşevi/)
    expect(insaKontrol(d, 'a2', 'cesme', 0).olur).toBe(true)
  })

  it('çeşme kuraklıkta bağış getirmez, cami her tur getirir', () => {
    expect(sehirTuru({ a2: 'cesme' }, 'kuraklik', 0, 0).ek).toBe(0)
    expect(sehirTuru({ a2: 'cesme' }, null, 0, 0).ek).toBe(2)
    expect(sehirTuru({ a4: 'cami' }, 'kuraklik', 0, 0).ek).toBe(3)
  })
})

describe('canlar', () => {
  it('canlar bitince vakıf çöker ve oyun biter', () => {
    const d = canBitti(yeniOyun({ ...varsayilanAyarlar(), zorlaOlaylar: {} }))
    expect(d.bitti).toBe(true)
    expect(d.sonuc).toBe('coktu')
    expect(canBitti(d)).toBe(d)
  })
})
