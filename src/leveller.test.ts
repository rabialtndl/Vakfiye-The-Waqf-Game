import { describe, expect, it } from 'vitest'
import { botlaOyna, kararVer, turOyna, varsayilanAyarlar, yeniOyun, yildiz } from './motor/motor'
import { levelAcik, levelAyarlari, levelGecildi, LEVELLER, SERBEST } from './leveller'
import { sezonKur } from './sezon'

const ayar = (no: number) => levelAyarlari(LEVELLER[no - 1], { ...varsayilanAyarlar(), zorluk: 'normal' })

describe('leveller', () => {
  it('her level, inşa eden bir oyuncuyla varsayılan sermayeyle geçilebilir', () => {
    for (const l of LEVELLER) {
      const d = botlaOyna(ayar(l.no), 'onaran', true)
      expect(d.sonuc, `level ${l.no}`).toBe('ayakta')
      expect(d.yil).toBe(l.hedefYil)
      expect(levelGecildi(d), `level ${l.no}`).toBe(true)
      expect(yildiz(d)).toBeGreaterThanOrEqual(2)
    }
  })

  it('hedef yıla varınca oyun biter; yapı hedefi tutmazsa level geçilmez', () => {
    const d = botlaOyna(ayar(3), 'onaran', false) // hiç yapı kurmayan oyuncu
    expect(d.bitti).toBe(true)
    if (d.sonuc === 'ayakta') expect(levelGecildi(d)).toBe(false)
  })

  it('senaryolar levelin tarihi olayını taşır; "her olay bir kez" açıkken her olay en çok bir kez', () => {
    const say = (no: number, olay: string, birKez = false) =>
      botlaOyna({ ...ayar(no), olayBirKez: birKez }, 'onaran', true).gunluk.filter((g) => g.mesaj.toLocaleLowerCase('tr').startsWith(olay)).length
    expect(say(2, 'kuraklık')).toBeGreaterThanOrEqual(4)
    expect(say(4, 'deprem')).toBeGreaterThanOrEqual(4)
    for (const no of [1, 2, 3, 4]) for (const o of ['deprem', 'yangın', 'kuraklık', 'savaş', 'salgın']) expect(say(no, o, true), `level ${no} ${o}`).toBeLessThanOrEqual(1)
    expect(say(4, 'deprem', true)).toBe(1) // 1853 Habib-i Neccar
  })

  it('level sırayla açılır; o şehirden pul varsa erken açılır; serbest oyun hep açık', () => {
    expect(levelAcik(LEVELLER[0], {}, [])).toBe(true)
    expect(levelAcik(LEVELLER[1], {}, [])).toBe(false)
    expect(levelAcik(LEVELLER[1], { 1: 2 }, [])).toBe(true)
    expect(levelAcik(LEVELLER[2], {}, ['kursunlu-han-hatay'])).toBe(true)
    expect(levelAcik(SERBEST, {}, [])).toBe(true)
  })

  it('serbest oyun eski oyunla aynı: 600 yıl, hedef yok', () => {
    const a = levelAyarlari(SERBEST, ayar(4))
    expect(a.hedefYil).toBeUndefined()
    expect(a.levelNo).toBeUndefined()
    expect(a.amac).toBe('cami') // oyuncunun seçimi korunur
  })

  it('3. levelden sonra sezonda 4. ürün, kişiler daha sabırsız', () => {
    const d = yeniOyun(ayar(4))
    const kolay = sezonKur({ durum: d, okunan: [], pullar: [], sureli: true, zorluk: 1 })
    const zor = sezonKur({ durum: d, okunan: [], pullar: [], sureli: true, zorluk: 4 })
    expect(kolay.menu).toHaveLength(3)
    expect(zor.menu).toHaveLength(4)
    expect(zor.sabir).toBeLessThan(kolay.sabir)
    expect(zor.aralik).toBeLessThan(kolay.aralik)
  })
})

describe('tarih ve çarşı', () => {
  it('tarihi olaylar levelin turuna düşer ve motor o turda o olayı oynatır', async () => {
    const { tarihiTur, buTurunTarihi } = await import('./leveller')
    const l = LEVELLER[3]
    expect(tarihiTur(l, 1853)).toBe(360)
    let d = yeniOyun(ayar(4))
    while (!d.bitti && d.yil < 360) d = d.bekleyenKarar ? kararVer(d, 'fon') : turOyna(d)
    expect(d.sonTur?.yil).toBe(360)
    expect(d.sonTur?.olay).toBe('deprem')
    expect(buTurunTarihi(d)?.baslik).toContain('Habib-i Neccar')
  })

  it('her tarihi olayın kaynağı var ve level süresinin içinde', () => {
    for (const l of LEVELLER) for (const t of l.tarih) {
      expect(t.kaynak.url).toMatch(/^https:\/\//)
      expect(t.yil).toBeGreaterThan(l.takvim)
      expect(t.yil).toBeLessThanOrEqual(l.takvim + l.hedefYil)
    }
  })

  it('bilgi yerleri sabit, eşsiz, kaynaklı; kümbet var', async () => {
    const { ESNAF_HIKAYELERI } = await import('./esnaf')
    expect(new Set(ESNAF_HIKAYELERI.map((h) => h.id)).size).toBe(ESNAF_HIKAYELERI.length)
    for (const h of ESNAF_HIKAYELERI) {
      expect(h.yer[0]).toBeGreaterThan(0)
      expect(h.kaynak.url ?? h.kaynak.eser).toBeTruthy()
    }
    expect(ESNAF_HIKAYELERI.find((h) => h.id === 'kumbet')?.odul).toBeFalsy()
  })
})
