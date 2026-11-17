import { useEffect, useMemo, useState } from 'react'
import { SABITLER as S, type AmacId } from '../motor/sabitler'
import { YAPILAR } from '../motor/sehir'
import { ortam } from '../ortam'
import { paraYoluRakamlari, type ParaYoluRakamlari } from '../paraYolu'
import { iki, L } from '../dil'

// "Paranın yolu": Nasıl oynanır'daki "resimli gör" bağlantısıyla açılan sayfa. Bir turda (10 yıl) akçenin izlediği yolu
// bina çizimleriyle gösterir; binaya ya da üstteki adımlara dokununca bilgi kartı açılır.
// Rakamlar motordan gelir (paraYolu.ts). Değerler oyun dengesi içindir (şartname 5.1.3).

type DugumId = 'hamam' | 'han' | 'arazi' | 'bakim' | 'sandik' | 'nakit' | 'kumbara' | 'hizmet' | 'yapi' | 'kotu' | 'kasa'
type Renk = 'altin' | 'turkuaz' | 'tugla'
type Secim = { id: DugumId } | { adim: AdimId } | null
type AdimId = '1' | '2' | '3' | '4' | '5' | '6'

/** Sol sütunun başlığı. Öneri: "GELİR GETİRENLER (AKAR)" (karar bekleniyor). */
const AKAR_BASLIGI_TR = 'GELİR GETİRENLER (AKAR)'
const akarBasligi = () => L(AKAR_BASLIGI_TR, 'INCOME (AKAR)')

const R = { murekkep: '#12151e', altin: '#f2b33d', altinK: '#e3a52a', turkuaz: '#13807d', tugla: '#b8432f', ahsap: '#c98a4b', ahsapK: '#7a4a22', kahve: '#6b4a2b', cimen: '#b9d48f' }
const RENK: Record<Renk, string> = { altin: R.altinK, turkuaz: R.turkuaz, tugla: R.tugla }

const HAYRAT_RESMI: Record<AmacId, string> = { asevi: 'asevi', medrese: 'medrese', cami: 'cami', cesme: 'cesme' }
const HAYRAT_ISI: Record<AmacId, string> = iki<Record<AmacId, string>>({ asevi: 'yoksullara ve yolculara yemek', medrese: 'öğrencilere ders ve yatak', cami: 'imam, müezzin ve temizlik', cesme: 'mahalleye temiz su' }, { asevi: 'food for the poor and for travellers', medrese: 'lessons and beds for students', cami: 'the imam, the muezzin and cleaning', cesme: 'clean water for the neighbourhood' })
const GERCEK_TUR: Record<AmacId, string> = iki<Record<AmacId, string>>({ asevi: 'aşevi ve külliye', medrese: 'medrese', cami: 'cami', cesme: 'çeşme' }, { asevi: 'soup kitchens and külliyes', medrese: 'madrasas', cami: 'mosques', cesme: 'fountains' })

const resim = (ad: string) => `${ortam.varlikKoku}binalar/${ad}.webp`
const tam = (n: number) => String(Math.round(n))
const ondalik = (n: number) => L(String(Math.round(n * 100) / 100).replace('.', ','), String(Math.round(n * 100) / 100))

type Dugum = { x: number; y: number; t: 'resim' | 'rozet' | 'arsa'; ad: string; renk?: string; img?: string }
const DUGUMLER: Record<DugumId, Dugum> = {
  hamam: iki({ x: 110, y: 95, t: 'resim', ad: 'Hamam', img: 'hamam' }, { ad: 'Bathhouse' }),
  han: iki({ x: 110, y: 280, t: 'resim', ad: 'Han', img: 'han' }, { ad: 'Inn' }),
  arazi: iki({ x: 110, y: 465, t: 'resim', ad: 'Arazi', img: 'arazi' }, { ad: 'Farmland' }),
  bakim: iki({ x: 395, y: 80, t: 'rozet', ad: 'Bakım', renk: R.tugla }, { ad: 'Upkeep' }),
  sandik: iki({ x: 395, y: 280, t: 'resim', ad: 'Vakıf sandığı', img: 'sandik' }, { ad: 'Foundation chest' }),
  nakit: iki({ x: 395, y: 470, t: 'rozet', ad: 'Nakit', renk: R.altin }, { ad: 'Cash' }),
  kumbara: iki({ x: 650, y: 80, t: 'rozet', ad: 'Yedek fon', renk: R.turkuaz }, { ad: 'Reserve fund' }),
  hizmet: iki({ x: 650, y: 280, t: 'resim', ad: 'Hizmet' }, { ad: 'Service' }),
  yapi: iki({ x: 650, y: 470, t: 'arsa', ad: 'Yeni yapı' }, { ad: 'New building' }),
  kotu: iki({ x: 865, y: 80, t: 'resim', ad: 'Kötü gün', img: 'hamam-hasarli' }, { ad: 'Bad day' }),
  kasa: iki({ x: 865, y: 280, t: 'rozet', ad: 'Yapı parası', renk: R.altinK }, { ad: 'Building money' }),
}

type YolAnahtari = 'hamam' | 'han' | 'arazi' | 'bakim' | 'fon' | 'kalan' | 'nakit' | 'artan' | 'insa' | 'kira' | 'yetmez' | 'onarim'
type Yol = { id: string; a: DugumId; b: DugumId; d: string; r: Renk; k: YolAnahtari; lx: number; ly: number; an?: 'start' | 'end'; kalin?: boolean; ince?: boolean; kesik?: boolean }
const YOLLAR: Yol[] = [
  { id: 'y1', a: 'hamam', b: 'sandik', d: 'M178 100 C262 100 276 242 326 262', r: 'altin', k: 'hamam', lx: 262, ly: 160 },
  { id: 'y2', a: 'han', b: 'sandik', d: 'M178 280 L322 280', r: 'altin', k: 'han', lx: 250, ly: 268 },
  { id: 'y3', a: 'arazi', b: 'sandik', d: 'M178 460 C262 460 276 318 326 298', r: 'altin', k: 'arazi', lx: 262, ly: 410 },
  { id: 'y4', a: 'sandik', b: 'bakim', d: 'M395 210 L395 148', r: 'tugla', k: 'bakim', lx: 408, ly: 186, an: 'start' },
  { id: 'y5', a: 'sandik', b: 'kumbara', d: 'M458 226 C520 168 566 108 606 90', r: 'turkuaz', k: 'fon', lx: 548, ly: 150, an: 'start' },
  { id: 'y6', a: 'sandik', b: 'hizmet', d: 'M466 280 L578 280', r: 'altin', k: 'kalan', lx: 522, ly: 268, kalin: true },
  { id: 'y7', a: 'nakit', b: 'sandik', d: 'M395 430 L395 352', r: 'altin', k: 'nakit', lx: 408, ly: 398, an: 'start', ince: true },
  { id: 'y8', a: 'hizmet', b: 'kasa', d: 'M722 280 L822 280', r: 'altin', k: 'artan', lx: 772, ly: 268 },
  { id: 'y9', a: 'kasa', b: 'yapi', d: 'M865 344 C865 420 792 470 724 470', r: 'altin', k: 'insa', lx: 848, ly: 432, an: 'end' },
  { id: 'y10', a: 'yapi', b: 'sandik', d: 'M584 462 C520 452 478 396 458 352', r: 'altin', k: 'kira', lx: 556, ly: 440, an: 'end' },
  { id: 'y11', a: 'kumbara', b: 'hizmet', d: 'M650 140 L650 204', r: 'turkuaz', k: 'yetmez', lx: 662, ly: 177, an: 'start', kesik: true },
  { id: 'y12', a: 'kumbara', b: 'kotu', d: 'M692 74 L796 74', r: 'tugla', k: 'onarim', lx: 744, ly: 62, kesik: true },
  { id: 'y13', a: 'nakit', b: 'kotu', d: 'M432 492 C560 596 948 590 948 330 C948 230 940 168 918 134', r: 'tugla', k: 'onarim', lx: 940, ly: 420, an: 'end', kesik: true },
]

/** Oyundaki "Nasıl işler" sırası. */
const ADIMLAR: Record<AdimId, { ad: string; yollar: string[]; dugumler: DugumId[] }> = {
  '1': iki({ ad: 'Kazanç', yollar: ['y1', 'y2', 'y3', 'y7'], dugumler: ['hamam', 'han', 'arazi', 'sandik', 'nakit'] }, { ad: 'Earnings' }),
  '2': iki({ ad: 'Fon', yollar: ['y5'], dugumler: ['sandik', 'kumbara'] }, { ad: 'Fund' }),
  '3': iki({ ad: 'Bakım', yollar: ['y4'], dugumler: ['sandik', 'bakim'] }, { ad: 'Upkeep' }),
  '4': iki({ ad: 'Hizmet', yollar: ['y6', 'y11'], dugumler: ['sandik', 'hizmet', 'kumbara'] }, { ad: 'Service' }),
  '5': iki({ ad: 'Büyüme', yollar: ['y8', 'y9', 'y10'], dugumler: ['hizmet', 'kasa', 'yapi', 'sandik'] }, { ad: 'Growth' }),
  '6': iki({ ad: 'Kötü gün', yollar: ['y12', 'y13'], dugumler: ['kumbara', 'nakit', 'kotu'] }, { ad: 'Bad day' }),
}
const ADIM_IDLERI = Object.keys(ADIMLAR) as AdimId[]

function yolYazisi(k: YolAnahtari, r: ParaYoluRakamlari, rakam: boolean): string {
  if (rakam) {
    const m: Record<YolAnahtari, string> = { hamam: `+${tam(r.hamam)}`, han: `+${tam(r.han)}`, arazi: `+${tam(r.arazi)}`, bakim: `−${tam(r.bakim)}`, fon: `+${tam(r.fon)}`, kalan: tam(r.kalan), nakit: `+${L(r.nakit.toFixed(1).replace('.', ','), r.nakit.toFixed(1))}`, artan: `+${tam(r.artan)}`, insa: L('yapı kur', 'build'), kira: L('+kira', '+rent'), yetmez: L('yetmezse', 'if short'), onarim: L('onarım', 'repair') }
    return m[k]
  }
  const m: Partial<Record<YolAnahtari, string>> = L<Partial<Record<YolAnahtari, string>>>({ kalan: 'kalan', bakim: 'bakım', fon: 'pay', artan: 'artan', insa: 'yapı kur', kira: 'kira', nakit: 'katkı', yetmez: 'yetmezse', onarim: 'onarım' }, { kalan: 'the rest', bakim: 'upkeep', fon: 'share', artan: 'surplus', insa: 'build', kira: 'rent', nakit: 'bit extra', yetmez: 'if short', onarim: 'repair' })
  return m[k] ?? ''
}

function adimMetniEn(n: AdimId, r: ParaYoluRakamlari): [string, string] {
  const hy = S.AMACLAR[r.amac].ad.toLocaleLowerCase('en')
  const yetiyor = r.kalan >= r.gereken
  return {
    '1': ['The properties earn money', `The bathhouse brings ${tam(r.hamam)}, the inn ${tam(r.han)} and the farmland ${tam(r.arazi)} akçe. Cash adds a little too. It all goes into the foundation chest: ${tam(r.gelir)} akçe.`],
    '2': ['A share is saved for bad days', `${r.fonOrani}% of the income (${tam(r.fon)} akçe) goes to the reserve fund. This money is not spent; it is kept for bad days.`],
    '3': ['The buildings’ upkeep is paid', `Upkeep of the bathhouse, the inn and the service building costs ${tam(r.bakim)} akçe. A building that is not kept up does not survive.`],
    '4': ['The rest goes to the service', `${tam(r.kalan)} akçe is left in the chest. The ${hy} needs ${tam(r.gereken)} akçe. ${yetiyor ? 'It is enough; the service is open. If it were not, the shortfall would come from the reserve fund.' : 'It is not enough: the shortfall comes from the reserve fund.'}`],
    '5': ['The surplus grows the foundation', `The ${tam(r.artan)} akçe left after the service collects in building money. When the fund fills up you build something new in the city. Its rent goes into the chest too, and the cycle grows.`],
    '6': ['When a bad day comes', `In an earthquake or a fire the game stops. You repair from the reserve fund or with cash. If the chest is empty ${S.COKUS_ART_ARDA_BOS} rounds in a row, the foundation collapses.`],
  }[n] as [string, string]
}

function adimMetni(n: AdimId, r: ParaYoluRakamlari): [string, string] {
  const hy = S.AMACLAR[r.amac].ad
  const yetiyor = r.kalan >= r.gereken
  if (L(false, true)) return adimMetniEn(n, r)
  return {
    '1': ['Mülkler para kazandırır', `Hamam ${tam(r.hamam)}, han ${tam(r.han)}, arazi ${tam(r.arazi)} akçe getirir. Nakit de küçük bir katkı yapar. Hepsi vakıf sandığına girer: ${tam(r.gelir)} akçe.`],
    '2': ['Bir pay kötü güne ayrılır', `Gelirin %${r.fonOrani}'i (${tam(r.fon)} akçe) yedek fona gider. Bu para harcanmaz, kötü güne saklanır.`],
    '3': ['Binaların bakımı ödenir', `Hamamın, hanın ve hizmet binasının bakımı ${tam(r.bakim)} akçe tutar. Bakımı yapılmayan bina yaşamaz.`],
    '4': ['Kalan para hizmete gider', `Sandıkta ${tam(r.kalan)} akçe kaldı. ${hy} ${tam(r.gereken)} akçe ister. ${yetiyor ? 'Yetiyor, hizmet açık. Yetmeseydi açık yedek fondan kapanırdı.' : 'Yetmiyor: açık yedek fondan kapanır.'}`],
    '5': ['Artan para vakfı büyütür', `Hizmetten artan ${tam(r.artan)} akçe yapı parasında birikir. Yapı parası yetince şehre yeni yapı kurarsın. Onun kirası da sandığa girer, döngü büyür.`],
    '6': ['Kötü gün gelince', `Deprem ya da yangında oyun durur. Onarımı yedek fondan ya da nakitten yaparsın. Sandık üst üste ${S.COKUS_ART_ARDA_BOS} tur boş kalırsa vakıf çöker.`],
  }[n] as [string, string]
}

type Bilgi = { cip: [string, string][]; m: string; p: string; k: string; hayrat?: boolean }
function bilgi(id: DugumId, r: ParaYoluRakamlari, rakam: boolean): Bilgi {
  const m = S.MULKLER
  const v = (s: string) => (rakam ? s : '')
  const y = YAPILAR
  const bilgiler: Record<DugumId, Bilgi> = {
    hamam: { cip: [['Akar', 'altin'], ['Depremde yıkılır', 'kirmizi']], m: `${r.birim.hamam} birim${rakam ? ` · +${tam(r.hamam)} akçe` : ''}`, p: 'Halk para verip yıkanır. En çok kazandıran bina, ama depremde ilk yıkılan da o. Bakımı da pahalı.', k: `1 birim: 10 yılda ${ondalik(m.hamam.gelir)} akçe kazandırır, ${ondalik(m.hamam.bakim)} bakım ister.` },
    han: { cip: [['Akar', 'altin'], ['Yangın', 'kirmizi'], ['Savaş', 'kirmizi']], m: `${r.birim.han} birim${rakam ? ` · +${tam(r.han)} akçe` : ''}`, p: 'Kervanlar konaklar, çarşıda dükkân kiralanır. Yangında yanar, savaşta yol kapanınca o tur gelir getirmez. Kervan mevsiminde fazla kazandırır.', k: `1 birim: 10 yılda ${ondalik(m.han.gelir)} akçe kazandırır, ${ondalik(m.han.bakim)} bakım ister.` },
    arazi: { cip: [['Akar', 'altin'], ['Hiç yıkılmaz', 'turkuaz']], m: `${r.birim.arazi} birim${rakam ? ` · +${tam(r.arazi)} akçe` : ''}`, p: 'Vakfa bağlı tarlalar. Az kazandırır ama hiç yıkılmaz. Kuraklıkta o tur ürün vermez, bereketli yılda iki kat verir.', k: `1 birim: 10 yılda ${ondalik(m.arazi.gelir)} akçe kazandırır, bakım istemez.` },
    sandik: { cip: [['Para burada toplanır', 'krem']], m: v(`${tam(r.gelir)} akçe`), p: `Gelir önce buraya gelir. Şartın kadarı yedek fona ayrılır, bakım ödenir, kalanı hizmete gider.`, k: 'Gelen: hamam, han, arazi, nakit, yeni yapıların kirası.' },
    bakim: { cip: [['Gider', 'kirmizi']], m: v(`−${tam(r.bakim)} akçe`), p: 'Binaların ayakta kalması için her tur ödenen para. Bu para vakıftan çıkar, geri gelmez. Çok hamamın varsa bakım da çok olur.', k: `Hamam birim başına ${ondalik(m.hamam.bakim)} · han ${ondalik(m.han.bakim)} · hizmet binası giderinin %${Math.round(S.HAYRAT_BAKIM_ORANI * 100)}'i.` },
    kumbara: { cip: [['Birikir', 'turkuaz'], ['Zimmet riski', 'kirmizi']], m: v(`+${tam(r.fon)} akçe`), p: 'Kötü günlerin kumbarası. Gelirin şartta yazdığın payı her tur önce buraya ayrılır. Hizmetin parası yetmezse ya da bina yıkılırsa buradan harcarsın.', k: `Pay %${S.YEDEK_FON_MIN} ile %${S.YEDEK_FON_MAX} arası. Becerikli mütevelli bazen buradan çalar, enflasyonda biraz erir.` },
    hizmet: { cip: [['Hayrat', 'yesil'], [`${S.COKUS_ART_ARDA_BOS} tur boş: çöküş`, 'kirmizi']], m: `her tur ${tam(r.gereken)} akçe`, p: `Vakfın hizmet binası: ${HAYRAT_ISI[r.amac]}. Sandık her tur bu hizmetin giderini ödemek zorunda. Yetmezse açık yedek fondan kapanır, o da yetmezse sandık boş kalır.`, k: 'Amacını kurulumda seçersin. Dene:', hayrat: true },
    nakit: { cip: [['Zor gün parası', 'altin'], ['Enflasyonda erir', 'kirmizi']], m: `${r.birim.nakit} birim`, p: 'Kurulumda ayırdığın para. Neredeyse hiç kazandırmaz. Deprem ya da yangında onarımı nakitle de yapabilirsin.', k: `Her tur birim başına ${ondalik(S.NAKIT_KATKI)} akçe katkı.` },
    kotu: { cip: [['Karar anı', 'kirmizi']], m: 'deprem · yangın', p: 'Kötü gün gelince oyun durur ve sana sorar. Fonla onar: her şey eski hâline döner. Nakitle onar: nakdin yettiği kadar. Hizmeti kıs: para harcanmaz, binalar yavaş geri gelir ama bir kısmı kaybolur.', k: 'Kuraklık, savaş ve enflasyon kendiliğinden olur, karar sormaz.' },
    kasa: { cip: [['Büyüme', 'altin']], m: v(`+${tam(r.artan)} akçe`), p: 'Hizmet ödendikten sonra artan para burada birikir. Yalnızca şehre yeni yapı kurmaya harcanır.', k: 'Artan para başka yere gitmez: ya yapı olur ya kasada bekler.' },
    yapi: { cip: [['Yeni akar', 'altin'], ['+kira', 'turkuaz']], m: 'boş arsa', p: 'Yapı parası yetince boş arsaya yapı kurarsın. Kirası her tur sandığa girer, vakıf büyür.', k: `Örnekler: ${[y.evler, y.arasta, y.degirmen, y.bedesten].map((x) => `${x.ad} ${x.maliyet}`).join(' · ')} akçe.` },
  }
  if (!L(false, true)) return bilgiler[id]
  const en: Record<DugumId, Bilgi> = {
    hamam: { cip: [['Akar', 'altin'], ['Collapses in earthquakes', 'kirmizi']], m: `${r.birim.hamam} units${rakam ? ` · +${tam(r.hamam)} akçe` : ''}`, p: 'People pay to bathe. The building that earns the most, but also the first to collapse in an earthquake. Its upkeep is expensive too.', k: `1 unit: earns ${ondalik(m.hamam.gelir)} akçe in 10 years, needs ${ondalik(m.hamam.bakim)} upkeep.` },
    han: { cip: [['Akar', 'altin'], ['Fire', 'kirmizi'], ['War', 'kirmizi']], m: `${r.birim.han} units${rakam ? ` · +${tam(r.han)} akçe` : ''}`, p: 'Caravans stay the night, and shops in the bazaar are rented out. It burns in a fire, and in a war, when the road closes, it earns nothing that round. It earns more in caravan season.', k: `1 unit: earns ${ondalik(m.han.gelir)} akçe in 10 years, needs ${ondalik(m.han.bakim)} upkeep.` },
    arazi: { cip: [['Akar', 'altin'], ['Never collapses', 'turkuaz']], m: `${r.birim.arazi} units${rakam ? ` · +${tam(r.arazi)} akçe` : ''}`, p: 'Fields belonging to the foundation. They earn little but never collapse. In a drought they yield nothing that round; in a bountiful year, twice as much.', k: `1 unit: earns ${ondalik(m.arazi.gelir)} akçe in 10 years, needs no upkeep.` },
    sandik: { cip: [['Money collects here', 'krem']], m: v(`${tam(r.gelir)} akçe`), p: `Income comes here first. The share you set goes to the reserve fund, upkeep is paid and the rest goes to the service.`, k: 'Coming in: bathhouse, inn, farmland, cash and the rent of new buildings.' },
    bakim: { cip: [['Cost', 'kirmizi']], m: v(`−${tam(r.bakim)} akçe`), p: 'Money paid every round to keep the buildings standing. It leaves the foundation and does not come back. Lots of bathhouses mean lots of upkeep.', k: `Bathhouse ${ondalik(m.hamam.bakim)} per unit · inn ${ondalik(m.han.bakim)} · ${Math.round(S.HAYRAT_BAKIM_ORANI * 100)}% of the service building’s cost.` },
    kumbara: { cip: [['Saves up', 'turkuaz'], ['Embezzlement risk', 'kirmizi']], m: v(`+${tam(r.fon)} akçe`), p: 'The piggy bank for bad days. Every round, the share of income you wrote in your terms is set aside here first. If the service’s money falls short or a building collapses, you spend from here.', k: `The share is between ${S.YEDEK_FON_MIN}% and ${S.YEDEK_FON_MAX}%. A skilled trustee sometimes steals from it, and inflation melts it a little.` },
    hizmet: { cip: [['Hayrat', 'yesil'], [`${S.COKUS_ART_ARDA_BOS} empty rounds: collapse`, 'kirmizi']], m: `${tam(r.gereken)} akçe every round`, p: `The foundation’s service building: ${HAYRAT_ISI[r.amac]}. Every round the chest must pay for this service. If it falls short, the gap comes from the reserve fund; if that is not enough either, the chest is empty.`, k: 'You choose its purpose at setup. Try:', hayrat: true },
    nakit: { cip: [['Money for hard days', 'altin'], ['Melts in inflation', 'kirmizi']], m: `${r.birim.nakit} units`, p: 'The money you set aside at setup. It earns almost nothing. In an earthquake or a fire you can also repair with cash.', k: `Adds ${ondalik(S.NAKIT_KATKI)} akçe per unit every round.` },
    kotu: { cip: [['Decision time', 'kirmizi']], m: 'earthquake · fire', p: 'When a bad day comes, the game stops and asks you. Repair with the fund: everything goes back to how it was. Repair with cash: as much as your cash covers. Cut back the service: no money is spent, the buildings slowly come back but part is lost.', k: 'Drought, war and inflation just happen, with no decision.' },
    kasa: { cip: [['Growth', 'altin']], m: v(`+${tam(r.artan)} akçe`), p: 'Money left over after the service is paid collects here. It is spent only on new buildings in the city.', k: 'The surplus goes nowhere else: it either becomes a building or waits in the fund.' },
    yapi: { cip: [['New akar', 'altin'], ['+rent', 'turkuaz']], m: 'empty plot', p: 'When the fund fills up, you build on an empty plot. Its rent goes into the chest every round, and the foundation grows.', k: `Examples: ${[y.evler, y.arasta, y.degirmen, y.bedesten].map((x) => `${x.ad} ${x.maliyet}`).join(' · ')} akçe.` },
  }
  return en[id]
}

function gercekMetni(id: DugumId, amac: AmacId): string {
  if (id === 'hamam') return L('Oyunda envanterdeki gerçek hamamları bulacaksın.', 'In the game you will find real bathhouses from the inventory.')
  if (id === 'han') return L('Oyunda envanterdeki gerçek hanları ve çarşıları bulacaksın.', 'In the game you will find real inns and bazaars from the inventory.')
  if (id === 'hizmet') return L(`Oyunda envanterdeki gerçek ${GERCEK_TUR[amac]} örneklerini bulacaksın.`, `In the game you will find real ${GERCEK_TUR[amac]} from the inventory.`)
  return ''
}

function GercekSatir({ metin }: { metin: string }) {
  return (
    <p className="py-gercek">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" fill="none" stroke="currentColor" strokeWidth="2.5" /><circle cx="12" cy="10" r="2.6" fill="currentColor" /></svg>
      {metin}
    </p>
  )
}

/** Rozet simgeleri: oyunun Ikon çizgisine yakın, beyaz çizgi. */
function Simge({ id }: { id: DugumId }) {
  const s = { stroke: '#fff', fill: 'none', strokeWidth: 3, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  return (
    <g transform="scale(1.25)">
      {id === 'bakim' && <path {...s} d="M-12 13 2 -1M6-14a7 7 0 0 0-4 10l9 9 4-4-9-9a7 7 0 0 0 0-6z" />}
      {id === 'kumbara' && <><path {...s} d="M-12 12V0a12 11 0 0 1 24 0v12zM-5-5h10" /><circle cx="0" cy="5" r="3.5" fill="#fff" /></>}
      {id === 'nakit' && <><ellipse {...s} cx="-3" cy="7" rx="10" ry="4" /><path {...s} d="M-13 7v-6M7 7v-6" /><ellipse {...s} cx="-3" cy="1" rx="10" ry="4" /><ellipse {...s} cx="5" cy="-7" rx="9" ry="4" /></>}
      {id === 'kasa' && <path {...s} d="M-13 12h26M-13 4h26M-13-4h26M-5 12V4M5 4V-4M-5-4v-8h18v8" />}
    </g>
  )
}

function ArsaSimgesi() {
  return (
    <>
      <path d="M-36 0L0-20L36 0L0 20Z" fill={R.cimen} stroke={R.ahsapK} strokeWidth="2.5" strokeDasharray="5 4" />
      <circle r="13" fill={R.altin} stroke={R.murekkep} strokeWidth="3" />
      <path d="M-6 0h12M0-6v12" stroke={R.murekkep} strokeWidth="3" strokeLinecap="round" />
    </>
  )
}

function dugumResmi(id: DugumId, amac: AmacId) {
  return resim(id === 'hizmet' ? HAYRAT_RESMI[amac] : DUGUMLER[id].img!)
}

function SimgeKutu({ id, amac }: { id: DugumId; amac: AmacId }) {
  const n = DUGUMLER[id]
  if (n.t === 'resim') return <img alt="" src={dugumResmi(id, amac)} />
  return (
    <svg viewBox="-40 -40 80 80" aria-hidden="true">
      {n.t === 'rozet' ? <><circle r="34" fill={n.renk} stroke={R.murekkep} strokeWidth="3" /><Simge id={id} /></> : <ArsaSimgesi />}
    </svg>
  )
}

function EtiketKutusu({ x, y, yazi }: { x: number; y: number; yazi: string }) {
  const w = Math.max(70, yazi.length * 9.2 + 26)
  return (
    <>
      <rect x={x - w / 2} y={y - 14} width={w} height={28} rx={10} fill={R.ahsap} stroke={R.ahsapK} strokeWidth={3} />
      <text x={x} y={y + 6} textAnchor="middle" className="py-kutu-yazi" fill="#fff" stroke={R.ahsapK} strokeWidth={2.5} style={{ paintOrder: 'stroke' }}>{yazi}</text>
    </>
  )
}

export function ParaninYolu({ onDevam, onKapat, gomulu = false }: { onDevam?: () => void; onKapat?: () => void; gomulu?: boolean }) {
  const [amac, setAmac] = useState<AmacId>(S.VARSAYILAN.amac)
  const [rakam, setRakam] = useState(true)
  const [sec, setSec] = useState<Secim>(null)
  const r = useMemo(() => paraYoluRakamlari(amac), [amac])

  useEffect(() => {
    const tus = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (sec) setSec(null)
      else onKapat?.()
    }
    window.addEventListener('keydown', tus)
    return () => window.removeEventListener('keydown', tus)
  }, [sec, onKapat])

  const ilgili = (() => {
    if (!sec) return null
    if ('adim' in sec) return ADIMLAR[sec.adim]
    const ys = YOLLAR.filter((y) => y.a === sec.id || y.b === sec.id)
    return { yollar: ys.map((y) => y.id), dugumler: [sec.id, ...ys.flatMap((y) => [y.a, y.b])] }
  })()
  const seciliDugum = sec && 'id' in sec ? sec.id : null
  const seciliAdim = sec && 'adim' in sec ? sec.adim : null
  const dugumSec = (id: DugumId) => setSec(seciliDugum === id ? null : { id })
  const hizmetAdi = S.AMACLAR[amac].ad

  const altYazi = (id: DugumId) => (!rakam ? '' : id === 'sandik' ? L(`${tam(r.gelir)} akçe`, `${tam(r.gelir)} akçe`) : id === 'hizmet' ? L(`ister ${tam(r.gereken)}`, `needs ${tam(r.gereken)}`) : '')

  const icerik = (
        <div className={gomulu ? 'py-icerik' : 'kaydirilir py-icerik'}>
          <p className="py-giris">{L('Her 10 yılda akçe aynı yolu izler. Bir binaya dokun: ne işe yaradığını ve parasının nereye gittiğini gör.', 'Every 10 years the akçe follows the same path. Tap a building to see what it does and where its money goes.')}</p>

          <div className="py-ust">
            <div className="parcali py-adimlar" role="group" aria-label={L('Bir turun adımları', 'The steps of a round')}>
              {ADIM_IDLERI.map((k) => (
                <button key={k} aria-pressed={seciliAdim === k} onClick={() => setSec(seciliAdim === k ? null : { adim: k })}>
                  <b>{k}</b>
                  {ADIMLAR[k].ad}
                </button>
              ))}
            </div>
            <label className="py-rakam">
              {L('Örnek rakamlar', 'Sample numbers')}
              <button className="py-anahtar" role="switch" aria-checked={rakam} onClick={() => setRakam(!rakam)}><span /></button>
            </label>
          </div>

          <div className="py-sema">
            <svg viewBox="0 0 980 582" role="group" aria-label={L('Vakfın para şeması', 'The foundation’s money diagram')}>
              <defs>
                {(Object.keys(RENK) as Renk[]).map((k) => (
                  <marker key={k} id={`py-u-${k}`} viewBox="0 0 10 10" refX="6" refY="5" markerWidth="20" markerHeight="20" markerUnits="userSpaceOnUse" orient="auto">
                    <path d="M0 0L10 5L0 10z" fill={RENK[k]} stroke={R.murekkep} strokeWidth="1" />
                  </marker>
                ))}
              </defs>
              <text x="110" y="22" textAnchor="middle" className="py-etiket" fill={R.kahve} letterSpacing="1.5" fontSize="12">{akarBasligi()}</text>

              {YOLLAR.map((y) => {
                const on = !ilgili || ilgili.yollar.includes(y.id)
                const renk = RENK[y.r]
                const g = y.kalin ? 13 : y.ince ? 6 : 9
                const yazi = yolYazisi(y.k, r, rakam)
                return (
                  <g key={y.id} className={on ? '' : 'py-soluk'}>
                    <path className="py-yol" d={y.d} stroke={R.murekkep} strokeWidth={g + 5} strokeDasharray={y.kesik ? '7 7' : undefined} opacity=".85" />
                    <path id={`py-${y.id}`} className={`py-yol${y.kesik ? ' kesik' : ''}${y.kesik && ilgili && on ? ' akiyor' : ''}`} d={y.d} stroke={renk} strokeWidth={g} markerEnd={`url(#py-u-${y.r})`} />
                    {!y.kesik && on && [0, 1].map((i) => (
                      <g key={i} className="py-para">
                        <circle r="7" fill={R.altin} stroke={R.ahsapK} strokeWidth="2.5" />
                        <circle r="2.5" fill={R.altinK} />
                        <animateMotion dur="2.6s" begin={`${i * 1.3}s`} repeatCount="indefinite"><mpath href={`#py-${y.id}`} /></animateMotion>
                      </g>
                    ))}
                    {yazi && <text className="py-etiket" x={y.lx} y={y.ly} textAnchor={y.an ?? 'middle'} fill={y.r === 'altin' ? '#9a6b00' : renk} stroke="#fff8e6" strokeWidth={4} style={{ paintOrder: 'stroke' }}>{yazi}</text>}
                  </g>
                )
              })}

              {(Object.keys(DUGUMLER) as DugumId[]).map((id) => {
                const n = DUGUMLER[id]
                const on = !ilgili || ilgili.dugumler.includes(id)
                const ad = id === 'hizmet' ? hizmetAdi : n.ad
                const ay = altYazi(id)
                const aw = ay.length * 7.6 + 16
                const ax = n.x + 30
                const ayY = n.t === 'rozet' ? n.y - 50 : n.y - 80
                return (
                  <g
                    key={id}
                    className={`py-dugum${seciliDugum === id ? ' secili' : ''}${on ? '' : ' py-soluk'}`}
                    tabIndex={0}
                    role="button"
                    aria-label={ad}
                    aria-pressed={seciliDugum === id}
                    onClick={() => dugumSec(id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); dugumSec(id) } }}
                  >
                    <rect className="py-halka" x={n.x - 82} y={n.y - 76} width={164} height={150} rx={18} />
                    {n.t === 'resim' && (
                      <>
                        <ellipse cx={n.x} cy={n.y + 30} rx={56} ry={10} fill="rgba(122,74,34,.14)" />
                        <image href={dugumResmi(id, amac)} x={n.x - 66} y={n.y - 72} width={132} height={112} preserveAspectRatio="xMidYMax meet" />
                      </>
                    )}
                    {n.t === 'rozet' && (
                      <>
                        <circle cx={n.x} cy={n.y - 10} r={34} fill={n.renk} stroke={R.murekkep} strokeWidth={3} />
                        <path d={`M${n.x - 30} ${n.y + 2}a34 34 0 0 0 60 0`} fill="none" stroke="rgba(0,0,0,.22)" strokeWidth={5} />
                        <g transform={`translate(${n.x} ${n.y - 10})`}><Simge id={id} /></g>
                      </>
                    )}
                    {n.t === 'arsa' && (
                      <g transform={`translate(${n.x} ${n.y - 6})`}>
                        <path d="M-62 0L0-34L62 0L0 34Z" fill={R.cimen} stroke={R.ahsapK} strokeWidth="2.5" strokeDasharray="6 5" />
                        <circle r="17" fill={R.altin} stroke={R.murekkep} strokeWidth="3" />
                        <path d="M-8 0h16M0-8v16" stroke={R.murekkep} strokeWidth="3.5" strokeLinecap="round" />
                      </g>
                    )}
                    <EtiketKutusu x={n.x} y={n.y + 48} yazi={ad} />
                    {ay && (
                      <>
                        <rect x={ax} y={ayY} width={aw} height={22} rx={11} fill="rgba(18,21,30,.78)" stroke={R.murekkep} strokeWidth={2} />
                        <text x={ax + aw / 2} y={ayY + 16} textAnchor="middle" className="py-kutu-yazi" fontSize="13" fill={R.altin}>{ay}</text>
                      </>
                    )}
                  </g>
                )
              })}
            </svg>
          </div>
          <p className="py-kaydir">{L('Şemayı yana kaydırabilirsin.', 'You can scroll the diagram sideways.')}</p>

          <section className="py-kart" aria-live="polite">
            {!sec && (
              <>
                <div className="py-simge"><SimgeKutu id="sandik" amac={amac} /></div>
                <div className="py-bilgi">
                  <h2 className="baslik">{L('Bir tur = 10 yıl', 'One round = 10 years')}</h2>
                  <p>{L('Soldaki akarlar akçe getirir, sandıkta toplanır. Bir pay yedek fona, bir pay bakıma gider, kalanı hizmeti karşılar. Artan para yeni yapı olur. Kesikli yollar yalnızca kötü günde kullanılır.', 'The income properties on the left bring in akçe, which collects in the chest. One share goes to the reserve fund and one to upkeep; the rest pays for the service. The surplus becomes new buildings. The dashed paths are used only on bad days.')}</p>
                  <p className="kucuk">{L('Bir binaya ya da üstteki adımlara dokun.', 'Tap a building or the steps above.')}</p>
                  <GercekSatir metin={L('Bu yapıların gerçek örnekleri oyunun ikinci kısmında, vakıf eserleri envanteriyle karşına çıkar.', 'Real examples of these buildings appear in the second part of the game, from the inventory of foundation monuments.')} />
                </div>
              </>
            )}
            {seciliAdim && (() => {
              const [bas, metin] = adimMetni(seciliAdim, r)
              return (
                <>
                  <div className="py-simge py-adim-no baslik">{seciliAdim}</div>
                  <div className="py-bilgi">
                    <div className="py-bilgi-ust"><h2 className="baslik">{bas}</h2><span className="py-miktar">{L('Adım', 'Step')} {seciliAdim} / {ADIM_IDLERI.length}</span></div>
                    <p>{metin}</p>
                  </div>
                </>
              )
            })()}
            {seciliDugum && (() => {
              const b = bilgi(seciliDugum, r, rakam)
              const g = gercekMetni(seciliDugum, amac)
              return (
                <>
                  <div className="py-simge"><SimgeKutu id={seciliDugum} amac={amac} /></div>
                  <div className="py-bilgi">
                    <div className="py-bilgi-ust">
                      <h2 className="baslik">{seciliDugum === 'hizmet' ? hizmetAdi : DUGUMLER[seciliDugum].ad}</h2>
                      {b.m && <span className="py-miktar">{b.m}</span>}
                    </div>
                    <div className="py-cipler">{b.cip.map(([yazi, renk]) => <span key={yazi} className={`py-cip c-${renk}`}>{yazi}</span>)}</div>
                    <p>{b.p}</p>
                    <p className="kucuk">{b.k}</p>
                    {b.hayrat && (
                      <div className="py-hayratlar" role="group" aria-label={L('Hizmet seç', 'Choose a service')}>
                        {(Object.keys(S.AMACLAR) as AmacId[]).map((k) => (
                          <button key={k} aria-pressed={k === amac} onClick={() => setAmac(k)}>{S.AMACLAR[k].ad} {S.AMACLAR[k].gider}</button>
                        ))}
                      </div>
                    )}
                    {g && <GercekSatir metin={g} />}
                  </div>
                </>
              )
            })()}
          </section>

          <div className="py-alt">
            <p className="py-not">
              {L('Tarihsel esinli: değerler oyun dengesi içindir, gerçek bir vakfın hesabı değildir.', 'Historically inspired: the values are for game balance, not the accounts of a real foundation.')}
              {rakam && L(' Rakamlar oyunun motorundan: varsayılan kurulum, normal zorluk, olaysız ilk tur.', ' The numbers come from the game engine: default setup, normal difficulty, a first round with no events.')}
            </p>
            {onDevam && <button className="dugme yesil baslik py-devam" onClick={onDevam}>{L('◀ GERİ', '◀ BACK')}</button>}
          </div>
        </div>
  )
  if (gomulu) return icerik
  return (
    <div className="ortala">
      <section className="ahsap-panel bilgi-paneli para-yolu" aria-labelledby="py-baslik">
        <h1 id="py-baslik" className="kurdele yesil baslik golgeli">{L('PARANIN YOLU', 'THE PATH OF THE MONEY')}</h1>
        <button className="kapat-dugmesi" aria-label={L('Kapat', 'Close')} onClick={onKapat}>✕</button>
        {icerik}
      </section>
    </div>
  )
}
