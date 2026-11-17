import { describe, expect, it } from 'vitest'
import { karsilastir, meydanBaglantisi, meydanCoz, meydanKodu, meydanOku } from './meydan'

describe('meydan okuma', () => {
  it('kod gidip gelir (Türkçe adla)', () => {
    const m = { l: 3, y: 2, yil: 350, a: true, ad: 'Ayşe Çınar' }
    expect(meydanCoz(meydanKodu(m))).toEqual(m)
  })
  it('bağlantı sayfanın kendi adresine eklenir ve okunur', () => {
    const b = meydanBaglantisi({ l: 1, y: 3, yil: 200, a: true }, 'https://ornek.org/tr/oyun?dil=tr#x')
    const u = new URL(b)
    expect(u.pathname).toBe('/tr/oyun')
    expect(u.searchParams.get('dil')).toBe('tr')
    expect(meydanOku(u.search)).toEqual({ l: 1, y: 3, yil: 200, a: true })
  })
  it('bozuk ya da uydurma kodu reddeder', () => {
    expect(meydanCoz('bozuk!!')).toBeNull()
    expect(meydanCoz(btoa(JSON.stringify({ l: 1, y: 9, yil: 10 })))).toBeNull()
    expect(meydanCoz(btoa(JSON.stringify({ l: 1, y: 1, yil: 10, ad: '<b>x</b>' })))?.ad).toBe('bx/b')
  })
  it('önce yıldız, sonra yıl karşılaştırılır', () => {
    const m = { l: 1, y: 2, yil: 200, a: true }
    expect(karsilastir(m, 3, 100)).toBe('kazandin')
    expect(karsilastir(m, 2, 150)).toBe('kaybettin')
    expect(karsilastir(m, 2, 200)).toBe('berabere')
  })
})
