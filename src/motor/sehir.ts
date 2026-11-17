// Şehir genişlemesi: vakıf köyle başlar, yüzyıllar geçtikçe (ya da gerçek hayatta pasaport pulu topladıkça)
// çarşı, mahalle, köyler ve kervan yolu açılır. Hizmetten artan para "yapı parasına" girer; oyuncu
// açılan arsalara yeni yapılar kurar. Hiç inşa etmeyen oyuncu için oyunun dengesi değişmez.
// Kurallar: docs/vakif-oyunu-kurallari-v2.md, bölüm 13.

import { iki, L } from '../dil'
import type { AmacId, OlayId } from './sabitler'

export type YapiId = 'arasta' | 'bedesten' | 'evler' | 'degirmen' | 'kopru' | 'kumbet' | 'kervan' | 'mektep' | 'asevi' | 'cesme' | 'medrese' | 'cami'
export type BolgeId = 'carsi' | 'mahalle' | 'koyler' | 'yol'

export type YapiTanimi = {
  ad: string
  tur: 'akar' | 'destek' | 'hayrat'
  maliyet: number
  /** Olaysız bir turda getirdiği kira ya da ürün (mütevelli ve kolay mod çarpanından önce). */
  gelir: number
  /** Her tur ödenen bakım ya da görevli maaşı. */
  bakim: number
  /** Oyuncuya bir cümlede ne işe yaradığı. */
  etki: string
  /** Hangi olayda ne olur. */
  olay: string
  /** Önce kurulması gereken yapı. */
  gerek?: YapiId
  /** Haritada yalnızca bir tane kurulabilir. */
  tek?: boolean
}

export const YAPILAR: Record<YapiId, YapiTanimi> = {
  arasta: iki({ ad: 'Arasta', tur: 'akar', maliyet: 25, gelir: 6, bakim: 0.6, etki: 'Esnafa kiralanan dükkân sırası. Kira her tur sandığa girer.', olay: 'Yangında o tur kira gelmez.' }, { ad: 'Arasta', etki: 'A row of shops rented to tradesmen. The rent goes into the chest every round.', olay: 'In a fire, no rent comes in that round.' }),
  bedesten: iki({ ad: 'Bedesten', tur: 'akar', maliyet: 50, gelir: 10, bakim: 1, etki: 'Değerli malların kapalı çarşısı. Kirası yüksek; kalın taş tonozu yangına dayanır.', olay: 'Savaşta ticaret durur, o tur kira gelmez.' }, { ad: 'Bedesten', etki: 'A covered market for valuable goods. High rent; its thick stone vault withstands fire.', olay: 'In a war, trade stops and no rent comes in that round.' }),
  evler: iki({ ad: 'Vakıf evleri', tur: 'akar', maliyet: 20, gelir: 4, bakim: 0.4, etki: 'Mahallede kiraya verilen evler. Az ama düzenli kira.', olay: 'Depremde o tur kira gelmez.' }, { ad: 'Foundation houses', etki: 'Houses rented out in the neighbourhood. Small but steady rent.', olay: 'In an earthquake, no rent comes in that round.' }),
  degirmen: iki({ ad: 'Değirmen', tur: 'akar', maliyet: 30, gelir: 5, bakim: 0.6, gerek: 'kopru', tek: true, etki: 'Köylerin buğdayını öğütür; ürün payı sandığa girer.', olay: 'Kuraklıkta durur.' }, { ad: 'Mill', etki: 'Grinds the villages’ wheat; a share of the flour goes into the chest.', olay: 'Stops in a drought.' }),
  kumbet: iki({ ad: 'Kümbet', tur: 'destek', maliyet: 20, gelir: 3, bakim: 0.5, tek: true, etki: 'Vakfın kurucusunun kümbeti. Ziyaretçiler her tur küçük bir bağış bırakır.', olay: 'Olaylardan etkilenmez.' }, { ad: 'Kümbet', etki: 'The tomb of the foundation’s founder. Visitors leave a small donation every round.', olay: 'Not affected by events.' }),
  kopru: iki({ ad: 'Köprü', tur: 'destek', maliyet: 20, gelir: 0, bakim: 0.5, tek: true, etki: 'Nehrin öbür yakasındaki köyleri şehre bağlar: arazi geliri %20 artar, değirmen kurulabilir.', olay: 'Olaylardan etkilenmez.' }, { ad: 'Bridge', etki: 'Connects the villages across the river to the city: farmland income +20%, and a mill can be built.', olay: 'Not affected by events.' }),
  kervan: iki({ ad: 'Kervan yolu', tur: 'hayrat', maliyet: 40, gelir: 0, bakim: 2, tek: true, etki: 'Yolu onarır ve korur, kervanı şehre çeker: han geliri %25, arastanın kirası 2 artar.', olay: 'Savaşta yol kapanır, o tur etkisi olmaz.' }, { ad: 'Caravan road', etki: 'Repairs and guards the road and draws caravans to the city: inn income +25%, arasta rent +2.', olay: 'In a war the road closes and has no effect that round.' }),
  asevi: iki({ ad: 'Aşevi', tur: 'hayrat', maliyet: 25, gelir: 2, bakim: 1.5, tek: true, etki: 'Yoksullara ve yolculara sıcak yemek. Halkın duası ve küçük bağışlar her tur sandığa girer.', olay: 'Olaylardan etkilenmez.' }, { ad: 'Soup kitchen', etki: 'Hot meals for the poor and travellers. Prayers and small donations go into the chest every round.', olay: 'Not affected by events.' }),
  cesme: iki({ ad: 'Çeşme', tur: 'hayrat', maliyet: 20, gelir: 2, bakim: 1, tek: true, etki: 'Mahalleye ve yolculara su. Dua eden halkın bıraktığı küçük bağışlar her tur sandığa girer.', olay: 'Kuraklıkta kurur, o tur bağış gelmez.' }, { ad: 'Fountain', etki: 'Water for the neighbourhood and travellers. Small donations from grateful people go into the chest every round.', olay: 'Dries up in a drought; no donations that round.' }),
  medrese: iki({ ad: 'Medrese', tur: 'hayrat', maliyet: 35, gelir: 2, bakim: 2, tek: true, etki: 'Talebelere ilim ve barınak. Mezunların ve hayır sahiplerinin bağışları her tur sandığa girer.', olay: 'Olaylardan etkilenmez.' }, { ad: 'Madrasa', etki: 'Learning and lodging for students. Donations from graduates and patrons go into the chest every round.', olay: 'Not affected by events.' }),
  cami: iki({ ad: 'Cami', tur: 'hayrat', maliyet: 45, gelir: 3, bakim: 2, tek: true, etki: 'Cemaatin buluşma yeri. Cuma ve bayram bağışları her tur sandığa girer.', olay: 'Olaylardan etkilenmez.' }, { ad: 'Mosque', etki: 'The community’s gathering place. Friday and festival donations go into the chest every round.', olay: 'Not affected by events.' }),
  mektep: iki({ ad: 'Sıbyan mektebi', tur: 'hayrat', maliyet: 15, gelir: 0, bakim: 1.5, tek: true, etki: 'Mahalle çocuklarına okuma yazma. Mahalle büyür: vakıf evlerinin kirası %50 artar.', olay: 'Olaylardan etkilenmez.' }, { ad: 'Primary school', etki: 'Reading and writing for the neighbourhood children. The neighbourhood grows: foundation house rent +50%.', olay: 'Not affected by events.' }),
}

export type BolgeTanimi = { ad: string; yil: number; pul: number }

/** Bölge, bu yıla gelince ya da oyuncunun pasaportunda bu kadar pul olunca açılır. */
export const BOLGELER: Record<BolgeId, BolgeTanimi> = {
  carsi: iki({ ad: 'Çarşı', yil: 50, pul: 1 }, { ad: 'Bazaar' }),
  mahalle: iki({ ad: 'Mahalle', yil: 0, pul: 2 }, { ad: 'Neighbourhood' }),
  koyler: iki({ ad: 'Köyler', yil: 250, pul: 3 }, { ad: 'Villages' }),
  yol: iki({ ad: 'Kervan yolu', yil: 350, pul: 4 }, { ad: 'Caravan road' }),
}

export type ArsaId = 'c1' | 'c2' | 'c3' | 'm1' | 'm2' | 'k1' | 'k2' | 'a1' | 'a2' | 'a3' | 'a4' | 'y1'

/** Haritadaki her arsada tek bir yapı kurulur (resimde o yapı zaten çizili; kurulunca renklenir). */
export const ARSALAR: Record<ArsaId, { bolge: BolgeId; izin: YapiId[]; ad: string }> = {
  c1: iki({ bolge: 'carsi', izin: ['arasta'], ad: 'Çarşı caddesi' }, { ad: 'Bazaar street' }),
  c2: iki({ bolge: 'carsi', izin: ['bedesten'], ad: 'Çarşı galerisi' }, { ad: 'Bazaar gallery' }),
  c3: iki({ bolge: 'carsi', izin: ['kumbet'], ad: 'Cami bahçesi' }, { ad: 'Mosque garden' }),
  m1: iki({ bolge: 'mahalle', izin: ['evler'], ad: 'Mahalle' }, { ad: 'Neighbourhood' }),
  m2: iki({ bolge: 'mahalle', izin: ['mektep'], ad: 'Mahalle meydanı' }, { ad: 'Neighbourhood square' }),
  k1: iki({ bolge: 'koyler', izin: ['kopru'], ad: 'Nehir geçidi' }, { ad: 'River crossing' }),
  k2: iki({ bolge: 'koyler', izin: ['degirmen'], ad: 'Nehir kıyısı' }, { ad: 'Riverbank' }),
  a1: iki({ bolge: 'mahalle', izin: ['asevi'], ad: 'Aşevi arsası' }, { ad: 'Soup kitchen plot' }),
  a2: iki({ bolge: 'mahalle', izin: ['cesme'], ad: 'Çeşme arsası' }, { ad: 'Fountain plot' }),
  a3: iki({ bolge: 'mahalle', izin: ['medrese'], ad: 'Medrese arsası' }, { ad: 'Madrasa plot' }),
  a4: iki({ bolge: 'mahalle', izin: ['cami'], ad: 'Cami arsası' }, { ad: 'Mosque plot' }),
  y1: iki({ bolge: 'yol', izin: ['kervan'], ad: 'Kervan yolu' }, { ad: 'Caravan road' }),
}

export const ARSA_SIRASI = Object.keys(ARSALAR) as ArsaId[]

export type Yapilar = Partial<Record<ArsaId, YapiId>>

export function bolgeAcik(bolge: BolgeId, yil: number, pulSayisi: number): boolean {
  const b = BOLGELER[bolge]
  return yil >= b.yil || pulSayisi >= b.pul
}

export function yapiSayisi(y: Yapilar, yapi: YapiId): number {
  return Object.values(y).filter((v) => v === yapi).length
}

export type InsaKontrolu = { olur: boolean; neden?: string }

/** Bu arsaya bu yapı şimdi kurulabilir mi? Kurulamıyorsa nedenini oyuncunun anlayacağı dille verir. */
export function insaKontrol(
  s: { yil: number; artan: number; yapilar: Yapilar; bitti: boolean; bekleyenKarar: unknown; ayarlar?: { amac: AmacId } },
  arsa: ArsaId,
  yapi: YapiId,
  pulSayisi: number,
): InsaKontrolu {
  const a = ARSALAR[arsa]
  const t = YAPILAR[yapi]
  if (s.bitti) return { olur: false, neden: L('Oyun bitti.', 'The game is over.') }
  if (s.bekleyenKarar) return { olur: false, neden: L('Önce karar ver.', 'Make your decision first.') }
  // Vakfın kendi hizmet binası zaten var: aynı türden ikinci bir hizmet binası kurulmaz.
  if (s.ayarlar?.amac === yapi) return { olur: false, neden: L(`Vakfın hizmeti zaten ${t.ad.toLocaleLowerCase('tr')}.`, `Your foundation’s service is already a ${t.ad.toLocaleLowerCase('en')}.`) }
  if (!bolgeAcik(a.bolge, s.yil, pulSayisi)) {
    const b = BOLGELER[a.bolge]
    return { olur: false, neden: L(`${b.ad} ${b.yil}. yılda ya da ${b.pul} pulla açılır.`, `${b.ad} opens in year ${b.yil} or with ${b.pul} stamps.`) }
  }
  if (!a.izin.includes(yapi)) return { olur: false, neden: L(`${t.ad} buraya kurulamaz.`, `${t.ad} cannot be built here.`) }
  if (s.yapilar[arsa]) return { olur: false, neden: L('Arsa dolu.', 'This plot is taken.') }
  if (t.tek && yapiSayisi(s.yapilar, yapi) > 0) return { olur: false, neden: L(`Şehirde zaten bir ${t.ad.toLocaleLowerCase('tr')} var.`, `The city already has a ${t.ad.toLocaleLowerCase('en')}.`) }
  if (t.gerek && yapiSayisi(s.yapilar, t.gerek) === 0) return { olur: false, neden: L(`Önce ${YAPILAR[t.gerek].ad.toLocaleLowerCase('tr')} kur.`, `Build a ${YAPILAR[t.gerek].ad.toLocaleLowerCase('en')} first.`) }
  if (s.artan < t.maliyet) return { olur: false, neden: L(`Yapı paran yetmiyor: ${t.maliyet} akçe gerekir, ${Math.floor(s.artan)} akçen var.`, `Not enough building money: needs ${t.maliyet} akçe, you have ${Math.floor(s.artan)}.`) }
  return { olur: true }
}

export type SehirTuru = {
  /** Yeni yapıların getirdiği ek gelir (çarpanlardan önce), kervan yolunun han bonusu dahil. */
  ek: number
  bakim: number
  /** Yapı başına bu turdaki gelir (gösterim için). */
  ayrinti: Partial<Record<ArsaId, number>>
}

/**
 * Bir turda yeni yapıların gelir ve bakımı. Mevcut mülklerin geliri motor tarafından hesaplanır;
 * buraya yalnızca etkileşim için hanın ve arazinin o turki ham geliri gelir.
 */
export function sehirTuru(y: Yapilar, olay: OlayId | null, hanGeliri: number, araziTaban: number): SehirTuru {
  const var_ = (id: YapiId) => yapiSayisi(y, id) > 0
  const kervan = var_('kervan') && olay !== 'savas'
  let ek = 0
  let bakim = 0
  const ayrinti: Partial<Record<ArsaId, number>> = {}
  for (const arsa of ARSA_SIRASI) {
    const yapi = y[arsa]
    if (!yapi) continue
    const t = YAPILAR[yapi]
    bakim += t.bakim
    let g = 0
    if (yapi === 'arasta') g = olay === 'yangin' ? 0 : t.gelir + (kervan ? 2 : 0)
    else if (yapi === 'bedesten') g = olay === 'savas' ? 0 : t.gelir
    else if (yapi === 'evler') g = olay === 'deprem' ? 0 : t.gelir * (var_('mektep') ? 1.5 : 1)
    else if (yapi === 'degirmen') g = olay === 'kuraklik' ? 0 : t.gelir
    else if (yapi === 'kumbet' || yapi === 'asevi' || yapi === 'medrese' || yapi === 'cami') g = t.gelir
    else if (yapi === 'cesme') g = olay === 'kuraklik' ? 0 : t.gelir
    ayrinti[arsa] = g
    ek += g
  }
  if (kervan) ek += hanGeliri * 0.25
  if (var_('kopru')) ek += (olay === 'kuraklik' ? 0 : araziTaban) * 0.2
  return { ek, bakim, ayrinti }
}
