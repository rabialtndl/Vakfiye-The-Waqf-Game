// Vakıf Oyunu motoru. Saf TypeScript: ekrana, zamana ve Math.random'a dokunmaz.
// Her fonksiyon yeni bir durum döndürür; eski durum değişmez.
// Kurallar: docs/vakif-oyunu-kurallari-v2.md

import { iki, L } from '../dil'
import { cek } from './rng'
import { SABITLER as S, type AmacId, type MutevelliId, type OlayId } from './sabitler'
import { insaKontrol, sehirTuru, YAPILAR, ARSALAR, type ArsaId, type YapiId, type Yapilar } from './sehir'

export type Sermaye = { hamam: number; han: number; arazi: number; nakit: number }

export type Ayarlar = {
  sermaye: Sermaye
  amac: AmacId
  yedekFonOrani: number // yüzde: 0..50
  mutevelli: MutevelliId
  tohum: number
  /** Kolay modda çöküş için 4 tur üst üste boş sandık gerekir (normalde 3). */
  zorluk?: 'normal' | 'kolay'
  /** Pasaporttaki pullar için başlangıçta yapı parasına konan bağış (akçe). */
  kesifBagisi?: number
  /** Level hedefi: vakıf bu yıla ayakta varırsa oyun kazanılır (verilmezse 600). */
  hedefYil?: number
  /** Arayüz için: level numarası ve yapı hedefi (motor kullanmaz). */
  levelNo?: number
  yapiHedefi?: number
  /** Levelin tarihi olayları: yıl → olay. Verilen yıllarda zar yine çekilir ama olay buradan gelir; diğer yıllarda zar. */
  tarihiOlaylar?: Record<number, OlayId>
  /** Arayüz için: levelin başladığı takvim yılı (motor kullanmaz). */
  takvim?: number
  /** Her olay oyunda en çok bir kez çıkar (zarla gelenler; levelin tarihi olayları yine olur). */
  olayBirKez?: boolean
  /** İki zar olayı arasında en az bu kadar tur (10 yıl) sakin geçer. Levelin tarihi olayları etkilenmez. */
  olayArasi?: number
  /** Test modu: yıl → olay. Verilirse zar yine çekilir ama olay buradan gelir. */
  zorlaOlaylar?: Record<number, OlayId | null>
}

export type KotuOlay = OlayId | 'zimmet'
export type Secim = 'fon' | 'nakit' | 'kis'

export type GeriGelis = { mulk: 'hamam' | 'han'; birimPerTur: number; kalanTur: number; kalanToplam: number }

export type BekleyenKarar = {
  olay: 'deprem' | 'yangin'
  hasarHamam: number
  hasarHan: number
  bedel: number
  /** Oyuncu afet müdahalesini yaptı mı (bir kez yapılır). */
  mudahale?: boolean
}

export type KararKaydi = { yil: number; olay: 'deprem' | 'yangin'; secim: Secim; korunanBirim: number; harcanan: number }

export type GunlukSatiri = { yil: number; mesaj: string; tur: 'bilgi' | 'kotu' | 'iyi' }

export type TurOzeti = {
  yil: number
  olay: OlayId | null
  zimmet: number // kaybedilen fon
  gelir: number
  fonPayi: number
  bakim: number
  hizmeteKalan: number
  gereken: number
  odendi: boolean
  /** Yeni yapıların bu turki ek geliri (çarpanlardan önce). */
  sehirGeliri: number
  /** Hizmet ödendikten sonra yapı parasına giren. */
  artanEk: number
  /** Sezon mini oyunundan gelen gelir artışı (0–0,2). */
  sezonBonusu: number
}

export type Durum = {
  ayarlar: Ayarlar
  rng: number
  yil: number
  mulk: { hamam: number; han: number; arazi: number }
  nakit: number
  fon: number
  hizmetGideri: number
  artArdaBos: number
  toplamBos: number
  geriGelenler: GeriGelis[]
  kisilmisHizmetTur: number
  sonKotuOlay: KotuOlay | null
  olaySayisi: number
  kararSayisi: number
  kararlar: KararKaydi[]
  gunluk: GunlukSatiri[] // en yeni sonda
  sonTur: TurOzeti | null
  bekleyenKarar: BekleyenKarar | null
  /** Yapı parası: hizmetten artan para. Yalnızca yeni yapı kurmaya harcanır. */
  artan: number
  /** Salgın müdahalesinin yapıldığı tur (aynı turda bir kez). */
  mudahaleYili?: number
  /** Bu oyunda çıkmış olaylar (olayBirKez için). */
  gorulenOlaylar?: OlayId[]
  /** Son olayın yılı (olayArasi için). */
  sonOlayYili?: number
  /** Şehirde kurulan yeni yapılar (arsa → yapı). */
  yapilar: Yapilar
  bitti: boolean
  sonuc: 'ayakta' | 'coktu' | null
}

const OLAY_MESAJ: Record<OlayId, string> = iki<Record<OlayId, string>>({
  deprem: 'Deprem: hamam ve han yıkıldı.',
  yangin: 'Çarşıda yangın: han ve dükkânlar yandı.',
  kuraklik: 'Kuraklık: tarlalar ürün vermedi.',
  savas: 'Savaş: kervan yolu kapandı.',
  enflasyon: 'Enflasyon: akçe değer kaybetti, giderler arttı.',
  salgin: 'Salgın: kervanlar gelmedi, han geliri yarıya indi; hayrata ihtiyaç arttı.',
  bereket: 'Bereketli yıl: tarlalar iki kat ürün verdi.',
  kervan: 'Kervan mevsimi: han doldu taştı, kira %50 arttı.',
  bagis: 'Bir hayırsever vakfa bağışta bulundu: yedek fon büyüdü.',
}, {
  deprem: 'Earthquake: the bathhouse and the inn collapsed.',
  yangin: 'Fire in the bazaar: the inn and the shops burned.',
  kuraklik: 'Drought: the fields yielded nothing.',
  savas: 'War: the caravan road was closed.',
  enflasyon: 'Inflation: the akçe lost value and costs rose.',
  salgin: 'Epidemic: no caravans came and the inn’s income halved; the need for charity grew.',
  bereket: 'A bountiful year: the fields yielded twice as much.',
  kervan: 'Caravan season: the inn overflowed and rent rose 50%.',
  bagis: 'A benefactor made a donation: the reserve fund grew.',
})

/** Oyuncuya iyi gelen olay mı (bereket, kervan, bağış). */
export const iyiOlay = (o: OlayId | null): boolean => !!o && (S.IYI_OLAYLAR as readonly string[]).includes(o)

export function sermayeToplami(s: Sermaye): number {
  return s.hamam + s.han + s.arazi + s.nakit
}

export function kurulumGecerli(a: Ayarlar): boolean {
  const s = a.sermaye
  const adimda = (n: number) => n >= 0 && n % S.SERMAYE_ADIM === 0
  return (
    sermayeToplami(s) === S.SERMAYE_TOPLAM &&
    [s.hamam, s.han, s.arazi, s.nakit].every(adimda) &&
    a.yedekFonOrani >= S.YEDEK_FON_MIN &&
    a.yedekFonOrani <= S.YEDEK_FON_MAX
  )
}

export function varsayilanAyarlar(): Ayarlar {
  const v = S.VARSAYILAN
  return { sermaye: { ...v.sermaye }, amac: v.amac, yedekFonOrani: v.yedekFonOrani, mutevelli: v.mutevelli, tohum: v.tohum }
}

/** Tur başına beklenen gelir (olaysız tur). Kurulum ekranındaki önizleme için. */
export function olaysizGelir(a: Ayarlar): number {
  const m = S.MULKLER
  const c = S.MUTEVELLI[a.mutevelli].gelirCarpani * (a.zorluk === 'kolay' ? S.KOLAY_GELIR_CARPANI : 1)
  return (a.sermaye.hamam * m.hamam.gelir + a.sermaye.han * m.han.gelir + a.sermaye.arazi * m.arazi.gelir) * c
}

export function yeniOyun(ayarlar: Ayarlar): Durum {
  const amac = S.AMACLAR[ayarlar.amac]
  return {
    ayarlar,
    rng: ayarlar.tohum >>> 0,
    yil: 0,
    mulk: { hamam: ayarlar.sermaye.hamam, han: ayarlar.sermaye.han, arazi: ayarlar.sermaye.arazi },
    nakit: ayarlar.sermaye.nakit,
    fon: 0,
    hizmetGideri: amac.gider,
    artArdaBos: 0,
    toplamBos: 0,
    geriGelenler: [],
    kisilmisHizmetTur: 0,
    sonKotuOlay: null,
    olaySayisi: 0,
    kararSayisi: 0,
    kararlar: [],
    gunluk: [
      {
        yil: 0,
        mesaj: L(`Vakıf kuruldu: ${amac.ad.toLocaleLowerCase('tr')} için, gelirin %${ayarlar.yedekFonOrani}'i yedek fona.`, `Foundation established for a ${amac.ad.toLocaleLowerCase('en')}; ${ayarlar.yedekFonOrani}% of income goes to the reserve fund.`),
        tur: 'bilgi',
      },
    ],
    sonTur: null,
    bekleyenKarar: null,
    artan: ayarlar.kesifBagisi ?? 0,
    yapilar: {},
    bitti: false,
    sonuc: null,
  }
}

function kopya(d: Durum): Durum {
  return {
    ...d,
    mulk: { ...d.mulk },
    geriGelenler: d.geriGelenler.map((g) => ({ ...g })),
    kararlar: [...d.kararlar],
    gunluk: [...d.gunluk],
    yapilar: { ...d.yapilar },
  }
}

function yaz(d: Durum, mesaj: string, tur: GunlukSatiri['tur'] = 'bilgi') {
  d.gunluk.push({ yil: d.yil, mesaj, tur })
}

// Kümülatif eşikler: [0,0.09) deprem · [0.09,0.18) yangın · ... · [0.36,1) olay yok.
// Kayan nokta toplam hatası olmasın diye yuvarlanır.
const OLAY_ESIKLERI = S.OLAYLAR.reduce<{ id: OlayId; esik: number }[]>((liste, o) => {
  const onceki = liste.length ? liste[liste.length - 1].esik : 0
  liste.push({ id: o.id, esik: Math.round((onceki + o.ihtimal) * 1e6) / 1e6 })
  return liste
}, [])

function olaySec(r: number): OlayId | null {
  for (const o of OLAY_ESIKLERI) if (r < o.esik) return o.id
  return null
}

export const SEZON_BONUS_EN_COK = 0.2

/**
 * Bir tur (10 yıl) oynar. Karar bekleniyorsa ya da oyun bittiyse durumu değiştirmez.
 * sezonBonusu: oyuncu turu sezon mini oyunuyla oynadıysa gelire eklenen oran (0–0,2). Zar çekimini etkilemez.
 */
export function turOyna(onceki: Durum, sezonBonusu = 0): Durum {
  if (onceki.bitti || onceki.bekleyenKarar) return onceki
  const d = kopya(onceki)
  const a = d.ayarlar
  const amacAd = S.AMACLAR[a.amac].ad.toLocaleLowerCase(L('tr', 'en'))

  // 1. ZAMAN ve kıstan geri gelenler
  d.yil += S.TUR_YIL
  for (const g of d.geriGelenler) {
    if (g.kalanTur <= 0) continue
    const ekle = Math.min(g.kalanTur === 1 ? g.kalanToplam : g.birimPerTur, g.kalanToplam)
    d.mulk[g.mulk] += ekle
    g.kalanToplam -= ekle
    g.kalanTur -= 1
  }
  d.geriGelenler = d.geriGelenler.filter((g) => g.kalanTur > 0)
  const yarimHizmet = d.kisilmisHizmetTur > 0
  if (d.kisilmisHizmetTur > 0) d.kisilmisHizmetTur -= 1

  // 2. ZİMMET: r1 her turda çekilir
  let r1: number
  ;[r1, d.rng] = cek(d.rng)
  let zimmet = 0
  if (S.MUTEVELLI[a.mutevelli].zimmet && d.fon > S.ZIMMET_ESIK_FON && r1 < S.ZIMMET_IHTIMAL) {
    zimmet = d.fon * S.ZIMMET_ORAN
    d.fon -= zimmet
    d.sonKotuOlay = 'zimmet'
    d.olaySayisi += 1
    yaz(d, L(`Zimmet: mütevelli sandıktan ${zimmet.toFixed(1).replace('.', ',')} akçe aldı.`, `Embezzlement: the trustee took ${zimmet.toFixed(1)} akçe from the chest.`), 'kotu')
  }

  // 3. OLAY: r2 her turda çekilir
  let r2: number
  ;[r2, d.rng] = cek(d.rng)
  const tarihi = a.tarihiOlaylar?.[d.yil]
  let olay = a.zorlaOlaylar ? (a.zorlaOlaylar[d.yil] ?? null) : (tarihi ?? olaySec(r2))
  // Her olay bir kez: daha önce çıkan olay (tarihi olanlar dahil) bu tur sakin geçer; zarla gelen olay,
  // levelin tarihte yaşayacağı bir olaysa da gelmez (o olay tarihî yılında, bir kez yaşanır). Zar yine çekildi.
  if (olay && a.olayBirKez && !a.zorlaOlaylar) {
    const tarihteVar = !tarihi && Object.values(a.tarihiOlaylar ?? {}).includes(olay)
    if (d.gorulenOlaylar?.includes(olay) || tarihteVar) olay = null
  }
  // Olaylar arası nefes: son olaydan bu yana yeterli zaman geçmediyse zarla gelen olay gelmez.
  if (olay && a.olayArasi && !a.zorlaOlaylar && !tarihi && d.sonOlayYili !== undefined && d.yil - d.sonOlayYili < a.olayArasi * S.TUR_YIL) olay = null
  if (olay) d.sonOlayYili = d.yil
  if (olay && !d.gorulenOlaylar?.includes(olay)) d.gorulenOlaylar = [...(d.gorulenOlaylar ?? []), olay]
  if (olay && iyiOlay(olay)) {
    yaz(d, OLAY_MESAJ[olay], 'iyi')
    if (olay === 'bagis') d.fon += S.BAGIS_FON
  } else if (olay) {
    d.olaySayisi += 1
    d.sonKotuOlay = olay
    yaz(d, OLAY_MESAJ[olay], 'kotu')
  }
  if (olay === 'enflasyon') {
    d.nakit *= 1 - S.ENFLASYON_NAKIT
    d.fon *= 1 - S.ENFLASYON_FON
    d.hizmetGideri *= 1 + S.ENFLASYON_GIDER_ARTIS
    d.artan *= 1 - S.ENFLASYON_NAKIT
  }

  // 4. GELİR
  const m = S.MULKLER
  const hamamG = d.mulk.hamam * m.hamam.gelir
  const hanCarpan = olay === 'savas' ? 0 : olay === 'salgin' ? S.SALGIN_HAN : olay === 'kervan' ? S.KERVAN_HAN : 1
  const hanG = d.mulk.han * m.han.gelir * hanCarpan
  const araziG = olay === 'kuraklik' ? 0 : d.mulk.arazi * m.arazi.gelir * (olay === 'bereket' ? S.BEREKET_ARAZI : 1)
  const sehir = sehirTuru(d.yapilar, olay, hanG, d.mulk.arazi * m.arazi.gelir)
  const bonus = Math.min(Math.max(sezonBonusu, 0), SEZON_BONUS_EN_COK)
  const gelir = (hamamG + hanG + araziG + sehir.ek) * S.MUTEVELLI[a.mutevelli].gelirCarpani * (a.zorluk === 'kolay' ? S.KOLAY_GELIR_CARPANI : 1) * (1 + bonus)
  const fonPayi = gelir * (a.yedekFonOrani / 100)
  d.fon += fonPayi

  // 5. ÖDEMELER
  const bakim = d.mulk.hamam * m.hamam.bakim + d.mulk.han * m.han.bakim + d.hizmetGideri * S.HAYRAT_BAKIM_ORANI + sehir.bakim
  const hizmeteKalan = gelir - fonPayi - bakim + d.nakit * S.NAKIT_KATKI
  const gereken = d.hizmetGideri * (yarimHizmet ? S.KIS_HIZMET_CARPANI : 1) * (olay === 'salgin' ? S.SALGIN_GIDER : 1)
  let odendi = true
  let artanEk = 0
  if (hizmeteKalan >= gereken) {
    d.artArdaBos = 0
    artanEk = hizmeteKalan - gereken
    d.artan += artanEk
  } else {
    const acik = gereken - hizmeteKalan
    if (d.fon >= acik) {
      d.fon -= acik
      d.artArdaBos = 0
      yaz(d, L(`Açık yedek fondan kapandı (${acik.toFixed(1).replace('.', ',')}).`, `The shortfall was covered from the reserve fund (${acik.toFixed(1)}).`))
    } else {
      d.fon = 0
      d.artArdaBos += 1
      d.toplamBos += 1
      odendi = false
      yaz(d, L(`Sandık boş: ${amacAd} hizmet veremedi.`, `The chest is empty: the ${amacAd} could not serve.`), 'kotu')
    }
  }
  if (odendi && !olay && !zimmet) yaz(d, L(`Olay yok. ${S.AMACLAR[a.amac].ad} hizmetini sürdürdü.`, `No events. The ${amacAd} kept serving.`))

  d.sonTur = { yil: d.yil, olay, zimmet, gelir, fonPayi, bakim, hizmeteKalan, gereken, odendi, sehirGeliri: sehir.ek, artanEk, sezonBonusu: bonus }

  // 7a. Çöküş, karardan önce bakılır: çöken vakfa karar sorulmaz.
  if (d.artArdaBos >= cokusSiniri(a)) {
    d.bitti = true
    d.sonuc = 'coktu'
    return d
  }

  // 6. HASAR + KARAR
  if (olay === 'deprem' || olay === 'yangin') {
    const hasarHamam = olay === 'deprem' ? Math.floor(d.mulk.hamam * S.DEPREM_HAMAM) : 0
    const hasarHan = Math.floor(d.mulk.han * (olay === 'deprem' ? S.DEPREM_HAN : S.YANGIN_HAN))
    if (hasarHamam + hasarHan > 0) {
      d.bekleyenKarar = { olay, hasarHamam, hasarHan, bedel: (hasarHamam + hasarHan) * S.ONARIM_CARPANI }
      return d
    }
  }

  return bitisKontrol(d)
}

/** Bu oyunun hedef yılı: level varsa onunki, yoksa 600. */
export const hedefYili = (a: Ayarlar): number => a.hedefYil ?? S.HEDEF_YIL

export function cokusSiniri(a: Ayarlar): number {
  return a.zorluk === 'kolay' ? S.COKUS_ART_ARDA_BOS + 1 : S.COKUS_ART_ARDA_BOS
}

function bitisKontrol(d: Durum): Durum {
  if (d.yil >= hedefYili(d.ayarlar)) {
    d.bitti = true
    d.sonuc = 'ayakta'
  }
  return d
}

/** Bilgi sorusuna doğru cevap ya da benzeri bir ödül: yapı parasına bağış. */
/** Afet müdahalesinin hasarı en çok bu oranda azaltır. */
export const MUDAHALE_EN_COK = 0.5

/**
 * Yangın ya da deprem kararından önce oyuncu müdahale ettiyse: hasar (ve onarım bedeli) başarı oranına göre
 * en çok %50 azalır. Karar başına bir kez.
 */
export function mudahaleEt(onceki: Durum, oran: number, mesaj: string): Durum {
  const k = onceki.bekleyenKarar
  if (!k || k.mudahale || onceki.bitti) return onceki
  const d = kopya(onceki)
  const azalt = MUDAHALE_EN_COK * Math.min(Math.max(oran, 0), 1)
  const hasarHamam = Math.round(k.hasarHamam * (1 - azalt))
  const hasarHan = Math.round(k.hasarHan * (1 - azalt))
  d.bekleyenKarar = { ...k, hasarHamam, hasarHan, bedel: (hasarHamam + hasarHan) * S.ONARIM_CARPANI, mudahale: true }
  yaz(d, mesaj, 'iyi')
  return d
}

/** Salgın turunda oyuncu darüşşifada yardım ettiyse: salgının fazladan giderinin o oranı yedek fona döner. */
export function salginHafiflet(onceki: Durum, oran: number, mesaj: string): Durum {
  const t = onceki.sonTur
  if (!t || t.olay !== 'salgin' || onceki.mudahaleYili === t.yil || onceki.bitti) return onceki
  const d = kopya(onceki)
  const fazla = t.gereken - t.gereken / S.SALGIN_GIDER
  d.fon += fazla * Math.min(Math.max(oran, 0), 1)
  d.mudahaleYili = t.yil
  yaz(d, mesaj, 'iyi')
  return d
}

export function bagisEkle(onceki: Durum, miktar: number, mesaj: string): Durum {
  if (miktar <= 0 || onceki.bitti) return onceki
  const d = kopya(onceki)
  d.artan += miktar
  yaz(d, mesaj, 'iyi')
  return d
}

/** Oyuncunun afet sorusu canları bitti: vakıf o anda çöker ve oyun biter. */
export function canBitti(onceki: Durum): Durum {
  if (onceki.bitti) return onceki
  const d = kopya(onceki)
  d.bitti = true
  d.sonuc = 'coktu'
  d.bekleyenKarar = null
  yaz(d, L('Canların bitti: vakıf ayakta kalamadı.', 'You ran out of lives: the foundation could not stand.'), 'kotu')
  return d
}

/** Kuraklık ya da savaş turunda oyuncu soruyu bildiyse: yardım yedek fona girer (tur başına bir kez). */
export function afetYardimi(onceki: Durum, miktar: number, mesaj: string): Durum {
  const t = onceki.sonTur
  if (!t || miktar <= 0 || onceki.bitti || onceki.mudahaleYili === t.yil) return onceki
  const d = kopya(onceki)
  d.fon += miktar
  d.mudahaleYili = t.yil
  yaz(d, mesaj, 'iyi')
  return d
}

/** Açılmış bir arsaya yeni yapı kurar; parası yapı parasından düşülür. Kurulamıyorsa durumu değiştirmez. */
export function insaEt(onceki: Durum, arsa: ArsaId, yapi: YapiId, pulSayisi = 0): Durum {
  if (!insaKontrol(onceki, arsa, yapi, pulSayisi).olur) return onceki
  const d = kopya(onceki)
  const t = YAPILAR[yapi]
  d.artan -= t.maliyet
  d.yapilar[arsa] = yapi
  yaz(d, L(`${t.ad} kuruldu (${ARSALAR[arsa].ad}, ${t.maliyet} akçe).`, `${t.ad} built (${ARSALAR[arsa].ad}, ${t.maliyet} akçe).`), 'iyi')
  return d
}

export type SecenekDurumu = { secim: Secim; acik: boolean; neden?: string }

export function secenekler(d: Durum): SecenekDurumu[] {
  const k = d.bekleyenKarar
  if (!k) return []
  const fonYeter = d.fon >= k.bedel
  return [
    {
      secim: 'fon',
      acik: fonYeter,
      neden: fonYeter ? undefined : L(`Fon yetmiyor ${Math.round(d.fon)} / ${Math.round(k.bedel)}`, `Not enough in the fund ${Math.round(d.fon)} / ${Math.round(k.bedel)}`),
    },
    { secim: 'nakit', acik: d.nakit > 0, neden: d.nakit > 0 ? undefined : L('Nakit yok', 'No cash') },
    { secim: 'kis', acik: true },
  ]
}

export function kararVer(onceki: Durum, secim: Secim): Durum {
  const k = onceki.bekleyenKarar
  if (!k) return onceki
  const sec = secenekler(onceki).find((s) => s.secim === secim)
  if (!sec?.acik) throw new Error(`Seçenek kapalı: ${secim}`)
  const d = kopya(onceki)
  const toplamHasar = k.hasarHamam + k.hasarHan
  let korunan = 0
  let harcanan = 0

  if (secim === 'fon') {
    d.fon -= k.bedel
    korunan = toplamHasar
    harcanan = k.bedel
    yaz(d, L(`Yedek fonla onarıldı (${k.bedel.toFixed(1).replace('.', ',')}).`, `Repaired with the reserve fund (${k.bedel.toFixed(1)}).`), 'iyi')
  } else if (secim === 'nakit') {
    harcanan = Math.min(d.nakit, k.bedel)
    d.nakit -= harcanan
    const oran = harcanan / k.bedel
    const hamamOnce = d.mulk.hamam
    const hanOnce = d.mulk.han
    d.mulk.hamam = Math.floor(d.mulk.hamam - k.hasarHamam + k.hasarHamam * oran)
    d.mulk.han = Math.floor(d.mulk.han - k.hasarHan + k.hasarHan * oran)
    const kayip = hamamOnce - d.mulk.hamam + (hanOnce - d.mulk.han)
    korunan = toplamHasar - kayip
    yaz(d, L(`Nakitle onarıldı (${harcanan.toFixed(1).replace('.', ',')}); ${kayip} birim kalıcı kaybedildi.`, `Repaired with cash (${harcanan.toFixed(1)}); ${kayip} units lost for good.`), kayip > 0 ? 'kotu' : 'iyi')
  } else {
    d.mulk.hamam -= k.hasarHamam
    d.mulk.han -= k.hasarHan
    d.kisilmisHizmetTur = S.KIS_HIZMET_TUR
    for (const [mulk, hasar] of [
      ['hamam', k.hasarHamam],
      ['han', k.hasarHan],
    ] as const) {
      const geri = Math.floor(hasar * S.KIS_GERI_ORAN)
      if (geri > 0) {
        d.geriGelenler.push({
          mulk,
          birimPerTur: Math.floor(geri / S.KIS_GERI_GELIS_TUR),
          kalanTur: S.KIS_GERI_GELIS_TUR,
          kalanToplam: geri,
        })
      }
    }
    yaz(d, L(`Hizmet kısıldı: mülkler ${S.KIS_GERI_GELIS_TUR} turda kısmen geri gelecek.`, `Service cut back: the properties will partly come back over ${S.KIS_GERI_GELIS_TUR} rounds.`))
  }

  d.kararSayisi += 1
  d.kararlar.push({ yil: d.yil, olay: k.olay, secim, korunanBirim: korunan, harcanan })
  d.bekleyenKarar = null
  return bitisKontrol(d)
}

/** "Karara kadar ilerle": karar anına ya da oyunun sonuna kadar turları oynatır. */
export function kararaKadar(d: Durum): Durum[] {
  const adimlar: Durum[] = []
  let s = d
  while (!s.bitti && !s.bekleyenKarar) {
    s = turOyna(s)
    adimlar.push(s)
  }
  return adimlar
}

// ---------- Sonuç kartı (bölüm 7) ----------

export type SonucKarti = {
  baslik: string
  cokenOlay: string | null
  iyiKarar: { etiket: string; metin: string } | null
  ders: string
  istatistik: string
}

export const OLAY_AD: Record<KotuOlay, string> = iki<Record<KotuOlay, string>>({
  deprem: 'Deprem',
  yangin: 'Yangın',
  kuraklik: 'Kuraklık',
  savas: 'Savaş',
  enflasyon: 'Enflasyon',
  zimmet: 'Zimmet',
  salgin: 'Salgın',
  bereket: 'Bereketli yıl',
  kervan: 'Kervan mevsimi',
  bagis: 'Hayırsever bağışı',
}, {
  deprem: 'Earthquake',
  yangin: 'Fire',
  kuraklik: 'Drought',
  savas: 'War',
  enflasyon: 'Inflation',
  zimmet: 'Embezzlement',
  salgin: 'Epidemic',
  bereket: 'Bountiful year',
  kervan: 'Caravan season',
  bagis: 'Benefactor’s gift',
})

const SECIM_AD: Record<Secim, string> = iki<Record<Secim, string>>({ fon: 'Yedek fonla onarım', nakit: 'Nakitle onarım', kis: 'Hizmeti kısma' }, { fon: 'Repair with the reserve fund', nakit: 'Repair with cash', kis: 'Cut back the service' })

export function sonucKarti(d: Durum): SonucKarti {
  const a = d.ayarlar
  const ayakta = d.sonuc === 'ayakta'
  const enIyi = d.kararlar.reduce<KararKaydi | null>((en, k) => (!en || k.korunanBirim > en.korunanBirim ? k : en), null)
  const s = a.sermaye
  let ders: string
  if (ayakta) ders = L('Yedek fon ve dağılmış gelir kaynakları vakfı yüzyıllarca taşıdı.', 'A reserve fund and spread-out sources of income carried the foundation for centuries.')
  else if (a.yedekFonOrani < 15) ders = L('Yedek fon, iyi niyetten uzun yaşar.', 'A reserve fund outlives good intentions.')
  else if (d.sonKotuOlay === 'zimmet') ders = L('Vakfı mütevellinin dürüstlüğü ayakta tutar.', 'A foundation stands on the honesty of its trustee.')
  else if (Math.max(s.hamam, s.han, s.arazi) >= 45) ders = L('Tek gelir kaynağına dayanan vakıf tek felakette çöker.', 'A foundation that relies on one source of income falls in one disaster.')
  else ders = L('Hizmetin gideri, gelirin taşıyabileceğinden büyük olmamalı.', 'The cost of the service must not exceed what the income can carry.')

  return {
    baslik: ayakta ? L(`Vakfın ${hedefYili(a)} yıl ayakta kaldı.`, `Your foundation stood for ${hedefYili(a)} years.`) : L(`Vakfın ${d.yil} yıl yaşadı.`, `Your foundation lived for ${d.yil} years.`),
    cokenOlay: !ayakta && d.sonKotuOlay ? L(`${d.yil}. yıl · ${OLAY_AD[d.sonKotuOlay]}`, `Year ${d.yil} · ${OLAY_AD[d.sonKotuOlay]}`) : null,
    iyiKarar: enIyi
      ? {
          etiket: ayakta ? L('Seni kurtaran karar', 'The decision that saved you') : L('İyi kararın', 'Your good decision'),
          metin: L(`${enIyi.yil}. yıl · ${OLAY_AD[enIyi.olay]} · ${SECIM_AD[enIyi.secim]}`, `Year ${enIyi.yil} · ${OLAY_AD[enIyi.olay]} · ${SECIM_AD[enIyi.secim]}`),
        }
      : null,
    ders,
    istatistik: L(`${d.olaySayisi} olay · ${d.kararSayisi} karar · sandık ${d.toplamBos} kez boş kaldı`, `${d.olaySayisi} events · ${d.kararSayisi} decisions · the chest was empty ${d.toplamBos} times`),
  }
}

// ---------- Bot (denge testi ve otomatik oynatma) ----------

export type BotKurali = 'onaran' | 'kisan'

export function botSecimi(d: Durum, kural: BotKurali): Secim {
  if (kural === 'kisan') return 'kis'
  const acik = secenekler(d).filter((s) => s.acik).map((s) => s.secim)
  return acik.includes('fon') ? 'fon' : acik.includes('nakit') ? 'nakit' : 'kis'
}

/** İnşa eden bot: her turdan önce kasası yeten ilk yapıyı açık arsaya kurar. */
const BOT_INSA_SIRASI: [ArsaId, YapiId][] = [
  ['c1', 'arasta'], ['m1', 'evler'], ['m2', 'mektep'], ['c3', 'kumbet'], ['k1', 'kopru'],
  ['c2', 'bedesten'], ['k2', 'degirmen'], ['y1', 'kervan'],
]

export function botInsa(d: Durum, pulSayisi = 0): Durum {
  for (const [arsa, yapi] of BOT_INSA_SIRASI) {
    if (insaKontrol(d, arsa, yapi, pulSayisi).olur) return insaEt(d, arsa, yapi, pulSayisi)
  }
  return d
}

export function botlaOyna(ayarlar: Ayarlar, kural: BotKurali = 'onaran', insaEden = false): Durum {
  let d = yeniOyun(ayarlar)
  while (!d.bitti) {
    if (d.bekleyenKarar) d = kararVer(d, botSecimi(d, kural))
    else d = turOyna(insaEden ? botInsa(d) : d)
  }
  return d
}

// ---------- Yıldızlar ve ayakta kalma şansı ----------

/** 1 yıldız: 300. yıl · 2 yıldız: 600. yıl · 3 yıldız: 600. yıl ve sandık hiç boş kalmadı. */
export function yildiz(d: Durum): 0 | 1 | 2 | 3 {
  if (d.sonuc === 'ayakta') return d.toplamBos === 0 ? 3 : 2
  return d.yil >= hedefYili(d.ayarlar) / 2 ? 1 : 0
}

/** Bu ayarlarla, akıllı oynayan bir oyuncunun vakfı ayakta tutma ihtimali (yüzde). */
export function ayaktaKalmaSansi(ayarlar: Ayarlar, tohumSayisi = 300): number {
  let ayakta = 0
  for (let t = 1; t <= tohumSayisi; t++) {
    if (botlaOyna({ ...ayarlar, tohum: t, zorlaOlaylar: undefined }).sonuc === 'ayakta') ayakta++
  }
  return Math.round((100 * ayakta) / tohumSayisi)
}
