// Leveller: her level envanterdeki gerçek bir vakfın şehri ve hizmetidir.
// Kurallar aynıdır (v2); level yalnızca hizmeti, hedef yılı, yapı hedefini ve senaryoyu (tohum) seçer.
// Senaryolar bot ile tarandı (docs/vakif-oyunu-kurallari-v2.md §15): inşa eden bir oyuncu hepsini geçebilir.
import { iki, L } from './dil'
import { yildiz, type Ayarlar, type Durum } from './motor/motor'
import { SABITLER as S, type AmacId, type OlayId } from './motor/sabitler'
import { ARSALAR, BOLGELER, bolgeAcik, insaKontrol, YAPILAR, type ArsaId } from './motor/sehir'

/** Levelin şehrinde gerçekten yaşanmış bir olay: oyunda o yılın turunda olur ve kaynağıyla anlatılır. */
/** olaySiz: yalnız bilgi notu olarak gösterilir, oyunda olay olmaz (her olay oyunda bir kez yaşanır). */
export type TarihiOlay = { yil: number; olay: OlayId; baslik: string; metin: string; kaynak: { ad: string; url: string }; olaySiz?: boolean }

export type Level = {
  no: number
  /** Oyunun 0. yılının takvim karşılığı. */
  takvim: number
  /** Bu şehirde o yıllarda yaşanmış olaylar (kaynaklı). */
  tarih: TarihiOlay[]
  ad: string
  il: string
  /** null: oyuncu seçer (serbest oyun). */
  amac: AmacId | null
  hedefYil: number
  yapiHedefi: number
  /** null: oyuncunun ayarı. */
  tohum: number | null
  /** Levelin dayandığı gerçek eser; geçince albüme girer. */
  eser: string
  eserTur: string
  eserAd: string
  hikaye: string
  /** Bu levelde öne çıkan zorluk (kartta). */
  zorluk: string
  /** Kısa tehlike etiketi (kartta tek kelime-iki kelime). */
  tehlike: string
  /** Bu levele nasıl hazırlanılır. */
  ipucu: string
}

export const LEVELLER: Level[] = [
  iki({
    no: 1, ad: 'İlk aşevi', il: 'bursa', amac: 'asevi', hedefYil: 200, yapiHedefi: 0, tohum: 192, takvim: 1340,
    tarih: [
      iki({
        yil: 1402, olay: 'savas', baslik: 'Timur’un ordusu Bursa’da',
        metin: 'Ankara Savaşı’nı Osmanlılar kaybetti. Muhammed Sultan komutasındaki Timur ordusu başkent Bursa’ya girdi, sarayı yağmaladı, hazineyi ve saray halkını ele geçirdi.',
        kaynak: { ad: 'Belleten 214: Ankara Savaşı’ndan sonra Bursa sarayının yağmalanması', url: 'https://belleten.gov.tr/ozet/214/eng' },
      }, { baslik: 'Timur’s army in Bursa', metin: 'The Ottomans lost the Battle of Ankara. Timur’s army, led by Muhammad Sultan, entered the capital Bursa, looted the palace and seized the treasury and the palace household.' }),
      iki({
        yil: 1413, olay: 'yangin', baslik: 'Karamanoğlu kuşatması',
        metin: 'Karamanoğlu II. Mehmed Bey Bursa’yı kuşattı ve Orhan Gazi Camii’ni yaktı. Cami 1417’de Bayezid Paşa tarafından onarıldı.',
        kaynak: { ad: 'TDV İslâm Ansiklopedisi: Orhan Gazi Külliyesi', url: 'https://islamansiklopedisi.org.tr/orhan-gazi-kulliyesi' },
      }, { baslik: 'The Karamanid siege', metin: 'Mehmed II of Karaman besieged Bursa and burned the Orhan Gazi Mosque. Bayezid Pasha repaired the mosque in 1417.' }),
    ],
    eser: 'orhan-gazi-kulliyesi', eserTur: 'kulliye', eserAd: 'Orhan Bey Külliyesi',
    hikaye: 'Orhan Gazi Vakfı’nın imareti gibi bir aşevi kur, 200 yıl açık tut.',
    zorluk: 'Öğrenme leveli: olaylar seyrek.',
    tehlike: 'Olaylar seyrek', ipucu: 'Dengeli dağıt, yedek fonu %20 bırak. Deprem olursa fonla onar.',
  }, { ad: 'The first soup kitchen', hikaye: 'Found a soup kitchen like the imaret of the Orhan Gazi Foundation and keep it open for 200 years.', zorluk: 'Learning level: events are rare.', tehlike: 'Rare events', ipucu: 'Spread your money evenly and keep the reserve fund at 20%. If an earthquake hits, repair with the fund.' }),

  iki({
    no: 2, ad: 'Kurak yıllar', il: 'konya', amac: 'cesme', hedefYil: 300, yapiHedefi: 1, tohum: 539, takvim: 1600,
    tarih: [
      iki({
        yil: 1606, olay: 'savas', baslik: 'Celâlî isyanları',
        metin: 'XVII. yüzyılın başında Celâlî isyanları Anadolu’yu kasıp kavurdu. Köylüler topraklarını bırakıp kaçtı, yollar güvensizleşti.',
        kaynak: { ad: 'Küre Ansiklopedisi: Celâlî İsyanları', url: 'https://kureansiklopedi.com/tr/detay/celali-isyanlari-3' },
      }, { baslik: 'The Celali revolts', metin: 'In the early 17th century the Celali revolts ravaged Anatolia. Villagers fled their land and the roads became unsafe.' }),
      iki({
        yil: 1832, olay: 'savas', olaySiz: true, baslik: 'Konya Muharebesi',
        metin: '21 Aralık 1832’de Mısır ordusu İbrahim Paşa komutasında Konya önünde Osmanlı ordusunu yendi.',
        kaynak: { ad: 'TDV İslâm Ansiklopedisi: İbrâhim Paşa, Kavalalı', url: 'https://islamansiklopedisi.org.tr/ibrahim-pasa-kavalali' },
      }, { baslik: 'The Battle of Konya', metin: 'On 21 December 1832 the Egyptian army under Ibrahim Pasha defeated the Ottoman army outside Konya.' }),
      iki({
        yil: 1873, olay: 'kuraklik', baslik: '1873–1875 Orta Anadolu kıtlığı',
        metin: 'Üst üste kurak geçen yıllar Orta Anadolu’da büyük bir kıtlığa yol açtı. Konya da kıtlıktan etkilenen yerler arasındaydı.',
        kaynak: { ad: 'Marmara Üniversitesi: 1873–1875 Orta Anadolu kıtlığı', url: 'https://openaccess.marmara.edu.tr/entities/publication/b2cb551d-66b0-47d8-915f-777e47648e7b' },
      }, { baslik: 'The 1873–1875 Central Anatolian famine', metin: 'Dry years one after another caused a great famine in Central Anatolia. Konya was among the places hit.' }),
    ],
    eser: 'hoca-fakih-cesmesi-konya', eserTur: 'cesme', eserAd: 'Hoca Fakih Çeşmesi',
    hikaye: 'Konya ovasında bir çeşme vakfı. 300 yıl suyu kesme ve şehre bir yapı kazandır.',
    zorluk: 'Kuraklık: tarlalar ürün vermez, 1873 kıtlığı yaklaşıyor.',
    tehlike: 'Kuraklık', ipucu: 'Kuraklıkta tarla ürün vermez: parayı araziye yığma, hamam ve hana dağıt. Artan parayla çarşıya bir yapı kur.',
  }, { ad: 'Dry years', hikaye: 'A fountain foundation on the Konya plain. Keep the water running for 300 years and give the city one new building.', zorluk: 'Drought: the fields yield nothing, and the 1873 famine is coming.', tehlike: 'Drought', ipucu: 'In a drought the fields yield nothing: do not pile your money into farmland, spread it over the bathhouse and the inn. Build in the bazaar with the surplus.' }),

  iki({
    no: 3, ad: 'Yol üstünde medrese', il: 'hatay', amac: 'medrese', hedefYil: 400, yapiHedefi: 2, tohum: 437, takvim: 1580,
    tarih: [
      iki({
        yil: 1822, olay: 'deprem', baslik: '1822 Halep depremi',
        metin: '13 Ağustos 1822’deki deprem Gaziantep’ten Antakya’ya uzanan geniş bir bölgede ağır hasar bıraktı.',
        kaynak: { ad: 'Ümit Ekin: 1822 Halep-Antakya Depremi ve Bölgeye Etkileri', url: 'https://dergipark.org.tr/en/pub/tkidergi/article/1305650' },
      }, { baslik: 'The 1822 Aleppo earthquake', metin: 'The earthquake of 13 August 1822 caused heavy damage across a wide region from Gaziantep to Antakya.' }),
      iki({
        yil: 1872, olay: 'deprem', olaySiz: true, baslik: '1872 Amik depremi',
        metin: '3 Nisan 1872’de Amik Ovası’nda olan deprem Antakya’yı da sarstı; kentte bazı yapılar çöktü.',
        kaynak: { ad: 'Dead Sea Earthquake Catalog: 1872 Amik Gölü depremi', url: 'https://deadseaquake.info/EarthquakeCatalogOfTheDeadSea/1872CEQuake.html' },
      }, { baslik: 'The 1872 Amik earthquake', metin: 'The earthquake in the Amik Plain on 3 April 1872 also shook Antakya; some buildings in the city collapsed.' }),
    ],
    eser: 'sokullu-mehmet-pasa-kulliyesi-hatay', eserTur: 'kulliye', eserAd: 'Sokullu Mehmet Paşa Külliyesi',
    hikaye: 'Payas’taki külliye gibi yol üstünde bir medrese. 400 yıl ders verdir, 2 yapı kur.',
    zorluk: 'Yangın ve savaş sık: çarşı ve kervan yolu tehlikede. Sezonda 4. ürün.',
    tehlike: 'Yangın, savaş', ipucu: 'Yangın hanı vurur, savaş kervan yolunu kapatır. Hana çok yatırma, yedek fonu artır.',
  }, { ad: 'A madrasa on the road', hikaye: 'A madrasa on the road, like the külliye in Payas. Keep teaching for 400 years and build 2 buildings.', zorluk: 'Fires and wars are frequent: the bazaar and the caravan road are in danger. 4th product in the season.', tehlike: 'Fire, war', ipucu: 'Fire strikes the inn and war closes the caravan road. Do not invest too much in the inn; raise the reserve fund.' }),

  iki({
    no: 4, ad: 'Deprem şehri', il: 'hatay', amac: 'cami', hedefYil: 500, yapiHedefi: 3, tohum: 237, takvim: 1500,
    tarih: [
      iki({
        yil: 1822, olay: 'deprem', olaySiz: true, baslik: '1822 Halep depremi',
        metin: '13 Ağustos 1822’deki deprem Gaziantep’ten Antakya’ya uzanan geniş bir bölgede ağır hasar bıraktı.',
        kaynak: { ad: 'Ümit Ekin: 1822 Halep-Antakya Depremi ve Bölgeye Etkileri', url: 'https://dergipark.org.tr/en/pub/tkidergi/article/1305650' },
      }, { baslik: 'The 1822 Aleppo earthquake', metin: 'The earthquake of 13 August 1822 caused heavy damage across a wide region from Gaziantep to Antakya.' }),
      iki({
        yil: 1853, olay: 'deprem', baslik: 'Habib-i Neccar Camii yıkıldı',
        metin: '1853 depreminde Antakya’daki Habib-i Neccar Camii yıkıldı. Osmanlılar eski minareyi koruyarak camiyi yeniden yaptı.',
        kaynak: { ad: 'Middle East Eye: Anatolia’s first mosque heavily destroyed', url: 'https://www.middleeasteye.net/discover/turkey-earthquake-first-mosque-anatolia-destroyed' },
      }, { baslik: 'Habib-i Neccar Mosque destroyed', metin: 'The 1853 earthquake destroyed the Habib-i Neccar Mosque in Antakya. The Ottomans rebuilt the mosque, keeping the old minaret.' }),
      iki({
        yil: 1872, olay: 'deprem', olaySiz: true, baslik: '1872 Amik depremi',
        metin: '3 Nisan 1872’de Amik Ovası’nda olan deprem Antakya’yı da sarstı; kentte bazı yapılar çöktü.',
        kaynak: { ad: 'Dead Sea Earthquake Catalog: 1872 Amik Gölü depremi', url: 'https://deadseaquake.info/EarthquakeCatalogOfTheDeadSea/1872CEQuake.html' },
      }, { baslik: 'The 1872 Amik earthquake', metin: 'The earthquake in the Amik Plain on 3 April 1872 also shook Antakya; some buildings in the city collapsed.' }),
    ],
    eser: 'habib-i-neccar-camii-ve-kulliyesi-hatay', eserTur: 'kulliye', eserAd: 'Habib-i Neccar Camii ve Külliyesi',
    hikaye: 'Antakya’da bir cami vakfı. Hatay depremlerle sık sarsılır: 500 yıl ayakta kal, 3 yapı kur.',
    zorluk: 'Antakya depremlerle anılır: 1853 depremi Habib-i Neccar Camii’ni yıktı. Yedek fon hayati.',
    tehlike: 'Deprem', ipucu: 'Deprem hamamı ve hanı yıkar. Yedek fonu %30 ya da daha fazla yap, araziye pay ayır.',
  }, { ad: 'City of earthquakes', hikaye: 'A mosque foundation in Antakya. Hatay is often shaken by earthquakes: stand for 500 years and build 3 buildings.', zorluk: 'Antakya is known for earthquakes: the 1853 earthquake destroyed the Habib-i Neccar Mosque. The reserve fund is vital.', tehlike: 'Earthquake', ipucu: 'Earthquakes destroy the bathhouse and the inn. Keep the reserve fund at 30% or more and set aside a share for farmland.' }),

]

/** Serbest oyun: her zaman açık, hizmeti oyuncu seçer, 600 yıl. */
export const SERBEST: Level = iki<Level>({
  no: 0, ad: 'Serbest oyun', il: '', amac: null, hedefYil: 600, yapiHedefi: 0, tohum: 10, takvim: 0, tarih: [],
  eser: '', eserTur: '', eserAd: '',
  hikaye: 'Hizmeti sen seç, 600 yıl ayakta kalmaya çalış.',
  zorluk: 'Bütün hizmetler ve kurallar açık.',
  tehlike: 'Hepsi', ipucu: '',
}, { ad: 'Free play', hikaye: 'Choose your service and try to stand for 600 years.', zorluk: 'All services and rules are open.', tehlike: 'All' })

/** Takvim yılını oyun turuna çevirir: olay, o yılı içine alan turda olur (10 yıllık turlar). */
export const tarihiTur = (l: Level, yil: number) => Math.ceil((yil - l.takvim) / S.TUR_YIL) * S.TUR_YIL

export function tarihiOlaylar(l: Level): Record<number, OlayId> {
  return Object.fromEntries(l.tarih.filter((t) => !t.olaySiz).map((t) => [tarihiTur(l, t.yil), t.olay]))
}

/** Rastgele gelen ilk salgında gösterilen kaynaklı bilgi (belli bir şehre ya da yıla bağlı değil). */
export const SALGIN_BILGISI: TarihiOlay = iki<TarihiOlay>({
  yil: 0, olay: 'salgin', baslik: 'Veba salgınları',
  metin: 'Osmanlı topraklarında veba (tâun) salgınları XVI. yüzyılın son çeyreğinden itibaren neredeyse her yıl görüldü. Aynı yüzyılın ikinci yarısında hastalığın bulaşıcı olduğu görüşü ağırlık kazandı.',
  kaynak: { ad: 'TDV İslâm Ansiklopedisi: Tâun', url: 'https://islamansiklopedisi.org.tr/taun' },
}, { baslik: 'Plague epidemics', metin: 'From the last quarter of the 16th century, plague (tâun) broke out in Ottoman lands almost every year. In the second half of that century the view that the disease was contagious gained ground.' })

/** Bu turda yaşanan tarihi olay (varsa). */
export function buTurunTarihi(d: Durum): TarihiOlay | null {
  const l = levelBul(d.ayarlar.levelNo)
  if (!l.no || !d.sonTur) return null
  return l.tarih.find((t) => tarihiTur(l, t.yil) === d.sonTur!.yil) ?? null
}

export const levelBul = (no: number | undefined): Level => LEVELLER.find((l) => l.no === no) ?? SERBEST

/** Pasaportta o şehirden bir pul varsa o şehrin levelleri erken açılır. */
export const sehirdenPul = (il: string, pullar: string[]) => !!il && pullar.some((p) => p.endsWith(`-${il}`))

export function levelAcik(l: Level, gecilen: Record<string, number>, pullar: string[]): boolean {
  if (l.no <= 1) return true
  return (gecilen[l.no - 1] ?? 0) > 0 || sehirdenPul(l.il, pullar)
}

/** Kurulum ayarlarına levelin sabitlerini işler. */
export function levelAyarlari(l: Level, a: Ayarlar): Ayarlar {
  return {
    ...a,
    amac: l.amac ?? a.amac,
    tohum: l.tohum ?? a.tohum,
    hedefYil: l.no ? l.hedefYil : undefined,
    takvim: l.no ? l.takvim : undefined,
    tarihiOlaylar: l.no ? tarihiOlaylar(l) : undefined,
    levelNo: l.no || undefined,
    yapiHedefi: l.yapiHedefi || undefined,
  }
}

export const yapiSayisiToplam = (d: Durum) => Object.keys(d.yapilar).length

/** Level geçildi mi: hedef yıla ayakta varmak ve yapı hedefini tutturmak. */
export function levelGecildi(d: Durum): boolean {
  return d.sonuc === 'ayakta' && yapiSayisiToplam(d) >= (d.ayarlar.yapiHedefi ?? 0)
}

/** Sezon mini oyununun zorluğu (1–4). Serbest oyun orta zorlukta. */
export const sezonZorlugu = (d: Durum) => d.ayarlar.levelNo ?? 2

/** Yıldız: level geçilmediyse en çok 1 (ayakta kalsa bile hedef tutmadı). */
export const levelYildizi = (d: Durum): number => (d.ayarlar.levelNo && !levelGecildi(d) ? Math.min(1, yildiz(d)) : yildiz(d))

export type Hedef = { id: 'yil' | 'yapi'; ad: string; tamam: boolean; ilerleme: string | null; nasil: string }

/** Levelin hedefleri; oyun varsa ilerlemesiyle ve "şimdi ne yapmalıyım" ipucuyla. */
export function levelHedefleri(l: Level, d?: Durum, pulSayisi = 0): Hedef[] {
  const hayrat = S.AMACLAR[(l.amac ?? d?.ayarlar.amac ?? 'asevi') as AmacId].ad.toLocaleLowerCase(L('tr', 'en'))
  const h: Hedef[] = [
    {
      id: 'yil',
      ad: L(`${l.hedefYil}. yıla kadar ${hayrat} açık kalsın`, `Keep the ${hayrat} open until year ${l.hedefYil}`),
      tamam: d?.sonuc === 'ayakta',
      ilerleme: d ? L(`${d.yil} / ${l.hedefYil} yıl`, `${d.yil} / ${l.hedefYil} years`) : null,
      nasil: L('Sandık üst üste birkaç tur boş kalırsa vakıf çöker. Yedek fon kötü günde onarım yapar.', 'If the chest stays empty for several rounds in a row, the foundation collapses. The reserve fund pays for repairs on bad days.'),
    },
  ]
  if (l.yapiHedefi > 0) {
    const kurulan = d ? yapiSayisiToplam(d) : 0
    h.push({
      id: 'yapi',
      ad: L(`${l.yapiHedefi} yeni yapı kur`, `Build ${l.yapiHedefi} new building${l.yapiHedefi > 1 ? 's' : ''}`),
      tamam: kurulan >= l.yapiHedefi,
      ilerleme: d ? L(`${kurulan} / ${l.yapiHedefi} yapı`, `${kurulan} / ${l.yapiHedefi} buildings`) : null,
      nasil: d ? yapiIpucu(d, pulSayisi) : L('Hizmetten artan para yapı parasında birikir. Çarşı 50. yılda açılır: “Şehri gör”e bas, boş arsaya dokun, yapıyı kur.', 'Money left over after the service collects in building money. The bazaar opens in year 50: tap “See the city”, tap an empty plot and build.'),
    })
  }
  return h
}

/** Yapı hedefi için şu anki durumdan bir sonraki adım. */
export function yapiIpucu(d: Durum, pulSayisi = 0): string {
  const adaylar = (Object.keys(ARSALAR) as ArsaId[]).flatMap((a) => ARSALAR[a].izin.map((y) => ({ a, y })))
  const kurulur = adaylar.filter(({ a, y }) => insaKontrol(d, a, y, pulSayisi).olur).sort((x, z) => YAPILAR[x.y].maliyet - YAPILAR[z.y].maliyet)
  if (kurulur.length) {
    const { y } = kurulur[0]
    return L(`Şimdi kurabilirsin: “Şehri gör”e bas, ${YAPILAR[y].ad} tabelasına dokun (${YAPILAR[y].maliyet} akçe).`, `You can build now: tap “See the city”, then tap the ${YAPILAR[y].ad} sign (${YAPILAR[y].maliyet} akçe).`)
  }
  const acikArsa = adaylar.filter(({ a }) => !d.yapilar[a] && bolgeAcik(ARSALAR[a].bolge, d.yil, pulSayisi))
  if (!acikArsa.length) {
    const b = (Object.keys(BOLGELER) as (keyof typeof BOLGELER)[]).find((k) => !bolgeAcik(k, d.yil, pulSayisi))
    return b ? L(`${BOLGELER[b].ad} ${BOLGELER[b].yil}. yılda açılır (ya da ${BOLGELER[b].pul} pasaport puluyla). O zamana kadar ▶ OYNA.`, `${BOLGELER[b].ad} opens in year ${BOLGELER[b].yil} (or with ${BOLGELER[b].pul} passport stamps). Until then, ▶ PLAY.`) : L('Bütün arsalar dolu.', 'All plots are taken.')
  }
  const enUcuz = Math.min(...acikArsa.map(({ y }) => YAPILAR[y].maliyet))
  return L(`Yapı parasında ${Math.floor(d.artan)} akçe var, en ucuz yapı ${enUcuz} akçe. Hizmetten artan para biriktikçe kurabilirsin.`, `The building money has ${Math.floor(d.artan)} akçe; the cheapest building costs ${enUcuz} akçe. You can build as the surplus from the service adds up.`)
}
