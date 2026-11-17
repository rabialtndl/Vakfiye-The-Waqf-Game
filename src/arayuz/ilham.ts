// Oyundaki her binanın çiziminde örnek alınan gerçek eser (Tekinoglu-Firin/web envanteri).
// Metinler o eserin envanter kaydındaki bilgilere dayanır; kaynak eser sayfasında.
import { iki } from '../dil'
import type { AmacId } from '../motor/sabitler'
import type { YapiId } from '../motor/sehir'

export type Ilham = {
  id: string
  tur: string
  /** Kartta gösterilecek fotoğrafın sırası (1'den başlar): binanın dışını en iyi gösteren. */
  foto: number
  neden: string
}

export const ILHAM: Record<'hamam' | 'han' | AmacId, Ilham> = {
  hamam: iki({
    id: 'sahip-ata-sultan-hamami-konya',
    tur: 'hamam',
    foto: 2,
    neden: 'Külliyenin camisine ve türbesine gelir getirmek için yapılmış bir çifte hamam. Oyundaki hamam da aynı işi görür: vakfa para kazandırır. Fil gözlü kubbelerini ve külhan bacasını buradan aldık.',
  }, { neden: 'A double bathhouse built to earn income for the külliye’s mosque and tomb. The bathhouse in the game does the same job: it earns money for the foundation. We took its domes with glass “elephant eyes” and its furnace chimney from here.' }),
  han: iki({
    id: 'zazadin-sadeddin-kopek-hani-konya',
    tur: 'han',
    foto: 1,
    neden: '1235-37 yıllarında yapılan bir Selçuklu kervansarayı. Duvarlarındaki payandalar ona kale görünümü verir, girişi iki renk taştan bir taçkapıdır. Oyundaki han bunlarla çizildi.',
  }, { neden: 'A Seljuk caravanserai built in 1235–37. The buttresses on its walls give it the look of a castle, and its entrance is a portal of two-coloured stone. The inn in the game was drawn from these.' }),
  asevi: iki({
    id: 'orhan-gazi-kulliyesi',
    tur: 'kulliye',
    foto: 1,
    neden: 'Bursa’daki Orhan Gazi Vakfı’nın külliyesi. Kesme taş ve tuğlanın sıra sıra örüldüğü duvarlarını ve kurşun kubbesini oyundaki aşevine taşıdık.',
  }, { neden: 'The külliye of the Orhan Gazi Foundation in Bursa. We brought its walls of alternating cut stone and brick and its lead dome to the soup kitchen in the game.' }),
  medrese: iki({
    id: 'ince-minareli-medrese-sahip-ata-darulhadis-konya',
    tur: 'medrese',
    foto: 2,
    neden: 'Vezir Sahip Ata’nın hadis öğretimi için yaptırdığı medrese (1260’lar). Vakfiyesinde zengin akarları sayılır. Oymalı taçkapısını ve 1901’de yıldırımla üstü yıkılan ince minaresini çizdik.',
  }, { neden: 'The madrasa Vizier Sahip Ata built for teaching hadith (1260s). Its deed lists rich income properties. We drew its carved portal and its slender minaret, whose top was destroyed by lightning in 1901.' }),
  cami: iki({
    id: 'sultan-alaeddin-ulu-camii-konya',
    tur: 'cami',
    foto: 1,
    neden: 'Konya’nın Alâeddin Tepesi’ndeki Selçuklu camisi. 1476 tarihli Evkâf Defteri, Konya ve çevre köylerdeki vakıflarını sayar. Uzun harimini, konik külahlı kümbetini ve tuğla minaresini oyuna aldık.',
  }, { neden: 'The Seljuk mosque on Alâeddin Hill in Konya. The 1476 Evkâf Register lists its foundations in Konya and the surrounding villages. We took its long prayer hall, its kümbet with a conical roof and its brick minaret into the game.' }),
  cesme: iki({
    id: 'hoca-fakih-cesmesi-konya',
    tur: 'cesme',
    foto: 1,
    neden: 'Sille taşı ve Gödene taşıyla, iki renk taşın simetrik dizildiği, teğet kemerli nişli bir çeşme. Oyundaki çeşme bu cepheyi örnek alır.',
  }, { neden: 'A niched fountain with a tangent arch, built of Sille stone and Gödene stone laid in a symmetric two-colour pattern. The fountain in the game follows this façade.' }),
}

/** Şehirdeki yeni yapıların envanterdeki gerçek örnekleri. Köprü için envanterde henüz örnek yok. */
export const YAPI_ILHAM: Partial<Record<YapiId, Ilham>> = {
  arasta: iki({
    id: 'sukran-mescidi-zemin-kat-dukkan-ve-magaza-konya',
    tur: 'han',
    foto: 1,
    neden: 'Konya’da Şükran Mescidi’nin alt katındaki üç dükkân bugün de kullanılıyor. Rivayete göre çarşıya uzaktan gelenler işe başlamadan önce mescitte şükür namazı kılardı: dükkân ile mescit aynı binada.',
  }, { neden: 'In Konya, the three shops on the ground floor of the Şükran Masjid are still in use today. Tradition says that people who came to the bazaar from far away prayed a prayer of thanks in the masjid before starting work: the shop and the masjid are in the same building.' }),
  bedesten: iki({
    id: 'cagalzade-bedesteni-konya',
    tur: 'han',
    foto: 1,
    neden: 'Ereğli çarşısının içinde, beşik tonozlu, üç kapılı bir bedesten. Osmanlı döneminde birçok kez yenilenmiş.',
  }, { neden: 'A barrel-vaulted bedesten with three doors inside the Ereğli bazaar. It was renovated many times in the Ottoman period.' }),
  evler: iki({
    id: 'samandag-vakifli-koyu-konut-hatay',
    tur: 'diger',
    foto: 1,
    neden: 'Samandağ’daki Vakıflı Köyü’nde bahçeli bir vakıf evi: iki katlı taş ev, altta ahır ve mutfak, üstte odalar ve samanlık.',
  }, { neden: 'A foundation house with a garden in the Vakıflı village of Samandağ: a two-storey stone house with a stable and kitchen below and rooms and a hayloft above.' }),
  degirmen: iki({
    id: 'reyhanli-yenisehir-degirmeni-hatay',
    tur: 'diger',
    foto: 1,
    neden: 'Reyhanlı’da Yenişehir Gölü kıyısında taş duvarlı, tonozlu bir değirmen. Tabanında suyu taşıyan tonozlu kanallar uzanır.',
  }, { neden: 'A vaulted mill with stone walls on the shore of Lake Yenişehir in Reyhanlı. Vaulted channels that carry the water run beneath its floor.' }),
  kumbet: iki({
    id: 'emir-nurettin-sephevan-kumbeti-konya',
    tur: 'turbe',
    foto: 1,
    neden: 'Konya’da 13. yüzyılın ikinci yarısından bir Selçuklu kümbeti: sekizgen gövde, içte kubbe, dışta piramit külah. Kitabesinde yaptıranın adı yazılı.',
  }, { neden: 'A Seljuk kümbet in Konya from the second half of the 13th century: an octagonal body, a dome inside and a pyramid roof outside. Its inscription names the person who had it built.' }),
  kervan: iki({
    id: 'kanuni-sultan-suleyman-kervansarayi-hatay',
    tur: 'han',
    foto: 1,
    neden: 'İstanbul–Şam–Hicaz kervan yollarının güvenliği için Belen geçidine kurulan külliye. Yolu korumak, şehre kervan getirmek demekti.',
  }, { neden: 'A külliye built at the Belen pass to keep the Istanbul–Damascus–Hejaz caravan routes safe. Guarding the road meant bringing caravans to the city.' }),
  mektep: iki({
    id: 'dolap-mektep-mescidi-konya',
    tur: 'mescit',
    foto: 1,
    neden: 'Konya’da mahallesine adını veren Dolap Mektep Mescidi. Yanında iki katlı imam evi var.',
  }, { neden: 'The Dolap Mektep Masjid in Konya, which gave its name to its neighbourhood. Next to it is a two-storey imam’s house.' }),
}

/**
 * İlham eserlerinin ad ve yeri. Envanter (internet) yüklenemese de "İlham kaynağı" sekmesi boş kalmasın diye
 * oyunun içinde durur; fotoğraf ve eser kartı ise envanter yüklenirse eklenir. Kaynak: eserin envanter kaydı.
 */
export const ESER_BILGI: Record<string, { ad: string; il: string; ilce?: string }> = {
  'sahip-ata-sultan-hamami-konya': { ad: 'Sahip Ata Sultan Hamamı', il: 'konya' },
  'zazadin-sadeddin-kopek-hani-konya': { ad: 'Zazadin (Sadeddin Köpek) Hanı', il: 'konya' },
  'orhan-gazi-kulliyesi': { ad: 'Orhan Gazi Külliyesi', il: 'bursa' },
  'ince-minareli-medrese-sahip-ata-darulhadis-konya': { ad: 'İnce Minareli Medrese (Sahip Ata Darülhadisi)', il: 'konya' },
  'sultan-alaeddin-ulu-camii-konya': { ad: 'Sultan Alaeddin Ulu Camii', il: 'konya' },
  'hoca-fakih-cesmesi-konya': { ad: 'Hoca Fakih Çeşmesi', il: 'konya' },
  'sukran-mescidi-zemin-kat-dukkan-ve-magaza-konya': { ad: 'Şükran Mescidi (zemin kat dükkânları)', il: 'konya' },
  'cagalzade-bedesteni-konya': { ad: 'Çağalzade Bedesteni', il: 'konya', ilce: 'Ereğli' },
  'samandag-vakifli-koyu-konut-hatay': { ad: 'Vakıflı Köyü vakıf evi', il: 'hatay', ilce: 'Samandağ' },
  'reyhanli-yenisehir-degirmeni-hatay': { ad: 'Yenişehir Değirmeni', il: 'hatay', ilce: 'Reyhanlı' },
  'emir-nurettin-sephevan-kumbeti-konya': { ad: 'Emir Nurettin Sephevan Kümbeti', il: 'konya' },
  'kanuni-sultan-suleyman-kervansarayi-hatay': { ad: 'Kanuni Sultan Süleyman Kervansarayı', il: 'hatay', ilce: 'Belen' },
  'dolap-mektep-mescidi-konya': { ad: 'Dolap Mektep Mescidi', il: 'konya' },
}
