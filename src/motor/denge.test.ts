// Denge testi: docs/vakif-oyunu-kurallari-v2.md, bölüm 9 "Denge kontrolü".
// Oyunun dört dersi sayılarla doğru yönde mi? Katsayı değişince bu test bozulursa ders tersine dönmüş demektir.
import { describe, expect, it } from 'vitest'
import { botlaOyna, varsayilanAyarlar, type Ayarlar, type BotKurali } from './motor'

const TOHUM = 1000

function oran(degistir: Partial<Ayarlar>, kural: BotKurali = 'onaran'): number {
  let ayakta = 0
  for (let t = 1; t <= TOHUM; t++) {
    if (botlaOyna({ ...varsayilanAyarlar(), ...degistir, tohum: t }, kural).sonuc === 'ayakta') ayakta++
  }
  return (100 * ayakta) / TOHUM
}

describe('denge (1000 tohum)', () => {
  const dengeli = oran({})

  it('dengeli dağılım her ağırlıklı dağılımdan iyi', () => {
    const hamam = oran({ sermaye: { hamam: 70, han: 8, arazi: 7, nakit: 15 } })
    const han = oran({ sermaye: { hamam: 8, han: 70, arazi: 7, nakit: 15 } })
    const arazi = oran({ sermaye: { hamam: 8, han: 7, arazi: 70, nakit: 15 } })
    console.log({ dengeli, hamam, han, arazi })
    expect(dengeli).toBeGreaterThan(Math.max(hamam, han, arazi) + 2)
  })

  it('yedek fon arttıkça hayatta kalma artar', () => {
    const f0 = oran({ yedekFonOrani: 0 })
    const f40 = oran({ yedekFonOrani: 40 })
    console.log({ f0, dengeli, f40 })
    expect(f0).toBeLessThan(dengeli)
    expect(dengeli).toBeLessThan(f40)
  })

  it('dürüst mütevelli beceriklidan iyi', () => {
    const becerikli = oran({ mutevelli: 'becerikli' })
    console.log({ dengeli, becerikli })
    expect(becerikli).toBeLessThan(dengeli - 5)
  })

  it('büyük amaç daha zor', () => {
    const medrese = oran({ amac: 'medrese' })
    const cami = oran({ amac: 'cami' })
    const cesme = oran({ amac: 'cesme' })
    console.log({ asevi: dengeli, medrese, cami, cesme })
    expect(dengeli).toBeLessThan(medrese)
    expect(medrese).toBeLessThanOrEqual(cami)
    expect(cami).toBeLessThanOrEqual(cesme)
  })

  it('kolay modda da dersler aynı yönde, ama vakıf daha kolay ayakta kalır', () => {
    const k = (d: Partial<Ayarlar>) => oran({ ...d, zorluk: 'kolay' })
    const kDengeli = k({})
    console.log({ kolayDengeli: kDengeli })
    expect(kDengeli).toBeGreaterThan(dengeli + 10)
    expect(k({ sermaye: { hamam: 70, han: 8, arazi: 7, nakit: 15 } })).toBeLessThan(kDengeli)
    expect(k({ yedekFonOrani: 0 })).toBeLessThan(kDengeli)
    expect(k({ mutevelli: 'becerikli' })).toBeLessThan(kDengeli)
  })

  it('hep onaran hep kısandan iyi', () => {
    const kisan = oran({}, 'kisan')
    console.log({ onaran: dengeli, kisan })
    expect(kisan).toBeLessThan(dengeli - 8)
  })
})
