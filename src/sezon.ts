// Sezon mini oyunu: her "+10 yıl" turundan önce ~30 saniyelik bir sezon, haritanın üstünde oynanır.
// Çiftlik oyunu gibi mülklerden hasat ve yollardan yardım keseleri toplanır; ürünler sandıkta hazırlanıp
// arabaya yüklenir, araba hayrata gidip sırada bekleyenlere dağıtır ve geri döner (Farm Frenzy'deki kamyon gibi).
// Ürünlerin her biri envanterdeki gerçek bir esere bağlıdır: eserin kartını okumayan oyuncu o ürünü veremez.
// Pasaportta pulu olan eserin ürünü iki kat hızlı hazırlanır; her pul kişilerin sabrını da biraz uzatır.
// Sonuç, turun gelirine en çok %20 ekler (motor: turOyna(d, bonus)). Zar ve olaylar değişmez.
import type { Durum } from './motor/motor'
import { SEZON_BONUS_EN_COK } from './motor/motor'
import type { AmacId } from './motor/sabitler'
import { YAPILAR, type ArsaId } from './motor/sehir'

export type UrunId = 'corba' | 'ekmek' | 'su' | 'ders' | 'kitap' | 'kandil' | 'testi' | 'hamamSuyu'

export type Urun = {
  ad: string
  /** Ürünün dayandığı gerçek eser (envanter kimliği) ve türü. */
  eser: string
  eserTur: string
  eserAd: string
  /** Kartta gösterilecek bağlantı cümlesi. */
  neden: string
  /** Hazırlama süresi (sn). */
  hazirlik: number
  /** Ekmek gibi buğday isteyen ürünler. */
  bugday?: boolean
}

export const URUNLER: Record<UrunId, Urun> = {
  corba: {
    ad: 'Çorba', eser: 'orhan-gazi-kulliyesi', eserTur: 'kulliye', eserAd: 'Orhan Bey Külliyesi', hazirlik: 1.2,
    neden: 'Orhan Gazi Vakfı’nın imareti yolcuya ve yoksula her gün çorba dağıtırdı.',
  },
  ekmek: {
    ad: 'Ekmek', eser: 'reyhanli-yenisehir-degirmeni-hatay', eserTur: 'diger', eserAd: 'Reyhanlı Yenişehir Değirmeni', hazirlik: 1.4, bugday: true,
    neden: 'Vakıf değirmenleri buğdayı una çevirir, un vakfın fırınına ve imaretine giderdi.',
  },
  su: {
    ad: 'Su', eser: 'hoca-fakih-cesmesi-konya', eserTur: 'cesme', eserAd: 'Hoca Fakih Çeşmesi', hazirlik: 0.9,
    neden: 'Vakıf çeşmeleri mahalleye parasız su verirdi; suyun yolu da vakıf gelirleriyle onarılırdı.',
  },
  ders: {
    ad: 'Ders', eser: 'ince-minareli-medrese-sahip-ata-darulhadis-konya', eserTur: 'medrese', eserAd: 'İnce Minareli Medrese', hazirlik: 1.4,
    neden: 'Sahip Ata’nın vakfiyesi müderrisin ve talebelerin ödeneklerini akarlardan karşılardı.',
  },
  kitap: {
    ad: 'Kitap', eser: 'dolap-mektep-mescidi-konya', eserTur: 'mescit', eserAd: 'Dolap Mektep Mescidi', hazirlik: 1.2,
    neden: 'Mahalle mektepleri çocuklara okuma yazmayı öğretir, kitap ve hocayı vakıf karşılardı.',
  },
  kandil: {
    ad: 'Kandil', eser: 'sultan-alaeddin-ulu-camii-konya', eserTur: 'cami', eserAd: 'Sultan Alâeddin Camii', hazirlik: 1.0,
    neden: 'Cami vakıfları kandil yağını, hasırı ve görevlilerin ücretini akarlardan öderdi.',
  },
  testi: {
    ad: 'Testi', eser: 'samandag-vakifli-koyu-konut-hatay', eserTur: 'diger', eserAd: 'Samandağ Vakıflı Köyü', hazirlik: 1.1,
    neden: 'Köy evleri suyunu testiyle çeşmeden taşırdı; vakıf köylerinin evleri de vakfa kira öderdi.',
  },
  hamamSuyu: {
    ad: 'Sıcak su', eser: 'sahip-ata-sultan-hamami-konya', eserTur: 'hamam', eserAd: 'Sahip Ata Hamamı', hazirlik: 1.3,
    neden: 'Vakıf hamamları külhanda ısıttığı suyu satar, geliri külliyenin camisine ve türbesine giderdi.',
  },
}

/** Her hayratın sunduğu ürünler. İlki her zaman açıktır (hayratın kendi ilham eseri). */
export const MENU: Record<AmacId, UrunId[]> = {
  asevi: ['corba', 'ekmek', 'su'],
  medrese: ['ders', 'kitap', 'ekmek'],
  cami: ['kandil', 'su', 'ekmek'],
  cesme: ['su', 'testi', 'hamamSuyu'],
}

/** 3. levelden itibaren menüye eklenen dördüncü ürün. */
export const EK_URUN: Record<AmacId, UrunId> = { asevi: 'testi', medrese: 'su', cami: 'kitap', cesme: 'ekmek' }

export const menuOf = (amac: AmacId, zorluk = 1): UrunId[] => (zorluk >= 3 ? [...MENU[amac], EK_URUN[amac]] : MENU[amac])

/** Kartı okunmuş (ya da hayratın kendi) ürünleri açık sayar. */
export function acikUrunler(amac: AmacId, okunan: string[], zorluk = 1): UrunId[] {
  return menuOf(amac, zorluk).filter((u, i) => i === 0 || okunan.includes(URUNLER[u].eser))
}

/** Haritada ve düğmelerde ürünün simgesi. */
export const URUN_SIMGESI: Record<UrunId, string> = { corba: '🍲', ekmek: '🍞', su: '💧', ders: '📖', kitap: '📚', kandil: '🪔', testi: '🏺', hamamSuyu: '♨️' }

// ---------- Simülasyon ----------

export type Istasyon = { id: string; ad: string; bugday: boolean; hazirSn: number | null; sonrakiSn: number }
export type Musteri = { id: number; urun: UrunId; geldiSn: number; sabir: number }
/** Yolda beliren yardım kesesi; `yer` haritadaki yol noktalarından birinin sırası. */
export type Kese = { id: number; yer: number; dogduSn: number }
export type Araba = { durum: 'depoda' | 'gidiyor' | 'donuyor'; ilerleme: number }

export type Sezon = {
  t: number
  sure: number | null // sn; null = süresiz
  rng: number
  menu: UrunId[]
  acik: UrunId[]
  pullu: UrunId[]
  /** Kişilerin ve keselerin geliş aralığı çarpanı (zorlukla küçülür). */
  aralik: number
  istasyonlar: Istasyon[]
  keseler: Kese[]
  keseNo: number
  sonrakiKeseSn: number
  musteriler: Musteri[]
  sonrakiMusteriSn: number
  musteriNo: number
  /** Süresizde kaç kişi gelir. */
  musteriSiniri: number
  bugday: number
  bugdayGerekli: boolean
  mesgul: Partial<Record<UrunId, number>> // hangi saniyeye kadar hazırlanıyor
  /** Arabadaki ürünler ve arabanın yeri. */
  yuk: UrunId[]
  araba: Araba
  /** Son teslimatta kime ne verildiği (haritada kısa bir kutlama için). */
  sonTeslim: { sn: number; verilen: number; bosa: number } | null
  sabir: number
  hasatGelen: number
  hasatAlinan: number
  gelen: number
  verilen: number
  bosa: number
  kacan: { urun: UrunId; kilitli: boolean }[]
  bitti: boolean
}

export const SEZON_SURESI = 30
export const ARABA_KAPASITE = 3
export const GIDIS_SN = 2.4
export const DONUS_SN = 1.8
/** Haritadaki kese yerlerinin sayısı (yerler sahne/harita.ts > KESE_YERLERI). */
export const KESE_YER_SAYISI = 8
const HAZIR_KALMA = 4
const KESE_KALMA = 3.5
const SABIR = 12
const EN_COK_SIRA = 4

function rastgele(s: Sezon): number {
  // mulberry32 (motorla aynı)
  let t = (s.rng = (s.rng + 0x6d2b79f5) >>> 0)
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}

const YAPI_HASAT: Partial<Record<string, { ad: string; bugday?: boolean }>> = {
  arasta: { ad: 'Arasta kirası' },
  bedesten: { ad: 'Bedesten kirası' },
  evler: { ad: 'Ev kirası' },
  degirmen: { ad: 'Değirmen unu', bugday: true },
  kopru: { ad: 'Köprü geçişi' },
  kumbet: { ad: 'Ziyaretçi bağışı' },
  kervan: { ad: 'Kervan bacı' },
}

/** zorluk 1–4 (level): 3'ten sonra 4. ürün, kişiler daha sık gelir ve daha az bekler. */
export type SezonGirdisi = { durum: Durum; okunan: string[]; pullar: string[]; sureli: boolean; tohum?: number; zorluk?: number }

export function sezonKur({ durum: d, okunan, pullar, sureli, tohum, zorluk = 1 }: SezonGirdisi): Sezon {
  const istasyonlar: Istasyon[] = []
  if (d.mulk.hamam > 0) istasyonlar.push({ id: 'hamam', ad: 'Hamam kirası', bugday: false, hazirSn: null, sonrakiSn: 0 })
  if (d.mulk.han > 0) istasyonlar.push({ id: 'han', ad: 'Han kirası', bugday: false, hazirSn: null, sonrakiSn: 0 })
  if (d.mulk.arazi > 0) istasyonlar.push({ id: 'arazi', ad: 'Buğday hasadı', bugday: true, hazirSn: null, sonrakiSn: 0 })
  for (const [arsa, yapi] of Object.entries(d.yapilar) as [ArsaId, string][]) {
    const h = YAPI_HASAT[yapi]
    if (h && YAPILAR[yapi as keyof typeof YAPILAR]) istasyonlar.push({ id: arsa, ad: h.ad, bugday: !!h.bugday, hazirSn: null, sonrakiSn: 0 })
  }
  const menu = menuOf(d.ayarlar.amac, zorluk)
  const s: Sezon = {
    t: 0,
    sure: sureli ? SEZON_SURESI : null,
    rng: (tohum ?? d.rng ^ (d.yil * 2654435761)) >>> 0,
    menu,
    acik: acikUrunler(d.ayarlar.amac, okunan, zorluk),
    aralik: 1 - 0.08 * (Math.min(4, Math.max(1, zorluk)) - 1),
    pullu: menu.filter((u) => pullar.includes(URUNLER[u].eser)),
    istasyonlar,
    keseler: [],
    keseNo: 0,
    sonrakiKeseSn: 2.5,
    musteriler: [],
    sonrakiMusteriSn: 0.8,
    musteriNo: 0,
    musteriSiniri: 10,
    bugday: 0,
    // Buğday üreten bir yer yoksa ekmek pazardan gelir (sınırsız).
    bugdayGerekli: istasyonlar.some((i) => i.bugday),
    mesgul: {},
    yuk: [],
    araba: { durum: 'depoda', ilerleme: 0 },
    sonTeslim: null,
    sabir: SABIR - Math.max(0, zorluk - 2) + Math.min(3, pullar.length * 0.5),
    hasatGelen: 0,
    hasatAlinan: 0,
    gelen: 0,
    verilen: 0,
    bosa: 0,
    kacan: [],
    bitti: false,
  }
  for (const i of s.istasyonlar) i.sonrakiSn = 0.5 + rastgele(s) * 2.5
  return s
}

const kopya = (s: Sezon): Sezon => ({
  ...s,
  istasyonlar: s.istasyonlar.map((i) => ({ ...i })),
  keseler: s.keseler.map((k) => ({ ...k })),
  musteriler: s.musteriler.map((m) => ({ ...m })),
  mesgul: { ...s.mesgul },
  yuk: [...s.yuk],
  araba: { ...s.araba },
  kacan: [...s.kacan],
})

/** Araba hayrata varınca: her ürünü onu bekleyen en eski kişiye verir; isteyeni olmayan boşa gider. */
function teslimEt(s: Sezon) {
  let verilen = 0
  let bosa = 0
  for (const u of s.yuk) {
    const sira = s.musteriler.findIndex((m) => m.urun === u)
    if (sira >= 0) {
      s.musteriler.splice(sira, 1)
      verilen++
    } else bosa++
  }
  s.verilen += verilen
  s.bosa += bosa
  s.yuk = []
  s.sonTeslim = { sn: s.t, verilen, bosa }
}

/** Zamanı dt saniye ilerletir. */
export function sezonAdim(onceki: Sezon, dt: number): Sezon {
  if (onceki.bitti) return onceki
  const s = kopya(onceki)
  s.t += dt

  // Hasat: her istasyon arada bir hazır olur; süreliyse bir süre sonra kaçar.
  for (const i of s.istasyonlar) {
    if (i.hazirSn === null && s.t >= i.sonrakiSn) {
      i.hazirSn = s.t
      s.hasatGelen++
    } else if (i.hazirSn !== null && s.sure !== null && s.t - i.hazirSn > HAZIR_KALMA) {
      i.hazirSn = null
      i.sonrakiSn = s.t + 2 + rastgele(s) * 2.5
    }
  }

  // Yardım keseleri: yolda bir yerde belirir, bir süre sonra kaybolur.
  s.keseler = s.keseler.filter((k) => s.t - k.dogduSn <= (s.sure === null ? KESE_KALMA * 2 : KESE_KALMA))
  if (s.t >= s.sonrakiKeseSn && (s.sure !== null || s.musteriNo < s.musteriSiniri)) {
    const dolu = new Set(s.keseler.map((k) => k.yer))
    const bos = Array.from({ length: KESE_YER_SAYISI }, (_, i) => i).filter((i) => !dolu.has(i))
    if (bos.length) {
      s.keseler.push({ id: ++s.keseNo, yer: bos[Math.floor(rastgele(s) * bos.length)], dogduSn: s.t })
      s.hasatGelen++
    }
    s.sonrakiKeseSn = s.t + (3.5 + rastgele(s) * 2) * s.aralik
  }

  // Araba: sandıktan hayrata gider, teslim eder, geri döner.
  if (s.araba.durum === 'gidiyor') {
    s.araba.ilerleme = Math.min(1, s.araba.ilerleme + dt / GIDIS_SN)
    if (s.araba.ilerleme >= 1) {
      teslimEt(s)
      s.araba = { durum: 'donuyor', ilerleme: 0 }
    }
  } else if (s.araba.durum === 'donuyor') {
    s.araba.ilerleme = Math.min(1, s.araba.ilerleme + dt / DONUS_SN)
    if (s.araba.ilerleme >= 1) s.araba = { durum: 'depoda', ilerleme: 0 }
  }

  // Kişiler hayratın önüne gelir; sabrı biten gider.
  const sinirda = s.sure === null && s.musteriNo >= s.musteriSiniri
  if (!sinirda && s.t >= s.sonrakiMusteriSn && s.musteriler.length < EN_COK_SIRA) {
    // Çoğu kişi verilebilen bir ürün ister; arada bir kartı okunmamış ürünü isteyen gelir (okumaya teşvik).
    const havuz = s.acik.length && rastgele(s) < 0.75 ? s.acik : s.menu
    const urun = havuz[Math.floor(rastgele(s) * havuz.length)]
    s.musteriler.push({ id: ++s.musteriNo, urun, geldiSn: s.t, sabir: s.sure === null && s.acik.includes(urun) ? Infinity : s.sure === null ? 4 : s.sabir })
    s.gelen++
    s.sonrakiMusteriSn = s.t + (2.2 + rastgele(s) * 1.8) * s.aralik
  }
  s.musteriler = s.musteriler.filter((m) => {
    if (s.t - m.geldiSn <= m.sabir) return true
    s.kacan.push({ urun: m.urun, kilitli: !s.acik.includes(m.urun) })
    return false
  })

  const yoldaYuk = s.araba.durum === 'gidiyor' || s.yuk.length > 0
  if (s.sure !== null ? s.t >= s.sure : s.musteriNo >= s.musteriSiniri && s.musteriler.length === 0 && !yoldaYuk) s.bitti = true
  return s
}

/** Hazır bir hasadı toplar. */
export function topla(onceki: Sezon, istasyon: string): Sezon {
  const i0 = onceki.istasyonlar.find((i) => i.id === istasyon)
  if (onceki.bitti || !i0 || i0.hazirSn === null) return onceki
  const s = kopya(onceki)
  const i = s.istasyonlar.find((x) => x.id === istasyon)!
  i.hazirSn = null
  i.sonrakiSn = s.t + 2.5 + rastgele(s) * 2.5
  s.hasatAlinan++
  if (i.bugday) s.bugday += 2
  return s
}

/** Yoldaki yardım kesesini toplar. */
export function keseTopla(onceki: Sezon, id: number): Sezon {
  if (onceki.bitti || !onceki.keseler.some((k) => k.id === id)) return onceki
  const s = kopya(onceki)
  s.keseler = s.keseler.filter((k) => k.id !== id)
  s.hasatAlinan++
  return s
}

export type HazirlaSonucu = 'tamam' | 'kilitli' | 'mesgul' | 'bugday' | 'araba-yolda' | 'araba-dolu'

export function hazirlaKontrol(s: Sezon, urun: UrunId): HazirlaSonucu {
  if (!s.acik.includes(urun)) return 'kilitli'
  if (s.araba.durum !== 'depoda') return 'araba-yolda'
  if (s.yuk.length >= ARABA_KAPASITE) return 'araba-dolu'
  if ((s.mesgul[urun] ?? 0) > s.t) return 'mesgul'
  if (URUNLER[urun].bugday && s.bugdayGerekli && s.bugday < 1) return 'bugday'
  return 'tamam'
}

/** Ürünü sandıkta hazırlayıp arabaya yükler. */
export function hazirla(onceki: Sezon, urun: UrunId): Sezon {
  if (onceki.bitti || hazirlaKontrol(onceki, urun) !== 'tamam') return onceki
  const s = kopya(onceki)
  s.yuk.push(urun)
  if (URUNLER[urun].bugday && s.bugdayGerekli) s.bugday--
  s.mesgul[urun] = s.t + URUNLER[urun].hazirlik / (s.pullu.includes(urun) ? 2 : 1)
  return s
}

/** Arabadaki son ürünü geri indirir (yanlış yüklendiyse). */
export function yukIndir(onceki: Sezon): Sezon {
  if (onceki.bitti || onceki.araba.durum !== 'depoda' || !onceki.yuk.length) return onceki
  const s = kopya(onceki)
  const u = s.yuk.pop()!
  if (URUNLER[u].bugday && s.bugdayGerekli) s.bugday++
  return s
}

/** Yüklü arabayı hayrata gönderir. */
export function yolaCik(onceki: Sezon): Sezon {
  if (onceki.bitti || onceki.araba.durum !== 'depoda' || !onceki.yuk.length) return onceki
  const s = kopya(onceki)
  s.araba = { durum: 'gidiyor', ilerleme: 0 }
  return s
}

/** Sezonu bitirir (oyuncu erken bitirirse ya da süre dolunca). */
export function sezonuBitir(s: Sezon): Sezon {
  return s.bitti ? s : { ...s, bitti: true }
}

export function sezonPuani(s: Sezon): { hasat: number; hizmet: number; bonus: number } {
  // Bekleyenler sayılmaz: süre dolduğunda hazır duran hasat ya da sıradaki kişi kaçmış sayılmaz.
  const bekleyenHasat = s.istasyonlar.filter((i) => i.hazirSn !== null).length + s.keseler.length
  const hasatPayda = s.hasatGelen - bekleyenHasat
  const hizmetPayda = s.verilen + s.kacan.length
  const hizmet = hizmetPayda > 0 ? s.verilen / hizmetPayda : 0
  const hasat = hasatPayda > 0 ? Math.min(1, s.hasatAlinan / hasatPayda) : hizmet
  const bonus = Math.round(SEZON_BONUS_EN_COK * (0.5 * hasat + 0.5 * hizmet) * 1000) / 1000
  return { hasat, hizmet, bonus }
}
