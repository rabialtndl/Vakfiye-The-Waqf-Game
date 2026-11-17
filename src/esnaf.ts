// Şehrin bilgi yerleri: haritada sabit, dokunulabilir yerler (lonca odası, ahi dükkânı, mahalle meydanı, kümbet...).
// Kendiliğinden açılmaz; oyuncu dokununca kaynaklı kısa bilgi gösterilir. Esnaf yerleri ilk okunuşta inşa
// kasasına küçük bir katkı bırakır (oyun başına bir kez).
import { iki } from './dil'
import type { Nokta } from './sahne/harita'

export type EsnafHikayesi = {
  id: string
  kim: string
  simge: string
  baslik: string
  metin: string
  /** Dış kaynak ya da envanterdeki bir eser. */
  kaynak: { ad: string; url?: string; eser?: string }
  /** Haritadaki yeri (ayak noktası) ve yerin adı. */
  yer: Nokta
  yerAd: string
  /** Okununca yapı parasına katkı (esnaf yerleri). */
  odul?: boolean
  /** Gerçek örnekler (envanter türleri), varsa panelde gösterilir. */
  turler?: string[]
  /** Haritada duran kişi: public/insanlar/s<resim>.webp, boyu harita pikseli. Yoksa yalnız binaya dokunulur. */
  kisi?: { resim: number; en: number; boy: number; ayna?: boolean }
  /** Kişinin üstündeki kısa ad (ör. "Lonca kethüdası"). */
  etiket?: string
}

export const ESNAF_ODULU = 3
/** Şehrin bilgi yerleri. */
export const ESNAF_HIKAYELERI: EsnafHikayesi[] = [
  iki({
    id: 'ahi', kim: 'Ahi debbağ', simge: '🧑‍🏭', yer: [1395, 560], yerAd: 'Debbağ dükkânı', odul: true, etiket: 'Ahi', kisi: { resim: 2, en: 17, boy: 34.2 },
    baslik: 'Ahilik',
    metin: 'Ahilik XIII. yüzyıl Anadolu’sunda doğdu; kurucusu Ahi Evran (ö. 1262) sayılır. Esnaf birliklerinin asıl işi malın kalitesini denetlemek ve fiyatını belirlemekti.',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Ahîlik', url: 'https://islamansiklopedisi.org.tr/ahilik' },
  }, { kim: 'Ahi tanner', yerAd: 'Tanner’s shop', etiket: 'Ahi', baslik: 'The Ahi brotherhood', metin: 'The Ahi brotherhood was born in 13th-century Anatolia; Ahi Evran (d. 1262) is considered its founder. The main job of these craft guilds was to check the quality of goods and set their prices.' }),
  iki({
    id: 'arasta', kim: 'Dükkâncı', simge: '🧑‍🍳', yer: [1262, 478], yerAd: 'Çarşı dükkânları', odul: true, etiket: 'Dükkâncı', kisi: { resim: 29, en: 18.2, boy: 36 },
    baslik: 'Mescidin altındaki dükkânlar',
    metin: 'Konya’da Şükran Mescidi’nin alt katındaki üç dükkân bugün de kullanılıyor. Rivayete göre çarşıya uzaktan gelenler işe başlamadan önce mescitte şükür namazı kılardı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Şükran Mescidi zemin kat dükkânları', eser: 'sukran-mescidi-zemin-kat-dukkan-ve-magaza-konya' },
  }, { kim: 'Shopkeeper', yerAd: 'Bazaar shops', etiket: 'Shopkeeper', baslik: 'The shops beneath the masjid', metin: 'In Konya, the three shops on the ground floor of the Şükran Masjid are still in use today. Tradition says that people who came to the bazaar from far away prayed a prayer of thanks in the masjid before starting work.' }),
  iki({
    id: 'avariz', kim: 'Mahalle kethüdası', simge: '🧔', yer: [700, 645], yerAd: 'Mahalle meydanı', odul: true, etiket: 'Avârız vakfı', kisi: { resim: 9, en: 19.4, boy: 36.8 },
    baslik: 'Avârız vakfı',
    metin: 'Bazı mahalleler ve köyler kendi vakıflarını kurardı. Avârız vakfı, halkın ödemekte zorlandığı avârız vergisini, kürekçi bedelini ve ortak ihtiyaçlarını karşılamak için mülk ve para bağışlarıyla kurulurdu.',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Avârız Vakfı', url: 'https://islamansiklopedisi.org.tr/avariz-vakfi' },
  }, { kim: 'Neighbourhood steward', yerAd: 'Neighbourhood square', etiket: 'Avârız foundation', baslik: 'The avârız foundation', metin: 'Some neighbourhoods and villages set up their own foundations. An avârız foundation was established with gifts of property and money to cover the avârız tax that people struggled to pay, the cost of oarsmen and other shared needs.' }),
  iki({
    id: 'lonca', kim: 'Lonca kethüdası', simge: '👳', yer: [1078, 428], yerAd: 'Lonca odası', odul: true, etiket: 'Lonca', kisi: { resim: 7, en: 20.4, boy: 35.4, ayna: true },
    baslik: 'Lonca',
    metin: 'Lonca önce örgütlü esnafın ortak odasının ya da meclisinin adıydı, sonra esnaf birliğinin kendisini anlatır oldu. Kelime belgelerde XVIII. yüzyıldan itibaren yaygınlaştı.',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Lonca', url: 'https://islamansiklopedisi.org.tr/lonca' },
  }, { kim: 'Guild steward', yerAd: 'Guild hall', etiket: 'Guild', baslik: 'The lonca (guild)', metin: 'Lonca first meant the shared room or council of organised tradesmen, and later came to mean the guild itself. The word became common in documents from the 18th century on.' }),
  iki({
    id: 'mutevelli', kim: 'Mütevelli', simge: '📜', yer: [872, 742], yerAd: 'Vakıf sandığı', etiket: 'Mütevelli', kisi: { resim: 0, en: 17.2, boy: 35.4 },
    baslik: 'Vakfiye ve mütevelli',
    metin: 'Vakfiye, vakfedilen bir malın hangi hayır işlerinde kullanılacağını ve nasıl yönetileceğini gösteren senettir. Gelirlerin nasıl harcanacağını, görevlilere ne ödeneceğini yazar; vakfı mütevelli yönetir. Vakfiye ancak kadı tescil edip şer‘î sicile geçirdikten sonra geçerli olurdu. Bu oyunun adı da buradan gelir.',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Vakfiye', url: 'https://islamansiklopedisi.org.tr/vakfiye' },
  }, { kim: 'Trustee', yerAd: 'Foundation chest', etiket: 'Trustee', baslik: 'The vakfiye and the trustee', metin: 'A vakfiye is the deed that says which charitable works an endowed property will serve and how it will be managed. It sets out how the income is spent and what the staff are paid; the trustee (mütevelli) runs the foundation. A vakfiye became valid only after a judge (kadı) registered it in the court records. This game takes its name from it.' }),
  iki({
    id: 'kervan', kim: 'Kervancı', simge: '🐫', yer: [1318, 372], yerAd: 'Han kapısı', etiket: 'Kervancı', kisi: { resim: 26, en: 36.6, boy: 33.6, ayna: true }, odul: true, turler: ['han'],
    baslik: 'Kervansaray',
    metin: 'Kervansaraylar şehirler arasındaki yollar üzerinde, kervanları ve mallarını barındırmak için yapılırdı. Selçuklu sultanları ana ticaret yollarından ara yollara kadar Anadolu’yu kervansaraylarla donattı. Yolcular üç gün boyunca kervansarayın kurucusunun misafiri sayılır, ücret alınmazdı. Örnek: Kayseri–Sivas yolundaki Sultan Hanı (1231).',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Kervansaray', url: 'https://islamansiklopedisi.org.tr/kervansaray' },
  }, { kim: 'Caravaneer', yerAd: 'Inn gate', etiket: 'Caravaneer', baslik: 'The caravanserai', metin: 'Caravanserais were built on the roads between cities to shelter caravans and their goods. The Seljuk sultans lined Anatolia with caravanserais, from the main trade routes to the side roads. For three days travellers were the guests of the caravanserai’s founder and paid nothing. Example: the Sultan Han on the Kayseri–Sivas road (1231).' }),
  iki({
    id: 'bedesten', kim: 'Bezzaz', simge: '🧵', yer: [1410, 455], yerAd: 'Bedesten önü', etiket: 'Bezzaz', kisi: { resim: 4, en: 21.8, boy: 36.2, ayna: true }, odul: true,
    baslik: 'Bedesten',
    metin: 'Bedesten, Osmanlı şehirlerinde çarşının ortasında, kâgir ve sağlam bir ticaret yapısıydı. Mücevher, silah ve değerli kumaşlar burada satılır; tüccarların değerli mallarını koruyan bir çeşit iç kale işi görürdü. Adı “bez”den gelir: bezzâz, bez satan demektir. Bedestenler çoğunlukla vakıf gelirleriyle, bir külliyenin parçası olarak yapılırdı.',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Bedesten', url: 'https://islamansiklopedisi.org.tr/bedesten' },
  }, { kim: 'Cloth merchant', yerAd: 'Bedesten front', etiket: 'Cloth merchant', baslik: 'The bedesten', metin: 'The bedesten was a sturdy stone trading building at the heart of the bazaar in Ottoman cities. Jewels, weapons and fine fabrics were sold there; it served as a kind of inner fortress protecting the merchants’ valuables. Its name comes from “bez” (cloth): a bezzâz is a cloth seller. Bedestens were mostly built with foundation income, as part of a külliye.' }),
  iki({
    id: 'kumbet', kim: 'Türbedar', simge: '🕌', yer: [852, 352], yerAd: 'Kümbet', turler: ['turbe'],
    baslik: 'Kümbet nedir?',
    metin: 'Kümbet, bir bodrum katı üzerinde yükselen, sultan ve emîr gibi önemli kişiler için yapılmış mezar anıtıdır. Gövdesi silindir ya da çokgendir; dıştan konik ya da piramit bir külahla, içten kubbeyle örtülür. Merdivenle inilen alt kat asıl mezar bölümüdür. Büyük Selçuklu döneminde yaygınlaştı, Anadolu’da XV. yüzyıla kadar yapıldı. Ünlü örnekler: Kayseri Döner Kümbet (XIII. yüzyıl sonu), Niğde Hudâvend Hatun Kümbeti (1312), Tercan Mama Hatun Kümbeti (XIII. yüzyıl başı).',
    kaynak: { ad: 'TDV İslâm Ansiklopedisi: Kümbet', url: 'https://islamansiklopedisi.org.tr/kumbet' },
  }, { kim: 'Tomb keeper', yerAd: 'Kümbet', baslik: 'What is a kümbet?', metin: 'A kümbet is a tomb monument rising over a crypt, built for important people such as sultans and emirs. Its body is a cylinder or a polygon, covered outside with a conical or pyramid roof and inside with a dome. The lower floor, reached by stairs, is the actual burial chamber. It spread in the Great Seljuk period and was built in Anatolia until the 15th century. Famous examples: the Döner Kümbet in Kayseri (late 13th century), the Hudâvend Hatun Kümbet in Niğde (1312) and the Mama Hatun Kümbet in Tercan (early 13th century).' }),
]
