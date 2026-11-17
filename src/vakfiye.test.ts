import { describe, expect, it } from 'vitest'
import { botlaOyna, varsayilanAyarlar, yeniOyun } from './motor/motor'
import { levelAyarlari, LEVELLER } from './leveller'
import { hicriYaklasik, KARAR_SATIRI, vakfiyeMetni, vakfiyeOlustur, yuzdeEki } from './vakfiye'
import { dilDegistir } from './dil'

const ayar = (no: number) => levelAyarlari(LEVELLER[no - 1], { ...varsayilanAyarlar(), zorluk: 'normal' })
const SIRA = ['davet', 'vakif', 'sartlar', 'hayat', 'tarih']

describe('vakfiye', () => {
  it('aynı durum ve ad aynı metni verir', () => {
    const d = botlaOyna(ayar(1), 'onaran', true)
    expect(vakfiyeMetni(vakfiyeOlustur(d, 'Rabia'))).toBe(vakfiyeMetni(vakfiyeOlustur(d, 'Rabia')))
  })

  it('bölümler TDV maddesindeki sırayı izler; oyun eki yalnız "hayat" bölümüdür', () => {
    const v = vakfiyeOlustur(botlaOyna(ayar(1), 'onaran', true), 'Ayşe')
    expect(v.bolumler.map((b) => b.id)).toEqual(SIRA)
    expect(v.bolumler.filter((b) => b.oyunEki).map((b) => b.id)).toEqual(['hayat'])
  })

  it('ad boşsa "Bir hayır sahibi"; ad kırpılır', () => {
    const d = yeniOyun(varsayilanAyarlar())
    expect(vakfiyeOlustur(d, '  ').vakifAdi).toBe('Bir hayır sahibi')
    expect(vakfiyeOlustur(d, 'a'.repeat(40)).vakifAdi).toHaveLength(24)
  })

  it('sermaye, yedek fon ve hizmet oyuncunun ayarlarından gelir', () => {
    const d = yeniOyun(varsayilanAyarlar())
    const m = vakfiyeMetni(vakfiyeOlustur(d, 'Ayşe'))
    expect(m).toContain('hamama 30, hana 30, araziye 25')
    expect(m).toContain('15 akçe nakit')
    expect(m).toContain('%20')
    expect(m).toContain('aşevi')
  })

  it('çöken vakfın metni çöküşü anlatır, ayakta olan ayakta der', () => {
    let coken = null
    for (let t = 1; t < 400 && !coken; t++) {
      const d = botlaOyna({ ...varsayilanAyarlar(), tohum: t, yedekFonOrani: 0, zorluk: 'normal' }, 'kisan')
      if (d.sonuc === 'coktu') coken = d
    }
    expect(coken, 'çöken bir oyun bulunmalı').not.toBeNull()
    const v = vakfiyeOlustur(coken!, 'Ayşe')
    expect(v.ayakta).toBe(false)
    expect(vakfiyeMetni(v)).toContain('vakıf çöktü')
    const ayakta = vakfiyeOlustur(botlaOyna(ayar(1), 'onaran', true), 'Ayşe')
    expect(ayakta.ayakta).toBe(true)
    expect(vakfiyeMetni(ayakta)).toContain('vakıf ayakta')
  })

  it('olaysız oyunda "büyük bir olay uğramadı" der ve karar satırı yoktur', () => {
    const d = { ...yeniOyun(varsayilanAyarlar()), yil: 100, bitti: true, sonuc: 'ayakta' as const }
    const hayat = vakfiyeOlustur(d).bolumler.find((b) => b.id === 'hayat')!
    expect(hayat.satirlar[0]).toContain('büyük bir olay uğramadı')
    expect(hayat.satirlar.some((s) => s.includes('onarıldı') || s.includes('kısıldı'))).toBe(false)
  })

  it('kararlar ve kurulan yapılar belgeye girer; levelli tarih yazılır', () => {
    const d = botlaOyna(ayar(4), 'onaran', true)
    const v = vakfiyeOlustur(d, 'Ayşe')
    const m = vakfiyeMetni(v)
    expect(m).toContain('Hatay')
    expect(m).toContain('Habib-i Neccar Camii ve Külliyesi')
    expect(m).toContain('Eklenen yapılar:')
    expect(m).toContain('Miladî 1500')
    expect(v.bolumler.find((b) => b.id === 'hayat')!.satirlar.some((s) => /onarıldı|kısıldı/i.test(s))).toBe(d.kararlar.length > 0)
  })

  it('kısa: 800 harfi aşmaz; kararlar seçim türüne göre özetlenir', () => {
    try {
      // Eski belge ~1300 harfti; parşömene kaydırmadan sığması için 800 harf sınırı.
      for (const dil of ['tr', 'en'] as const) {
        dilDegistir(dil)
        for (const no of [1, 2, 3, 4]) {
          const v = vakfiyeOlustur(botlaOyna(ayar(no), 'onaran', true), 'Rabia')
          expect(vakfiyeMetni(v).length, `${dil} level ${no}`).toBeLessThanOrEqual(800)
        }
      }
    } finally {
      dilDegistir('tr')
    }
    const d = botlaOyna(ayar(4), 'onaran', true)
    const cok = { ...d, kararlar: Array.from({ length: 6 }, (_, i) => ({ ...d.kararlar[0], yil: 40 * (i + 1), olay: 'deprem' as const, secim: (i % 2 ? 'fon' : 'kis') as 'fon' | 'kis' })) }
    const hayat = vakfiyeOlustur(cok).bolumler.find((b) => b.id === 'hayat')!.satirlar
    expect(hayat.filter((s) => /onarıldı|kısıldı/i.test(s))).toEqual(['Hizmet kısıldı: 40. yıl deprem, 120. yıl deprem ve 1 olay daha.', 'Yedek fondan onarıldı: 80. yıl deprem, 160. yıl deprem ve 1 olay daha.'])
    expect(KARAR_SATIRI).toBe(3)
  })

  it('aynı seçimle verilen kararlar tek cümlede birleşir', () => {
    const d = botlaOyna(ayar(1), 'onaran', true)
    const iki = { ...d, kararlar: [{ ...d.kararlar[0], yil: 40, olay: 'deprem' as const, secim: 'fon' as const }, { ...d.kararlar[0], yil: 80, olay: 'yangin' as const, secim: 'fon' as const }] }
    const hayat = vakfiyeOlustur(iki).bolumler.find((b) => b.id === 'hayat')!.satirlar
    expect(hayat[0]).toBe('40. yıl deprem, 80. yıl yangın: ikisinde de yedek fondan onarıldı.')
  })

  it('İngilizce belge de aynı beş bölümü verir', () => {
    dilDegistir('en')
    try {
      const v = vakfiyeOlustur(botlaOyna(ayar(1), 'onaran', true), 'Rabia')
      expect(v.bolumler.map((b) => b.id)).toEqual(SIRA)
      expect(v.baslik).toBe('Deed of the Soup Kitchen Foundation')
      expect(vakfiyeMetni(v)).toContain('Rabia endowed 100 akçe in Bursa')
    } finally {
      dilDegistir('tr')
    }
  })

  it('yüzde eki okunuşa uyar', () => {
    expect([0, 5, 10, 15, 20, 25, 30, 40, 45, 50].map(yuzdeEki)).toEqual(["%0'ı", "%5'i", "%10'u", "%15'i", "%20'si", "%25'i", "%30'u", "%40'ı", "%45'i", "%50'si"])
  })

  it('hicrî yıl yalnız yaklaşık hesaplanır', () => {
    expect(hicriYaklasik(1340)).toBe(740)
    expect(hicriYaklasik(622)).toBe(0)
  })
})
