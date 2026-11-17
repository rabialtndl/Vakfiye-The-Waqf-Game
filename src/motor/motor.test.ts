// Kabul testleri: docs/vakif-oyunu-kurallari-v2.md, bölüm 9.
import { describe, expect, it } from 'vitest'
import { cek } from './rng'
import {
  botlaOyna,
  kararVer,
  kurulumGecerli,
  secenekler,
  sonucKarti,
  turOyna,
  varsayilanAyarlar,
  yeniOyun,
  type Ayarlar,
  type Durum,
} from './motor'

const yakin = (a: number, b: number) => expect(Math.abs(a - b)).toBeLessThanOrEqual(0.05)

function zorla(olaylar: Ayarlar['zorlaOlaylar']): Durum {
  return yeniOyun({ ...varsayilanAyarlar(), zorlaOlaylar: olaylar })
}

describe('mulberry32', () => {
  it('Python referansıyla aynı sayıları üretir', () => {
    let s = 10
    const beklenen = [0.5019920116756111, 0.9174868050031364, 0.6913183077704161, 0.8021026765927672]
    for (const b of beklenen) {
      let r: number
      ;[r, s] = cek(s)
      expect(r).toBeCloseTo(b, 12)
    }
  })
})

describe('Test A: ana senaryo', () => {
  it('beş tur rehberdeki tabloyu üretir', () => {
    let d = zorla({ 10: 'savas', 30: 'yangin', 40: 'deprem', 50: 'yangin' })

    d = turOyna(d) // 10: savaş
    yakin(d.sonTur!.gelir, 33.0)
    yakin(d.sonTur!.hizmeteKalan, 17.3)
    yakin(d.fon, 0)
    expect(d.artArdaBos).toBe(1)

    d = turOyna(d) // 20: olay yok
    yakin(d.sonTur!.gelir, 54.6)
    yakin(d.sonTur!.hizmeteKalan, 34.58)
    yakin(d.fon, 10.92)
    expect(d.artArdaBos).toBe(0)

    d = turOyna(d) // 30: yangın
    yakin(d.fon, 21.84)
    expect(d.bekleyenKarar).toMatchObject({ olay: 'yangin', hasarHamam: 0, hasarHan: 18 })
    yakin(d.bekleyenKarar!.bedel, 16.2)
    d = kararVer(d, 'fon')
    yakin(d.fon, 5.64)
    expect(d.mulk).toEqual({ hamam: 30, han: 30, arazi: 25 })

    d = turOyna(d) // 40: deprem
    yakin(d.fon, 16.56)
    yakin(d.bekleyenKarar!.bedel, 32.4)
    const s = secenekler(d)
    expect(s.find((x) => x.secim === 'fon')).toMatchObject({ acik: false, neden: 'Fon yetmiyor 17 / 32' })
    d = kararVer(d, 'nakit')
    yakin(d.nakit, 0)
    expect(d.mulk.hamam).toBe(17)
    expect(d.mulk.han).toBe(23)

    d = turOyna(d) // 50: yangın
    yakin(d.sonTur!.gelir, 39.16)
    yakin(d.sonTur!.hizmeteKalan, 25.02)
    yakin(d.fon, 23.41)
    yakin(d.bekleyenKarar!.bedel, 11.7)
    d = kararVer(d, 'fon')
    yakin(d.fon, 11.71)
    expect(d.kararSayisi).toBe(3)
  })
})

describe('Test B: Hizmeti kıs', () => {
  it('hasarın %85\'i dört turda geri gelir, iki tur hizmet yarım', () => {
    let d = zorla({ 10: 'deprem' })
    d = turOyna(d)
    d = kararVer(d, 'kis')
    expect(d.mulk.hamam).toBe(6)
    expect(d.mulk.han).toBe(18)
    yakin(d.fon, 10.92)

    const beklenen = [
      { gereken: 13, gelir: 32.2, fon: 17.36, hamam: 11, han: 20 },
      { gereken: 13, gelir: 37.64, fon: 24.89, hamam: 16, han: 22 },
      { gereken: 26, gelir: 43.08, fon: 33.5, hamam: 21, han: 24 },
      { gereken: 26, gelir: 49.96, fon: 43.5, hamam: 26, han: 28 },
      { gereken: 26, gelir: 49.96, fon: 53.49, hamam: 26, han: 28 },
    ]
    for (const b of beklenen) {
      d = turOyna(d)
      yakin(d.sonTur!.gereken, b.gereken)
      yakin(d.sonTur!.gelir, b.gelir)
      yakin(d.fon, b.fon)
      expect(d.mulk.hamam).toBe(b.hamam)
      expect(d.mulk.han).toBe(b.han)
    }
  })
})

describe('Birim testleri', () => {
  it('sermaye toplamı 100 değilse kurulum geçersiz', () => {
    const a = varsayilanAyarlar()
    expect(kurulumGecerli(a)).toBe(true)
    expect(kurulumGecerli({ ...a, sermaye: { ...a.sermaye, nakit: 10 } })).toBe(false)
    expect(kurulumGecerli({ ...a, sermaye: { ...a.sermaye, nakit: 20 } })).toBe(false)
  })

  it('fon 10 veya altındaysa zimmet olmaz', () => {
    // Fon %0: fon hiç birikmez, becerikli mütevelli 60 tur boyunca zimmet yapamaz.
    const d = botlaOyna({ ...varsayilanAyarlar(), yedekFonOrani: 0, mutevelli: 'becerikli' })
    expect(d.gunluk.some((g) => g.mesaj.startsWith('Zimmet'))).toBe(false)
  })

  it('enflasyon gideri bileşik artırır', () => {
    let d = zorla({ 10: 'enflasyon', 20: 'enflasyon' })
    d = turOyna(d)
    yakin(d.hizmetGideri, 29.12)
    d = turOyna(d)
    yakin(d.hizmetGideri, 32.61)
  })

  it('arazi hiçbir olayda birim kaybetmez', () => {
    for (let t = 1; t <= 50; t++) {
      const d = botlaOyna({ ...varsayilanAyarlar(), tohum: t })
      expect(d.mulk.arazi).toBe(25)
    }
  })

  it('aynı tohum ve ayarlar aynı günlüğü üretir', () => {
    const a = botlaOyna({ ...varsayilanAyarlar(), tohum: 77 })
    const b = botlaOyna({ ...varsayilanAyarlar(), tohum: 77 })
    expect(JSON.stringify(a.gunluk)).toBe(JSON.stringify(b.gunluk))
  })

  it('karar beklerken tur oynanmaz, kapalı seçenek reddedilir', () => {
    let d = zorla({ 10: 'deprem' })
    d = turOyna(d)
    expect(turOyna(d)).toBe(d)
    expect(() => kararVer(d, 'fon')).toThrow()
  })
})

describe('Sunum tohumları (10 ve 116)', () => {
  // v3 olay tablosu (23 Eki): deprem seyreldi, salgın ve iyi olaylar eklendi.
  it('varsayılanla 600 yıla ulaşır: 24 olay, 9 karar, 0 boş sandık', () => {
    const d = botlaOyna(varsayilanAyarlar())
    expect(d.sonuc).toBe('ayakta')
    expect(d.olaySayisi).toBe(24)
    expect(d.kararSayisi).toBe(9)
    expect(d.toplamBos).toBe(0)
    expect(d.kararlar[0]).toMatchObject({ yil: 40, olay: 'yangin', secim: 'fon' })
    const k = sonucKarti(d)
    expect(k.ders).toBe('Yedek fon ve dağılmış gelir kaynakları vakfı yüzyıllarca taşıdı.')
    expect(k.istatistik).toBe('24 olay · 9 karar · sandık 0 kez boş kaldı')
  })

  // Ders tohumu 116: aynı ayarlarla dengeli kurulum ayakta kalır, tek kaynak ve hep kısmak çöker.
  it('tohum 116: dengeli ayakta, hamam 70 ile 150. yılda çöker ve tek kaynak dersi çıkar', () => {
    expect(botlaOyna({ ...varsayilanAyarlar(), tohum: 116 }).sonuc).toBe('ayakta')
    const d = botlaOyna({ ...varsayilanAyarlar(), tohum: 116, sermaye: { hamam: 70, han: 10, arazi: 5, nakit: 15 } })
    expect(d.sonuc).toBe('coktu')
    expect(d.yil).toBeLessThanOrEqual(200)
    expect(sonucKarti(d).ders).toBe('Tek gelir kaynağına dayanan vakıf tek felakette çöker.')
  })

  it('tohum 116: hep kısan oyuncu çöker', () => {
    const d = botlaOyna({ ...varsayilanAyarlar(), tohum: 116 }, 'kisan')
    expect(d.sonuc).toBe('coktu')
  })
})

describe('v3 olayları', () => {
  const tek = (olay: Parameters<typeof zorla>[0]) => turOyna(zorla(olay))
  it('salgın han gelirini yarıdan fazla düşürür ve hizmet giderini artırır, karar sormaz', () => {
    const n = tek({ 10: null }).sonTur!
    const s = tek({ 10: 'salgin' })
    expect(s.sonTur!.gelir).toBeLessThan(n.gelir)
    expect(s.sonTur!.gereken).toBeCloseTo(n.gereken * 1.5)
    expect(s.bekleyenKarar).toBeNull()
    expect(s.olaySayisi).toBe(1)
  })
  it('iyi olaylar geliri ya da fonu artırır ve olay sayısına girmez', () => {
    const n = tek({ 10: null })
    expect(tek({ 10: 'bereket' }).sonTur!.gelir).toBeGreaterThan(n.sonTur!.gelir)
    expect(tek({ 10: 'kervan' }).sonTur!.gelir).toBeGreaterThan(n.sonTur!.gelir)
    const b = tek({ 10: 'bagis' })
    expect(b.fon).toBeGreaterThan(n.fon)
    expect(b.olaySayisi).toBe(0)
    expect(b.gunluk.at(-1)?.tur).not.toBe('kotu')
  })
})

describe('her olay bir kez', () => {
  it('zarla gelen kötü ya da iyi olay ikinci kez çıkmaz', () => {
    for (const tohum of [1, 10, 116, 539]) {
      let d = yeniOyun({ ...varsayilanAyarlar(), tohum, olayBirKez: true })
      const goruldu: string[] = []
      for (let i = 0; i < 60 && !d.bitti; i++) {
        if (d.bekleyenKarar) d = kararVer(d, 'kis')
        d = turOyna(d)
        const o = d.sonTur?.olay
        if (o) {
          expect(goruldu).not.toContain(o)
          goruldu.push(o)
        }
      }
    }
  })
})

describe('olaylar arası nefes', () => {
  it('iki zar olayı arasında en az 30 yıl geçer', () => {
    for (const tohum of [1, 10, 116, 539, 777]) {
      let d = yeniOyun({ ...varsayilanAyarlar(), tohum, olayArasi: 3 })
      let son = -Infinity
      for (let i = 0; i < 60 && !d.bitti; i++) {
        if (d.bekleyenKarar) d = kararVer(d, 'kis')
        d = turOyna(d)
        if (d.sonTur?.olay) {
          expect(d.yil - son).toBeGreaterThanOrEqual(30)
          son = d.yil
        }
      }
    }
  })
})

