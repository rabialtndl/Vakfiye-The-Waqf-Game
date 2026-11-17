// Bilgi sorularının İngilizcesi (sorular.json'daki "bilgi" alanının çevirisi, soru kimliğine göre).
// Eser adları ve şehirler çevrilmez: envanterdeki özgün adlarıyla kalır.
import { ingilizce } from '../dil'

const BILGI_EN: Record<string, string> = {
  'cagalzade-bedesteni-konya': 'Judging by its architectural features, however, the building is dated to the 15th–16th centuries.',
  'dolap-mektep-mescidi-konya': 'The masjid has a nearly square rectangular plan, with a flat wooden ceiling inside and a hipped roof outside. Its walls are rubble stone and plastered.',
  'emir-nurettin-sephevan-kumbeti-konya': 'The tomb was built by İbrahim Nureddin, son of Celal, whose identity has not been fully established.',
  'habib-i-neccar-camii-ve-kulliyesi-hatay': 'According to one tradition, Antakya is where Islam began to spread in Anatolia, and the first mosque built in Anatolia is also in Antakya.',
  'hoca-fakih-cesmesi-konya': 'Built as one element of a group of buildings completed as an ensemble over time, the fountain stands on the north wall of the külliye.',
  'hocacihan-sarnici-konya': 'It was filled in spring with water from the river to relieve the water shortage the region suffered in summer when the river dried up.',
  'ince-minareli-medrese-sahip-ata-darulhadis-konya': 'The madrasa has no building inscription; based on its deed, drawn up in AH 662 / 1264 AD, it is accepted to have opened in 1261–62.',
  'kanuni-sultan-suleyman-kervansarayi-hatay': 'Restored by the General Directorate of Foundations in 2004, the caravanserai is lit from above by skylights and by slit windows high in the walls.',
  'karatay-medresesi-konya': 'In the Seljuk era this area formed an important central square together with the Sultan’s Gate of the inner citadel and other nearby schools.',
  'kursunlu-han-hatay': 'According to the court registers of 1831–1834, the inn was at one time used as an armoury, which supports this view.',
  'mevlana-turbesi-muze-konya': 'Bahaeddin Veled, who died in 1231, was the first person buried in the rose garden.',
  'reyhanli-yenisehir-degirmeni-hatay': 'Apart from a cadastral map dating to 1930, no document or record of the registered property has been found.',
  'sahip-ata-sultan-hamami-konya': 'Since the building was built to earn income for the külliye’s mosque and tomb, it must have been built between AH 656–678 / 1258–1279/80.',
  'sircali-medrese-konya': 'The seven-line Arabic inscription, carved in Seljuk thuluth script, states that the madrasa was endowed only for scholars and students of the Hanafi school.',
  'sokullu-mehmet-pasa-kulliyesi-hatay': 'Waystation külliyes like this were built to meet all the needs people had at the time.',
  'sultan-alaeddin-ulu-camii-konya': 'It measures 330 m from east to west and 450 m from north to south. It has an oval plan 20 m high. A water-filled moat surrounds it.',
  'zazadin-sadeddin-kopek-hani-konya': 'The earliest of its inscriptions is the one at the entrance of the covered-courtyard section, dated AH 633 / 1235–36 AD.',
  '3-mintika-466-parsel-konut-hatay': 'Like traditional Antakya houses, the house faces southwest–northeast to make the most of the climate; the house and its courtyard cover 360 m².',
  '4-mintika-78-parsel-eski-ev-hatay': 'The southwest façade of the building faces 40 Yıllık Türk Yurdu Street, and the southeast façade faces Kelebek Street.',
  'abdulmumin-yediler-megaribe-mescidi-ve-mezari-konya': 'The külliye had many foundation properties with rich incomes, such as shops, houses, a bakery, a bathhouse, fields, a mill, water-wheel sites, vineyards, villages, a salt market and farms.',
  'adliye-koyu-camii': 'The mosque is a rectangular wooden building with masonry walls and a tiled hipped roof.',
  'affan-ertugrul-camii-hatay': 'It was restored by the Hatay Regional Directorate of Foundations in 2008.',
  'agalar-boyaci-ali-mescidi-konya': 'According to the Latin-script inscription on the masjid, it was built in AH 958 / 1551 AD, in the reign of Suleiman the Magnificent, by Hasan son of Ali of Aksaray.',
  'agca-mescit-hatay': 'The building was last repaired by the General Directorate of Foundations in 2018.',
  'ahmediye-camii-hatay': 'In the 1997 repair by the General Directorate of Foundations, the wooden cover of the ablution fountain was renewed along with the mosque, and the stones were sanded clean.',
  'ak-sazi-bey-camii-konya': 'The General Directorate of Foundations also carried out a major repair of the mosque in 2008.',
  'aksinne-kumbetli-gunbentli-mescidi-konya': 'A single dome resting on squinches covers the square prayer hall.',
  'akyokus-hoca-cihan-hani-konya': 'There is a record stating that “someone named … had this caravanserai built”.',
  'alemdar-camii-konya': 'First built in 1909, the mosque has not survived to the present in its original form.',
  'ali-cavus-mescidi-hatay': 'The building has an irregular courtyard and a prayer space on a trapezoidal plan covered with a flat wooden ceiling.',
  'ali-efendi-darulhuffazi-muallimhane-konya': 'The square building, about 10 m on each side outside, is covered by a dome resting on an octagonal drum.',
  'ali-gav-zaviyesi-mahmudiye-medresesi-konya': 'In the room at the northwest corner there is a gravestone with a Bektashi headdress belonging to Kemter Baba, dated AH 1261 / 1845 AD.',
  'ali-pasa-camii-konya': 'Outside, the mosque has a deep rectangular plan and is covered by a hipped roof.',
  'altinkalem-cevlek-mescidi-konya': 'It was also repaired by the Regional Directorate of Foundations in 2018.',
  'anber-reis-feridiye-camii-konya': 'The mosque has a rectangular plan running north–south.',
  'arap-dede-turbesi-konya': 'Seyfettin Karasungur is known to have lived between 1266 and 1284, in the reign of Kaykhusraw III. Seyfettin Karasungur was the brother of Celaleddin Karatay.',
  'asagi-mahalle-kiziloren-kandemir-mescidi-konya': 'The plaque above the entrance bears the date AH 1286 / 1869–70 AD. The masjid was repaired by the General Directorate of Foundations in 2001.',
  'askan-camii-konya': 'The people of the neighbourhood regarded him as a saint.',
  'asmali-hatip-sultan-mescidi-konya': 'The masjid has a deep rectangular plan and a hipped roof.',
  'atesbaz-veli-kumbeti-ve-zaviyesi-konya': 'In 1897 Postnişin Abdülvahit Çelebi had a new zaviye built in place of the tomb, which had fallen into ruin over time.',
  'avdan-beldesi-buyuk-eski-camii-konya': 'It was repaired by the General Directorate of Foundations in 2017.',
  'ayanbey-camii-konya': 'It was built in the mid-19th century by Süleyman Bey, son of Memiş Pasha, a member of the Senate.',
  'ayaslar-ulu-yukari-camii-konya': 'Its plan, architectural elements and decoration show that it was built in the 18th–19th centuries.',
  'aziziye-camii-konya': 'West of the Mevlana Külliye, the building is also known as the “Şeyh Ahmet Efendi Mosque” and the “High Mosque”. It was first built in AH 1082–1087 / 1671–1676 AD.',
  'bagevliya-cami-ve-cesmesi-konya': 'It was repaired by the Regional Directorate of Foundations in 2008.',
  'bagevliya-camii-cesmesi-konya': 'It was probably built in the late 19th or early 20th century, however.',
  'balikpazari-camii': 'The building in the city centre was built as a church and later turned into a mosque.',
  'basarakavak-zahide-hatun-camii-konya': 'Outside, the mosque has a rectangular plan and is covered by a hipped roof.',
  'baskoy-ulu-camii-konya': 'Stone was used on the mosque’s façades, with wooden beams laid between the courses.',
  'bayindir-koyu-camii-konya': 'According to the inscription, the mosque was built in AH 767 / 1365–66 AD.',
  'besare-bey-mescidi-konya': 'It is also known as the “Ferhuniye Masjid” after the name of the neighbourhood where it stands.',
  'beyazid-i-bestami-turbesi-hatay': 'Mustafa Şevki Pasha, former Governor-General of Rumelia (and father of Tayfur Sökmen, the first and only President of the Hatay State), had this tomb built in 1890.',
  'beyhekim-mescit-ve-turbesi-konya': 'It stands west of Alâeddin Hill, in the neighbourhood named after it.',
  'beykonak-dedigi-sultan-mescit-ve-tekkesi-konya': 'This building played a very important part in the region becoming Turkish and Muslim.',
  'bulgur-dede-mescidi-konya': 'Its building technique, materials and decoration show, however, that it was built in the 13th century, in the Seljuk period.',
  'burhan-dede-camii-konya': 'The inscription on the building says it was built in 1915. No source has been found, however, about its founder or craftsmen.',
  'burhaneddin-fakih-dede-turbesi-konya': 'It reads: “he departed for the hereafter on a Monday in the middle of the month of Rabi al-Awwal in the year 860”.',
  'buyuk-camii-konya': 'The centrepiece of the ceiling has an eight-armed geometric and floral design, and the arms of the octagon are crowned with palmettes. The mihrab in the middle of the qibla wall dates from 1950.',
  'buyukdede-taskilise-camii-konya': 'At the villagers’ request, the General Directorate of Foundations restored the mosque in 2007 and it was opened for use again.',
  'buyukkovanagzi-haci-haydar-efendi-camii-konya': 'According to the Latin-script inscription to the right of the entrance door, it was built in AH 1305 / 1889–90 AD.',
  'caferiye-mescid-hatay': 'On the northeast side, which faces the street, there is a staircase and, adjoining this wall, …',
  'cataloglu-camii-konya': 'Above the entrance door, however, the date AH 1181 / 1767–68 AD is written in Turkish.',
  'cavundur-camii-konya': 'Later it was plastered with cement inside and out, and the windows were replaced with PVC.',
  'cavus-eski-merkez-cami-konya': 'The mosque was last repaired by the General Directorate of Foundations in 2007–2008.',
  'cavusoglu-camii-konya': 'Built in 1940, in the early years of the Republic, the building was opened for worship in 1949.',
  'cayir-camii-konya': 'The section to the north of the mosque was added in 1965 to enlarge it.',
  'cemal-ali-dede-turut-turbesi-konya': 'The tomb, which carries the original features and style of the Seljuk period, is thought to have been built towards the end of the 13th century.',
  'cetmi-camii-konya': 'Archives and records connected with the mosque give the date AH 1300 / 1882–83 AD.',
  'ciftlikozu-beldesi-camii-konya': 'Built in 1924, in the early years of the Republic, the mosque has wooden pillars and a hipped roof.',
  'cimilli-sari-mescidi-konya': 'Nothing is known about when the masjid was first built or who founded it.',
  'cinaralti-camii-konya': 'Outside, the mosque has a rectangular plan and is covered by a hipped roof.',
  'civiloglu-camii-konya': 'The mosque was built in 1930, in the early period of the Republic.',
  'cukur-camii-konya': 'It was repaired by the Regional Directorate of Foundations in 2013.',
  'cukurkent-koyu-camii-konya': 'The mosque was repaired by the General Directorate of Foundations in 2003.',
  'cuma-orta-camii-konya': 'Most recently, the mosque was repaired by the General Directorate of Foundations in 2003.',
  'dayhane-camii-ve-mustemilati-konya': 'The building was repaired by the General Directorate of Foundations in 2019.',
  'debruz-mescidi-hatay': 'Right next to the masjid is the Hacı Sait Helvacı Fountain, dated 1911.',
  'dedeler-hani-konya': 'The words “Maşallah AH 1285” on a stone above the inn’s entrance show that it was built in 1868–69 AD.',
  'degirmenyolu-mescid-okul-hatay': 'The building is a two-storey masonry structure on a rectangular plan.',
  'deli-osman-hani-konya': 'The inn was restored by the General Directorate of Foundations in 2007. In its present form it is built of rubble stone with wooden beams between the courses and has a hipped roof sloping in four directions.',
  'demirli-mescit-konya': 'In the 1950s the ruined masjid was repaired by the Regional Directorate of Foundations, and it is still open for worship today.',
  'deveci-bekiroglu-camii-hatay': 'The mosque, on parcel 1485 on Gökşen Street in the İplik Pazarı neighbourhood, is built of cut stone.',
  'digin-camii-konya': 'There is no inscription or document, however, about when it was first built or who founded it.',
  'dogrugoz-beldesi-merkez-camii-konya': 'The mosque was decorated in the 1950s by Müslim Gökçek, who also decorated the mosques of Akşehir, Ilgın and Doğanhisar.',
  'dokuzun-derbent-sadiye-igdisleri-hani-konya': 'According to the building inscription on its portal, it was built in 1210, in the reign of Kaykhusraw I, by Emir Hacı İbrahim bin Ebu Bekir, who had Osman bin Abdurrahman build it.',
  'dolap-battal-mescidi-konya': 'The building was repaired by the Regional Directorate of Foundations in 2015–2016.',
  'durak-fakih-camii-konya': 'Above the entrance of the mosque are the dates AH 650 / 1252–53 AD.',
  'ebul-futtuh-camii-hatay': 'It was repaired by the Regional Directorate of Foundations in 2008.',
  'ekmekkocu-mescidi-konya': 'No information has been found about the masjid’s founder either.',
  'el-arabi-turbesi-hatay': 'Around the tomb are various buildings, such as a building used for worship and gatherings, and places for slaughtering and cooking.',
}

/** Soru metni: İngilizcedeyken çevirisi (yoksa Türkçesi). */
export function soruBilgisi(soru: { id: string; bilgi: string }): string {
  return ingilizce() ? (BILGI_EN[soru.id] ?? soru.bilgi) : soru.bilgi
}

/** Envanter cildinin adı: "Konya Vakıf Eserleri Envanteri, II. Cilt" → "Konya Foundation Works Inventory, Vol. II". */
export function kaynakAdi(kaynak: string): string {
  if (!ingilizce()) return kaynak
  return kaynak
    .replace('İli Vakıf Eserleri', 'Province Foundation Works')
    .replace('Vakıf Eserleri Envanteri', 'Foundation Works Inventory')
    .replace('Vakıf Eserleri', 'Foundation Works')
    .replace(/(\w+)\. Cilt/, 'Vol. $1')
    .replace('(Diğer İlçeler)', '(Other Districts)')
}

export const SORU_SAYISI_EN = Object.keys(BILGI_EN).length
