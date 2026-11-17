import { describe, expect, it } from 'vitest'
import { varsayilanAyarlar, yeniOyun } from './motor/motor'
import { acikUrunler, ARABA_KAPASITE, GIDIS_SN, hazirla, hazirlaKontrol, keseTopla, MENU, sezonAdim, sezonKur, sezonPuani, topla, URUNLER, yolaCik, yukIndir, type Sezon } from './sezon'
import sorular from './veri/sorular.json'

const oyun = () => yeniOyun(varsayilanAyarlar())
const ilerlet = (s: Sezon, sn: number) => {
  for (let i = 0; i < sn * 10 && !s.bitti; i++) s = sezonAdim(s, 0.1)
  return s
}
const hepsiOkundu = Object.values(URUNLER).map((u) => u.eser)

/** Akıllı oyuncu: hasadı ve keseleri toplar, sıradakilerin istediğini yükler, arabayı gönderir. */
function iyiOyna(s: Sezon): Sezon {
  while (!s.bitti) {
    s = sezonAdim(s, 0.1)
    for (const i of s.istasyonlar) if (i.hazirSn !== null) s = topla(s, i.id)
    for (const k of s.keseler) s = keseTopla(s, k.id)
    if (s.araba.durum === 'depoda') {
      const istenen = s.musteriler.map((m) => m.urun).slice(0, ARABA_KAPASITE)
      for (const u of istenen) if (s.yuk.filter((x) => x === u).length < istenen.filter((x) => x === u).length) s = hazirla(s, u)
      if (s.yuk.length && (s.yuk.length >= istenen.length || s.yuk.length >= ARABA_KAPASITE)) s = yolaCik(s)
    }
  }
  return s
}

describe('sezon mini oyunu', () => {
  it('hayratın ilk ürünü açık, diğerleri eser kartı okununca açılır', () => {
    expect(acikUrunler('asevi', [])).toEqual(['corba'])
    expect(acikUrunler('asevi', [URUNLER.ekmek.eser])).toEqual(['corba', 'ekmek'])
    for (const m of Object.values(MENU)) expect(m).toHaveLength(3)
  })

  it('aynı tohumla aynı sezon: kişiler, hasat ve keseler tekrar edilebilir', () => {
    const a = ilerlet(sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: true, tohum: 7 }), 30)
    const b = ilerlet(sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: true, tohum: 7 }), 30)
    expect(a.gelen).toBe(b.gelen)
    expect(a.hasatGelen).toBe(b.hasatGelen)
    expect(a.keseNo).toBeGreaterThan(3)
    expect(a.bitti).toBe(true)
  })

  it('hiçbir şey yapmayan oyuncu bonus almaz, iyi oynayan en çok %20 alır', () => {
    const bos = ilerlet(sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: true, tohum: 3 }), 30)
    expect(sezonPuani(bos).bonus).toBe(0)
    const p = sezonPuani(iyiOyna(sezonKur({ durum: oyun(), okunan: hepsiOkundu, pullar: [], sureli: true, tohum: 3 })))
    expect(p.hasat).toBe(1)
    expect(p.hizmet).toBeGreaterThan(0.6)
    expect(p.bonus).toBeLessThanOrEqual(0.2)
    expect(p.bonus).toBeGreaterThan(0.15)
  })

  it('araba: yükle, yola çık, hayrata varınca bekleyene ver, geri dön', () => {
    let s = sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: true, tohum: 1 })
    s = { ...s, musteriler: [{ id: 1, urun: 'corba', geldiSn: 0, sabir: 99 }] }
    s = hazirla(s, 'corba')
    expect(s.yuk).toEqual(['corba'])
    s = yolaCik(s)
    expect(s.araba.durum).toBe('gidiyor')
    expect(hazirlaKontrol(s, 'corba')).toBe('araba-yolda')
    s = ilerlet(s, GIDIS_SN + 0.2)
    expect(s.verilen).toBe(1)
    expect(s.yuk).toEqual([])
    expect(s.araba.durum).toBe('donuyor')
    s = ilerlet(s, 2)
    expect(s.araba.durum).toBe('depoda')
  })

  it('isteyeni olmayan ürün boşa gider; araba en çok 3 ürün alır; yük geri indirilebilir', () => {
    let s = sezonKur({ durum: oyun(), okunan: hepsiOkundu, pullar: [], sureli: true, tohum: 1 })
    s = { ...s, musteriler: [], sonrakiMusteriSn: 99, mesgul: {} }
    for (const u of ['corba', 'su', 'corba', 'su'] as const) s = { ...hazirla(s, u), mesgul: {} }
    expect(s.yuk).toHaveLength(ARABA_KAPASITE)
    expect(hazirlaKontrol(s, 'corba')).toBe('araba-dolu')
    s = yukIndir(s)
    expect(s.yuk).toHaveLength(2)
    s = ilerlet(yolaCik(s), GIDIS_SN + 0.2)
    expect(s.bosa).toBe(2)
    expect(s.verilen).toBe(0)
  })

  it('kilitli ürün yüklenemez; ekmek buğday ister, buğday araziden gelir', () => {
    let s = sezonKur({ durum: oyun(), okunan: [URUNLER.ekmek.eser], pullar: [], sureli: true, tohum: 1 })
    expect(hazirlaKontrol(s, 'su')).toBe('kilitli')
    expect(s.bugdayGerekli).toBe(true) // varsayılan kurulumda arazi var
    expect(hazirlaKontrol(s, 'ekmek')).toBe('bugday')
    s = { ...s, istasyonlar: s.istasyonlar.map((i) => (i.id === 'arazi' ? { ...i, hazirSn: 0 } : i)) }
    s = topla(s, 'arazi')
    expect(s.bugday).toBe(2)
    s = hazirla(s, 'ekmek')
    expect(s.yuk).toEqual(['ekmek'])
    expect(s.bugday).toBe(1)
  })

  it('yardım kesesi toplanınca hasada sayılır, toplanmazsa kaybolur', () => {
    let s = ilerlet(sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: true, tohum: 2 }), 3)
    expect(s.keseler.length).toBe(1)
    const once = s.hasatAlinan
    s = keseTopla(s, s.keseler[0].id)
    expect(s.hasatAlinan).toBe(once + 1)
    expect(s.keseler).toHaveLength(0)
  })

  it('pasaport pulu: o eserin ürünü iki kat hızlı, her pul sabrı uzatır', () => {
    const pullu = sezonKur({ durum: oyun(), okunan: [], pullar: [URUNLER.corba.eser, 'x', 'y'], sureli: true, tohum: 1 })
    expect(pullu.pullu).toEqual(['corba'])
    expect(pullu.sabir).toBeGreaterThan(sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: true }).sabir)
    const s = hazirla(pullu, 'corba')
    expect(s.mesgul.corba).toBeCloseTo(URUNLER.corba.hazirlik / 2)
  })

  it('süresiz sezon 10 kişiyle biter, açık ürünü isteyen kimse sabırsızlanıp gitmez', () => {
    let s = sezonKur({ durum: oyun(), okunan: [], pullar: [], sureli: false, tohum: 5 })
    for (let i = 0; i < 6000 && !s.bitti; i++) {
      s = sezonAdim(s, 0.1)
      if (s.araba.durum === 'depoda' && s.musteriler.some((m) => m.urun === 'corba')) s = yolaCik(hazirla(s, 'corba'))
    }
    expect(s.bitti).toBe(true)
    expect(s.gelen).toBe(10)
    expect(s.kacan.every((k) => k.kilitli)).toBe(true)
  })
})

describe('soru bankası', () => {
  it('her sorunun doğru cevabı seçeneklerde, kaynağı belli', () => {
    expect(sorular.length).toBeGreaterThan(40)
    for (const q of sorular) {
      expect(q.secenekler.map((x) => x.id)).toContain(q.dogru)
      expect(new Set(q.secenekler.map((x) => x.id)).size).toBe(3)
      expect(q.kaynak.length).toBeGreaterThan(3)
    }
  })
})
