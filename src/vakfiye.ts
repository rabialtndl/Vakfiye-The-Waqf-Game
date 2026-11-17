// Vakfiye: oyunun sonunda oyuncunun seçimlerinden kişiye özel, eski belge görünümlü kısa bir vakfiye metni.
// Saf TypeScript: aynı durum + aynı ad → aynı metin. Ekrana, zamana ve rastgeleliğe dokunmaz.
//
// Bölüm sırası TDV İslâm Ansiklopedisi "Vakfiye" maddesindeki genel düzene dayanır
// (https://islamansiklopedisi.org.tr/vakfiye): davet, vâkıfa dair bilgiler, mevkufun tarifi, vakıf şartları,
// mütevelli tarifi, tarih ve tescil, şühûdü'l-hâl. Belge parşömene kaydırmadan sığsın diye (2 Kasım) bu bölümler
// beşe birleştirildi; sıra korunur. Maddedeki "rücû ve murâfaa" ile "beddua" bölümleri bilerek konmadı.
// "Vakfın hayatı" bölümü maddede yoktur: oyunun kendi eklediği kayıttır ve belgede öyle işaretlenir.

import { hedefYili, OLAY_AD, type Durum, type KararKaydi, type Secim } from './motor/motor'
import { SABITLER as S, type AmacId } from './motor/sabitler'
import { YAPILAR, type ArsaId } from './motor/sehir'
import { levelBul } from './leveller'
import { ingilizce } from './dil'

export type VakfiyeBolumu = {
  id: 'davet' | 'vakif' | 'sartlar' | 'hayat' | 'tarih'
  baslik: string
  satirlar: string[]
  /** Maddede olmayan, oyunun eklediği bölüm. */
  oyunEki?: boolean
}

export type Vakfiye = {
  baslik: string
  /** Vâkıfın adı; boşsa "Bir hayır sahibi". */
  vakifAdi: string
  ayakta: boolean
  bolumler: VakfiyeBolumu[]
}

/** Tek tür seçimde en çok bu kadar karar tek cümlede adıyla yazılır. */
export const KARAR_SATIRI = 3

const buyuk = (s: string) => s.charAt(0).toLocaleUpperCase('tr') + s.slice(1)

/** Miladî yıldan yaklaşık hicrî yıl (ay yılı güneş yılından kısadır). Yalnız "yaklaşık" diye gösterilir. */
export const hicriYaklasik = (miladi: number): number => Math.round((miladi - 622) * 1.030684)

/** Türkçe bulunma eki: Bursa'da, Hatay'da, Konya'da (ünlü uyumu ve sert ünsüz benzeşmesi). */
function bulunma(ad: string): string {
  const unluler = [...ad.toLocaleLowerCase('tr')].filter((h) => 'aeıioöuü'.includes(h))
  const son = unluler[unluler.length - 1] ?? 'a'
  const e = 'eiöü'.includes(son) ? 'e' : 'a'
  const d = 'fstkçşhp'.includes(ad.slice(-1).toLocaleLowerCase('tr')) ? 't' : 'd'
  return `${ad}'${d}${e}`
}

/** Yüzdenin iyelik eki, sayının okunuşuna göre: %20'si, %15'i, %30'u, %40'ı, %0'ı. */
export function yuzdeEki(n: number): string {
  const birler: Record<number, string> = { 1: 'i', 2: 'si', 3: 'ü', 4: 'ü', 5: 'i', 6: 'sı', 7: 'si', 8: 'i', 9: 'u' }
  const onlar: Record<number, string> = { 0: 'ı', 10: 'u', 20: 'si', 30: 'u', 40: 'ı', 50: 'si', 60: 'ı', 70: 'i', 80: 'i', 90: 'ı', 100: 'ü' }
  const ek = n % 10 ? birler[n % 10] : onlar[n % 100 === 0 && n ? 100 : n % 100]
  return `%${n}'${ek}`
}

/** En çok 3 yapının adı, gerisi sayıyla. */
function yapiListesi(adlar: string[], en: boolean): string {
  const ilk = adlar.slice(0, 2).join(', ')
  const kalan = adlar.length - 2
  if (kalan <= 0) return ilk
  return en ? `${ilk} and ${kalan} more` : `${ilk} ve ${kalan} yapı daha`
}

const YONELME: Record<AmacId, string> = { asevi: 'aşevine', medrese: 'medreseye', cami: 'camiye', cesme: 'çeşmeye' }

const SECIM_TR: Record<Secim, string> = { fon: 'yedek fondan onarıldı', nakit: 'nakitle onarıldı', kis: 'hizmet kısıldı' }
const SECIM_EN: Record<Secim, string> = { fon: 'repaired from the reserve fund', nakit: 'repaired with cash', kis: 'service cut back' }

/**
 * Kararlar en çok 3 satır: tek tür seçim ve en çok 3 karar varsa tek cümle ("40. yıl deprem, 80. yıl yangın:
 * ikisinde de yedek fondan onarıldı."); yoksa her seçim türü bir satır, en çok 2 olay adıyla, gerisi sayıyla.
 */
function kararSatirlari(kararlar: KararKaydi[], en: boolean): string[] {
  if (!kararlar.length) return []
  const olay = (k: KararKaydi) => (en ? `year ${k.yil} ${OLAY_AD[k.olay].toLocaleLowerCase('en')}` : `${k.yil}. yıl ${OLAY_AD[k.olay].toLocaleLowerCase('tr')}`)
  const turler = [...new Set(kararlar.map((k) => k.secim))]
  if (turler.length === 1 && kararlar.length <= KARAR_SATIRI) {
    const liste = buyuk(kararlar.map(olay).join(', '))
    const secim = en ? SECIM_EN[turler[0]] : SECIM_TR[turler[0]]
    if (kararlar.length === 1) return [`${liste}: ${secim}.`]
    const hepsi = en ? (kararlar.length === 2 ? 'both times' : 'each time') : kararlar.length === 2 ? 'ikisinde de' : 'hepsinde'
    return [`${liste}: ${hepsi} ${secim}.`]
  }
  return turler.map((t) => {
    const bu = kararlar.filter((k) => k.secim === t)
    const kalan = bu.length - 2
    const liste = bu.slice(0, 2).map(olay).join(', ') + (kalan > 0 ? (en ? ` and ${kalan} more` : ` ve ${kalan} olay daha`) : '')
    return `${buyuk(en ? SECIM_EN[t] : SECIM_TR[t])}: ${liste}.`
  })
}

function yapilar(d: Durum): string[] {
  return (Object.keys(d.yapilar) as ArsaId[]).filter((k) => d.yapilar[k]).map((k) => YAPILAR[d.yapilar[k]!].ad)
}

/** Vakfiye metni (oyunun diline göre). */
export function vakfiyeOlustur(d: Durum, vakifAdi = ''): Vakfiye {
  return ingilizce() ? vakfiyeOlusturEn(d, vakifAdi) : vakfiyeOlusturTr(d, vakifAdi)
}

const adiTemizle = (ad: string) => ad.trim().replace(/\s+/g, ' ').slice(0, 24)

function vakfiyeOlusturTr(d: Durum, vakifAdi = ''): Vakfiye {
  const a = d.ayarlar
  const kimlik = adiTemizle(vakifAdi) || 'Bir hayır sahibi'
  const level = levelBul(a.levelNo)
  const amac = S.AMACLAR[a.amac].ad
  const amacKucuk = amac.toLocaleLowerCase('tr')
  const ayakta = d.sonuc === 'ayakta'
  const sehir = level.il ? buyuk(level.il) : ''
  const s = a.sermaye

  const vakif = [`${kimlik}${sehir ? `, ${bulunma(sehir)}` : ''} ${S.SERMAYE_TOPLAM} akçeyi vakfetti: hamama ${s.hamam}, hana ${s.han}, araziye ${s.arazi} akçe; ${s.nakit} akçe nakit.`]
  if (level.eserAd) vakif.push(`Örnek alınan eser: ${level.eserAd}.`)

  const hayat: string[] = []
  if (!d.olaySayisi) hayat.push(`${d.yil} yıl boyunca vakfa büyük bir olay uğramadı.`)
  hayat.push(...kararSatirlari(d.kararlar, false))
  if (d.sonKotuOlay === 'zimmet') hayat.push('Mütevelli bir kez sandıktan para aldı.')
  const yeni = yapilar(d)
  if (yeni.length) hayat.push(`Eklenen yapılar: ${yapiListesi(yeni, false)}.`)
  if (ayakta) hayat.push(`${hedefYili(a)} yıl sonunda vakıf ayakta; ${amacKucuk} hiç kapanmadı.`)
  else hayat.push(`${d.yil}. yılda sandık tükendi ve vakıf çöktü${d.sonKotuOlay ? `; son darbe: ${OLAY_AD[d.sonKotuOlay].toLocaleLowerCase('tr')}` : ''}.`)

  const sahitler = 'şahitler: mütevelli, çarşı esnafı ve mahalle halkı.'
  const tarih = level.takvim
    ? `Miladî ${level.takvim} (hicrî ~${hicriYaklasik(level.takvim)}), ${sehir} kadısı huzurunda; ${sahitler}`
    : `Vakfın kuruluşunda, kadı huzurunda; ${sahitler}`

  return {
    baslik: `${amac} Vakfı Vakfiyesi`,
    vakifAdi: kimlik,
    ayakta,
    bolumler: [
      { id: 'davet', baslik: 'Davet', satirlar: ['Hamd, âlemlerin Rabbine. Aşağıdaki hayır, Allah rızası için vakfedilmiştir.'] },
      { id: 'vakif', baslik: 'Vâkıf ve mevkuf', satirlar: vakif },
      {
        id: 'sartlar',
        baslik: 'Şart ve mütevelli',
        satirlar: [`Gelirin ${yuzdeEki(a.yedekFonOrani)} yedek fona, kalanı bakımdan sonra ${YONELME[a.amac]} gider. Mütevelli: ${S.MUTEVELLI[a.mutevelli].ad.toLocaleLowerCase('tr')}.`],
      },
      { id: 'hayat', baslik: 'Vakfın hayatı', satirlar: hayat, oyunEki: true },
      { id: 'tarih', baslik: 'Tarih ve şahitler', satirlar: [tarih] },
    ],
  }
}

function vakfiyeOlusturEn(d: Durum, vakifAdi = ''): Vakfiye {
  const a = d.ayarlar
  const kimlik = adiTemizle(vakifAdi) || 'A benefactor'
  const level = levelBul(a.levelNo)
  const amac = S.AMACLAR[a.amac].ad
  const amacKucuk = amac.toLocaleLowerCase('en')
  const ayakta = d.sonuc === 'ayakta'
  const sehir = level.il ? buyuk(level.il) : ''
  const s = a.sermaye
  const mutevelli = S.MUTEVELLI[a.mutevelli].ad.toLocaleLowerCase('en')

  const vakif = [`${kimlik} endowed ${S.SERMAYE_TOPLAM} akçe${sehir ? ` in ${sehir}` : ''}: bathhouse ${s.hamam}, inn ${s.han}, farmland ${s.arazi}; cash ${s.nakit}.`]
  if (level.eserAd) vakif.push(`Model monument: ${level.eserAd}.`)

  const hayat: string[] = []
  if (!d.olaySayisi) hayat.push(`For ${d.yil} years no great event befell the foundation.`)
  hayat.push(...kararSatirlari(d.kararlar, true))
  if (d.sonKotuOlay === 'zimmet') hayat.push('Once, the trustee took money from the chest.')
  const yeni = yapilar(d)
  if (yeni.length) hayat.push(`Built: ${yapiListesi(yeni, true)}.`)
  if (ayakta) hayat.push(`After ${hedefYili(a)} years the foundation stands; the ${amacKucuk} never closed.`)
  else hayat.push(`In year ${d.yil} the chest ran dry and the foundation collapsed${d.sonKotuOlay ? `; final blow: ${OLAY_AD[d.sonKotuOlay].toLocaleLowerCase('en')}` : ''}.`)

  const sahitler = 'witnesses: the trustee, the bazaar tradesmen and the neighbourhood.'
  const tarih = level.takvim
    ? `${level.takvim} AD (~${hicriYaklasik(level.takvim)} AH), before the judge (kadı) of ${sehir}; ${sahitler}`
    : `At the founding, before the judge (kadı); ${sahitler}`

  return {
    baslik: `Deed of the ${amac} Foundation`,
    vakifAdi: kimlik,
    ayakta,
    bolumler: [
      { id: 'davet', baslik: 'Invocation', satirlar: ['Praise be to the Lord of the worlds. This good work is endowed for the sake of God.'] },
      { id: 'vakif', baslik: 'Founder and endowment', satirlar: vakif },
      {
        id: 'sartlar',
        baslik: 'Terms and trustee',
        satirlar: [`${a.yedekFonOrani}% of income goes to the reserve fund; after upkeep, the rest goes to the ${amacKucuk}. Trustee: ${mutevelli}.`],
      },
      { id: 'hayat', baslik: 'Life of the foundation', satirlar: hayat, oyunEki: true },
      { id: 'tarih', baslik: 'Date and witnesses', satirlar: [tarih] },
    ],
  }
}

/** Düz metin: kopyalama ve erişilebilirlik için. Vâkıfın adı belgenin içinde geçer. */
export function vakfiyeMetni(v: Vakfiye): string {
  const dil = ingilizce() ? 'en' : 'tr'
  return [v.baslik, ...v.bolumler.flatMap((b) => ['', b.baslik.toLocaleUpperCase(dil), ...b.satirlar])].join('\n')
}
