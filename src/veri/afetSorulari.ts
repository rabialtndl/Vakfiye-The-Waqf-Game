// Felaket anında sorulan iki şıklı sorular. Hepsi sitedeki (vakfiye.vercel.app) eser kayıtlarından
// alınmıştır; kaynak düğmesi oyuncuyu o eserin site sayfasına götürür. Oyunda dış kaynak adı ya da bağlantısı yok.
// Doğru bilinirse afet söner (hasar azalır), yanlışta doğrusu ve kısa açıklaması gösterilir.
// Yeni soru eklerken eser sayfasını açıp bilgiyi doğrulayın.
import type { MudahaleTuru } from '../mudahale'
import { iki } from '../dil'

/** Soru sorulan olaylar: kararlı afetler (yangın, deprem), salgın, kuraklık ve savaş. */
export type AfetTuru = MudahaleTuru | 'kuraklik' | 'savas'

export type AfetSorusu = {
  id: string
  tur: AfetTuru
  soru: string
  /** İki şık; doğru olan `dogru` sırasındaki. Ekranda yerleri karıştırılır. */
  secenekler: [string, string]
  dogru: 0 | 1
  /** Cevaptan sonra gösterilen bir-iki cümle. */
  aciklama: string
  /** Envanterdeki yeri ve sitedeki eser kimliği (sayfası: /tr/eser/<eser>). */
  kaynak: { ad: string; eser: string }
}

const HAM_SORULAR: AfetSorusu[] = [
  // ---------- Deprem ----------
  {
    id: 'd-molla-fenari', tur: 'deprem',
    soru: '1855 Bursa depreminde Molla Fenârî Camii’ne ne oldu?',
    secenekler: ['Duvarları yıkıldı, minaresi ağır hasar gördü', 'Hiç zarar görmedi'], dogru: 0,
    aciklama: 'Envanter, caminin duvarlarının yıkıldığını ve minaresinin ağır hasar aldığını kaydeder.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Molla Fenârî Camii ve Haziresi, s. 398', eser: 'molla-fenari-camii' },
  },
  {
    id: 'd-uftade', tur: 'deprem',
    soru: '1855 Bursa depreminde ana kubbesi yıkılan Hz. Üftâde Camii’ni kim onarttı?',
    secenekler: ['Serasker Hasan Rıza Paşa', 'Fatih Sultan Mehmed'], dogru: 0,
    aciklama: 'Cami, H. 1283 / M. 1866’da Serasker Hasan Rıza Paşa tarafından onarıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Hz. Üftâde Camii, s. 452', eser: 'hz-uftade-camii' },
  },
  {
    id: 'd-veli-semseddin', tur: 'deprem',
    soru: '1855 depreminde kubbesi yıkılan Veli Şemseddin Camii’nde kubbenin yerine ne yapıldı?',
    secenekler: ['Kiremit örtülü kırma çatı', 'Yeni bir taş kubbe'], dogru: 0,
    aciklama: 'Kubbe yıkılınca yerine kiremit örtülü bir kırma çatı yapıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Veli Şemseddin (Yahni Kapan) Camii ve Haziresi, s. 471', eser: 'veli-semseddin-camii' },
  },
  {
    id: 'd-yer-kapi', tur: 'deprem',
    soru: '1855 depreminde kubbesi çöken Yer Kapı Camii bir süre ne olarak kullanıldı?',
    secenekler: ['Depo', 'Hastane'], dogru: 0,
    aciklama: 'Cami ahşap bir kırma çatıyla onarıldı ve bir süre depo olarak kullanıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Yer Kapı (Kara Ali Paşa - Bab-ı Zemin) Camii, s. 480', eser: 'yer-kapi-camii' },
  },
  {
    id: 'd-kucukkumla', tur: 'deprem',
    soru: 'Gemlik’teki Küçükkumla Eski Camii 1999 depreminde nasıl bir hasar gördü?',
    secenekler: ['Minaresi hariç tamamen yıkıldı', 'Yalnızca minaresi yıkıldı'], dogru: 0,
    aciklama: 'Envantere göre cami, 1999 depremi sırasında minaresi dışında tamamen yıkıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Küçükkumla Eski (Hacı Muhyi) Camii, s. 127', eser: 'kucukkumla-eski-camii' },
  },
  {
    id: 'd-ortakoy', tur: 'deprem',
    soru: 'Konya’daki Ortaköy Merkez Camii’nin 1963’te yapılan minaresine 2000 depreminde ne oldu?',
    secenekler: ['Büyük bölümü yıkıldı', 'Hiç etkilenmedi'], dogru: 0,
    aciklama: 'Kuzeydoğu köşedeki minarenin büyük bölümü 2000 depreminde yıkıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Ortaköy Beldesi Merkez Camii, s. 360', eser: 'ortakoy-beldesi-merkez-camii-konya' },
  },
  {
    id: 'd-mahremiye', tur: 'deprem',
    soru: 'Antakya’daki Mahremiye Camii hangi depremde ağır hasar aldı?',
    secenekler: ['1872 Antakya depreminde', '1509 İstanbul depreminde'], dogru: 0,
    aciklama: 'Cami 1872 depreminde ağır hasar aldı, sonradan kendini toparladı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Mahremiye Camii, s. 278-283', eser: 'mahremiye-camii-hatay' },
  },
  {
    id: 'd-terazi', tur: 'deprem',
    soru: 'Mahremiye Camii’ndeki “deprem terazisi” denilen sütunceler ne yapabilir?',
    secenekler: ['Dikey eksenleri etrafında dönebilir', 'Deprem olunca ses çıkarır'], dogru: 0,
    aciklama: 'Mihrap nişinin iki yanındaki bu sütuncelerin dönebildiği, şiddetli depremlere rağmen hâlâ döndüğü belirtilir.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Mahremiye Camii, s. 278-283', eser: 'mahremiye-camii-hatay' },
  },
  // ---------- Yangın ----------
  {
    id: 'y-aziziye', tur: 'yangin',
    soru: '1867’de Konya Çarşısı’nda çıkan yangında hangi cami yandı?',
    secenekler: ['Aziziye Camii', 'Süleymaniye Camii (İstanbul)'], dogru: 0,
    aciklama: 'Aziziye ve Kapu camileri yandı; Konya Valisi Ahmet Tevfik Paşa yeniden yapım için sadrazamdan yardım istedi.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Aziziye Camii, s. 280', eser: 'aziziye-camii-konya' },
  },
  {
    id: 'y-uzun-seyh', tur: 'yangin',
    soru: 'Konya’daki Uzun Şeyh (Şıh) Camii’ni 2005’te yakan yangın nereden çıktı?',
    secenekler: ['Elektrik kontağından', 'Devrilen bir mumdan'], dogru: 0,
    aciklama: 'Cami, beden duvarları ve minaresi hariç tümüyle yandı; 2008 Ekim’inde yeniden ibadete açıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Uzun Şeyh (Şıh) Camii, s. 479', eser: 'uzun-seyh-sih-camii-konya' },
  },
  {
    id: 'y-iplikci', tur: 'yangin',
    soru: 'Akşehir’deki İplikçi (Ambardar Kerim Ağa) Camii’ne 1894’te zarar veren yangın nerede çıktı?',
    secenekler: ['Caminin çevresindeki iplikçi dükkânlarında', 'Caminin kendi kubbesinde'], dogru: 0,
    aciklama: 'Yangında başta kubbeler olmak üzere hasar gören cami, Akşehir Müftüsü Salim Efendi’nin çabasıyla onarıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: İplikçi (Ambardar Kerim Ağa) Camii, s. 347', eser: 'iplikci-ambardar-kerim-aga-camii-konya' },
  },
  {
    id: 'y-ibrahim-bey', tur: 'yangin',
    soru: '1858 yangınında tamamen yanan İbrahim Bey (Çarşı) Camii’nin yerine 1859’da ne yapıldı?',
    secenekler: ['Halk, ebatlarını büyüterek yeni bir cami yaptırdı', 'Yer boş bırakıldı'], dogru: 0,
    aciklama: 'Vakıf kayıtlarına göre yanan caminin yerine halk, ebatlarını büyüterek yeniden cami yaptırdı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: İbrahim Bey (Çarşı) Camii, s. 458', eser: 'ibrahim-bey-carsi-camii-konya' },
  },
  {
    id: 'y-sahip-ata', tur: 'yangin',
    soru: 'Sahip Ata (Larende) Camii yangında zarar gördü. Bugüne hangi bölümleri ulaşabildi?',
    secenekler: ['Kıble duvarı, mihrap ve taç kapı', 'Yalnızca minare'], dogru: 0,
    aciklama: 'Yangında çok zarar gören camiden günümüze yalnızca kıble duvarı, mihrap ve taç kapısı gelebildi.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Sahip Ata (Larende) Camii, s. 125', eser: 'sahip-ata-larende-camii-konya' },
  },
  {
    id: 'y-nalbantoglu', tur: 'yangin',
    soru: 'Bursa’daki Nalbantoğlu Camii 1518’de hangi afetten ağır hasar aldı?',
    secenekler: ['Yangından', 'Selden'], dogru: 0,
    aciklama: 'Cami 1518’deki yangında ve 1855 depreminde ağır hasar aldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Nalbantoğlu Camii, s. 407', eser: 'nalbantoglu-camii' },
  },
  // ---------- Savaş ----------
  {
    id: 's-kursunlu', tur: 'savas',
    soru: 'Antakya’daki Kurşunlu Han’ın kurşunları, savaşların arttığı yıllarda muhtemelen ne için sökülmüştür?',
    secenekler: ['Cephane yapımında kullanmak için', 'Satıp vakfa gelir sağlamak için'], dogru: 0,
    aciklama: 'Envanter, kurşunların muhtemelen çetin savaşların arttığı 18-19. yüzyıllarda cephane için sökülmüş olduğunu belirtir; han bir ara cephanelik de olmuştur.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Kurşunlu Han, s. 468-473', eser: 'kursunlu-han-hatay' },
  },
  {
    id: 's-alaeddin-dunya', tur: 'savas',
    soru: 'I. ve II. Dünya Savaşı yıllarında Konya’daki Sultan Alâeddin (Ulu) Camii’ne ne oldu?',
    secenekler: ['İbadete kapatıldı', 'Cephe hastanesine çevrildi'], dogru: 0,
    aciklama: 'Envantere göre cami savaş yıllarında ibadete kapatıldı; 1952’de Vakıflar Genel Müdürlüğü’ne devredilip ibadete açıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Sultan Alâeddin (Ulu) Camii, s. 308', eser: 'sultan-alaeddin-ulu-camii-konya' },
  },
  {
    id: 's-alaeddin-kale', tur: 'savas',
    soru: '1190’daki Haçlı kuşatmasında Konya’nın iç kalesi ne oldu?',
    secenekler: ['Alınamadı', 'Üç günde düştü'], dogru: 0,
    aciklama: 'Envanter, iç kalenin alınamamasını kalenin ne kadar sağlam olduğunun bir delili sayar.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Sultan Alâeddin (Ulu) Camii, s. 304', eser: 'sultan-alaeddin-ulu-camii-konya' },
  },
  {
    id: 's-nasuh', tur: 'savas',
    soru: 'Konya’daki Nasuh Bey Camii, Osmanlı döneminde kütüphane olarak kullanıldıktan sonra hangi işlevi gördü?',
    secenekler: ['Askerî malzeme deposu', 'Kervansaray'], dogru: 0,
    aciklama: 'Cami sonradan askerî malzeme deposu ve belediyenin gaz deposu oldu; 1977’de yeniden ibadete açıldı.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Nasuh Bey Camii, s. 151', eser: 'nasuh-bey-camii-canbazzade-nasuh-bey-darul-huffazi-konya' },
  },
  {
    id: 's-selvili', tur: 'savas',
    soru: 'Antakya’daki Selvili Camii’nin kitabelerine göre 1873’te camiyi yaptıran ya da onartan Abdullah nasıl biridir?',
    secenekler: ['Savaşta şehit düşmüş biri', 'Hacca giden bir tüccar'], dogru: 0,
    aciklama: 'Kitabeler, camiyi yaptıranın savaşta şehit düştüğünü ve şehitlere “ölü” denilemeyeceğini söyler; yapı büyük Antakya depreminden bir yıl sonra yapılmıştır.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Selvili Camii, s. 382-385', eser: 'selvili-camii-hatay' },
  },
  {
    id: 's-yenisehir', tur: 'savas',
    soru: 'Reyhanlı’daki Yenişehir Camii (1899) hangi gelişmenin sonucunda artan ihtiyaçtan doğdu?',
    secenekler: ['Zorunlu iskân ve 1877/78 Rus harbinden kaçan muhacirlerin yerleştirilmesi', 'Bir deniz zaferinin kutlanması'], dogru: 0,
    aciklama: 'Aşiretlerin iskânı ve harpten kaçan muhacirlerin yerleştirilmesi, bölgede cami, mektep, hamam ve iş yeri ihtiyacını artırmıştır.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Yenişehir Camii, s. 368-373', eser: 'yenisehir-camii-hatay' },
  },
  {
    id: 's-dursun', tur: 'savas',
    soru: 'Dursun Fakih, Osman Gazi’nin yanında savaşlara hangi görevle katıldı?',
    secenekler: ['İmam olarak; cephelerde mücahitleri teşvik etti', 'Ordu kumandanı olarak'], dogru: 0,
    aciklama: 'Envanter, Dursun Fakih’in imam olarak savaşlara katıldığını ve mücahitleri gazâya teşvik ettiğini kaydeder.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Tahir Paşa (Dursun Fakih) Camii, s. 111', eser: 'tahir-pasa-tursunoglu-dursun-fakih-camii-konya' },
  },
  {
    id: 's-karpuzoglu', tur: 'savas',
    soru: 'Konya’daki Kadı İzzettin Camii’nin banisi Kadı İzzeddin nasıl vefat etti?',
    secenekler: ['Aksaray yakınında Moğollarla yapılan savaşta şehit düştü', 'Bir depremde enkaz altında kaldı'], dogru: 0,
    aciklama: 'Selçuklu vezirlerinden Kadı İzzeddin, Aksaray yakınlarında Moğollarla yapılan savaşta şehit düşmüştür.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Kadı İzzettin (Karpuzoğlu) Camii, s. 217', eser: 'kadi-izzettin-karpuzoglu-camii-konya' },
  },
  // ---------- Salgın ----------
  {
    id: 'sl-bulgur', tur: 'salgin',
    soru: 'Konya’da “bulgurcuk” denen kaşıntılı hastalığa yakalananlar nereye getirilirdi?',
    secenekler: ['Bulgur Dede Mescidi’ne (Bulgur Tekkesi)', 'Karatay Medresesi’ne'], dogru: 0,
    aciklama: 'İbrahim Hakkı Konyalı’ya göre hastalar buraya getirilir, burada şifa bulacakları inanılırdı; tekkenin adı bu yüzden Bulgur Tekkesi olmuştur.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Bulgur Dede Mescidi, s. 75', eser: 'bulgur-dede-mescidi-konya' },
  },
  {
    id: 'sl-sakahane', tur: 'salgin',
    soru: 'Yusuf Küçükdağ’a göre Konya’daki Sakahane (Hıdır İlyas) Mescidi hangi yapının mescididir?',
    secenekler: ['Alâeddin Keykubad’ın yaptırdığı şifahanenin', 'Bir kervansarayın'], dogru: 0,
    aciklama: 'Küçükdağ, yapının Alâeddin Keykubad’ın yaptırdığı şifahanenin mescidi olduğunu söyler; Konyalı ise bir hayırsever Davut Ağa’nın yaptırdığını yazar.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Sakahane (Hıdır İlyas - Davut Ağa) Mescidi, s. 295', eser: 'sakahane-hidir-ilyas-davut-aga-mescidi-konya' },
  },
  {
    id: 'sl-karpuzoglu', tur: 'salgin',
    soru: 'Konya’daki Kadı İzzettin Camii’nin vakfiyesinde cami dışında hangi sağlık yapısı kayıtlıdır?',
    secenekler: ['Dârüşşifa (hastane)', 'Buz kuyusu'], dogru: 0,
    aciklama: 'Vakfiyede cami dışında türbe, medrese ve dârüşşifa gibi yapılar da kayıtlıdır.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Kadı İzzettin (Karpuzoğlu) Camii, s. 217', eser: 'kadi-izzettin-karpuzoglu-camii-konya' },
  },
  {
    id: 'sl-sems', tur: 'salgin',
    soru: 'Konya’da halk, Şems Türbesi’nin avlusundaki kuyunun suyunu cumartesi günleri neden içerdi?',
    secenekler: ['Şifa niyetine', 'Yağmur duası için'], dogru: 0,
    aciklama: 'Kaynaklar, suyun yazılı sarı bir tastan şifa niyetine içildiğini ve yürek kalkmasına iyi geldiğinin söylendiğini belirtir.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Şems-i Tebrizi Camii ve Türbesi, s. 225', eser: 'sems-i-tebrizi-camii-ve-turbesi-konya' },
  },
  {
    id: 'sl-seyh-isa', tur: 'salgin',
    soru: 'Hatay’daki Şeyh İsa Türbesi’ni ziyaret edenler hangi dilekle dua eder?',
    secenekler: ['Hastalıklarına şifa bulmak', 'Kuraklıktan kurtulmak'], dogru: 0,
    aciklama: 'Hastalıklarına şifa bulmak ve çocuk sahibi olmak isteyenler türbeyi ziyaret edip dua eder.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Şeyh İsa Türbesi, s. 428-429', eser: 'seyh-isa-turbesi-hatay' },
  },
  {
    id: 'sl-hamam', tur: 'salgin',
    soru: 'Konya’daki Sahip Ata (Sultan) Hamamı hangi adla da anılır?',
    secenekler: ['Şifa Sultan Hamamı', 'Hastane Hamamı'], dogru: 0,
    aciklama: 'Hamam, Hamam-ı Sultanî, Larende Kapısı Hamamı ve Şifa Sultan Hamamı gibi adlarla da anılır.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Sahip Ata (Sultan) Hamamı, s. 212', eser: 'sahip-ata-sultan-hamami-konya' },
  },
  // ---------- Kuraklık ----------
  {
    id: 'k-hocacihan', tur: 'kuraklik',
    soru: 'Yazın ırmağın kuruduğu Hocacihan bölgesinde su sıkıntısını gidermek için sarnıç nasıl doldurulurdu?',
    secenekler: ['Baharda ırmaktan alınan suyla', 'Yazın kuyudan çekilen suyla'], dogru: 0,
    aciklama: 'Yaz aylarında ırmak suyunun kurumasıyla çekilen su sıkıntısını gidermek için sarnıç bahar aylarında ırmaktan alınan suyla doldurulurdu.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Hocacihan Sarnıcı, s. 239', eser: 'hocacihan-sarnici-konya' },
  },
  {
    id: 'k-hocacihan-han', tur: 'kuraklik',
    soru: 'Hocacihan Sarnıcı yakınındaki hangi yapıya su sağlardı?',
    secenekler: ['Hocacihan (Dibidelik) Hanı’na', 'Mevlâna Türbesi’ne'], dogru: 0,
    aciklama: 'Sarnıcın önemli özelliklerinden biri, yakınındaki Hocacihan Hanı’na su sağlamasıdır.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Hocacihan Sarnıcı, s. 239', eser: 'hocacihan-sarnici-konya' },
  },
  {
    id: 'k-sokullu', tur: 'kuraklik',
    soru: 'Payas’taki Sokullu Mehmet Paşa Külliyesi’nde taç kapıların yanındaki çeşmeler ne için yapılmıştır?',
    secenekler: ['Yolcuların su ihtiyacını gidermek için', 'Hamamın suyunu ısıtmak için'], dogru: 0,
    aciklama: 'Kuzey ve güney taç kapıların yanındaki, suyu kesintisiz akan çeşmeler yolcuların su ihtiyacı için hazır bulunur.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Sokullu Mehmet Paşa Külliyesi, s. 95-120', eser: 'sokullu-mehmet-pasa-kulliyesi-hatay' },
  },
  {
    id: 'k-affan', tur: 'kuraklik',
    soru: 'Antakya’daki Affan (Ertuğrul) Camii’nin avlu duvarındaki 1926 tarihli çeşme kimlere su verir?',
    secenekler: ['Susayanlara', 'Yalnızca cemaate'], dogru: 0,
    aciklama: '1926’da yapılan çeşme susayanlara su verir; avludaki şadırvanla birlikte camiyi uzaktakilere de hissettirir.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Affan (Ertuğrul) Camii, s. 198-205', eser: 'affan-ertugrul-camii-hatay' },
  },
  {
    id: 'k-hoca-fakih', tur: 'kuraklik',
    soru: 'Konya’daki Hoca Fakih Çeşmesi’nin cephesinde çeşmeyle birlikte hangi su yapıları bulunur?',
    secenekler: ['Sebil ve sarnıç', 'Değirmen ve hamam'], dogru: 0,
    aciklama: 'Çeşme, aynı cephede sebil ve sarnıç yapılarıyla bir arada bulunur.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Hoca Fakih Çeşmesi, s. 231', eser: 'hoca-fakih-cesmesi-konya' },
  },
  {
    id: 'k-hedbeli', tur: 'kuraklik',
    soru: 'Antakya’daki Hedbeli Mescidi’nin avlusunda mahalle halkına her daim hizmet veren su yapıları hangileridir?',
    secenekler: ['Çeşme, kuyu ve sebil', 'Havuz ve değirmen'], dogru: 0,
    aciklama: 'Avlu duvarındaki çeşme, kuyu ve sebil mahalle halkına her daim hizmet verir.',
    kaynak: { ad: 'Vakıf Katılım envanteri: Hedbeli Mescidi, s. 232-237', eser: 'hedbeli-mescidi-hatay' },
  },
]

type Ceviri = Pick<AfetSorusu, 'soru' | 'secenekler' | 'aciklama'>

/** İngilizceleri (soru kimliğine göre). */
const EN: Record<string, Ceviri> = {
  'd-molla-fenari': { soru: 'What happened to the Molla Fenârî Mosque in the 1855 Bursa earthquake?', secenekler: ['Its walls collapsed and its minaret was heavily damaged', 'It was not damaged at all'], aciklama: 'The inventory records that the mosque’s walls collapsed and its minaret was heavily damaged.' },
  'd-uftade': { soru: 'Who had the Hz. Üftâde Mosque repaired after its main dome collapsed in the 1855 Bursa earthquake?', secenekler: ['Serasker Hasan Rıza Pasha', 'Mehmed the Conqueror'], aciklama: 'The mosque was repaired in AH 1283 / AD 1866 by Serasker Hasan Rıza Pasha.' },
  'd-veli-semseddin': { soru: 'What was built in place of the dome of the Veli Şemseddin Mosque after it collapsed in 1855?', secenekler: ['A hipped roof covered with tiles', 'A new stone dome'], aciklama: 'When the dome collapsed, a hipped roof covered with tiles was built in its place.' },
  'd-yer-kapi': { soru: 'What was the Yer Kapı Mosque, whose dome collapsed in the 1855 earthquake, used as for a while?', secenekler: ['A warehouse', 'A hospital'], aciklama: 'The mosque was repaired with a wooden hipped roof and was used as a warehouse for a period.' },
  'd-kucukkumla': { soru: 'How was the Küçükkumla Old Mosque in Gemlik damaged in the 1999 earthquake?', secenekler: ['It was completely destroyed except for its minaret', 'Only its minaret collapsed'], aciklama: 'According to the inventory, the mosque was completely destroyed except for its minaret.' },
  'd-ortakoy': { soru: 'What happened in the 2000 earthquake to the minaret, built in 1963, of the Ortaköy Central Mosque in Konya?', secenekler: ['Most of it collapsed', 'It was not affected at all'], aciklama: 'Most of the minaret in the northeast corner collapsed in the 2000 earthquake.' },
  'd-mahremiye': { soru: 'In which earthquake was the Mahremiye Mosque in Antakya heavily damaged?', secenekler: ['The 1872 Antakya earthquake', 'The 1509 Istanbul earthquake'], aciklama: 'The mosque was heavily damaged in the 1872 earthquake but recovered afterwards.' },
  'd-terazi': { soru: 'What can the small columns called “earthquake scales” in the Mahremiye Mosque do?', secenekler: ['Rotate around their vertical axis', 'Make a sound when an earthquake hits'], aciklama: 'The columns on both sides of the mihrab niche can rotate, and they still turn despite the severe earthquakes.' },
  'y-aziziye': { soru: 'Which mosque burned in the fire in the Konya Bazaar in 1867?', secenekler: ['The Aziziye Mosque', 'The Süleymaniye Mosque (Istanbul)'], aciklama: 'The Aziziye and Kapu mosques burned; Governor Ahmet Tevfik Pasha asked the grand vizier for help to rebuild them.' },
  'y-uzun-seyh': { soru: 'What started the fire that burned the Uzun Şeyh Mosque in Konya in 2005?', secenekler: ['An electrical short circuit', 'A candle that tipped over'], aciklama: 'The mosque burned down except for its walls and minaret; it reopened for worship in October 2008.' },
  'y-iplikci': { soru: 'Where did the 1894 fire that damaged the İplikçi (Ambardar Kerim Ağa) Mosque in Akşehir start?', secenekler: ['In the yarn-maker shops around the mosque', 'In the mosque’s own dome'], aciklama: 'The mosque, damaged mainly in its domes, was repaired through the efforts of Akşehir Mufti Salim Efendi.' },
  'y-ibrahim-bey': { soru: 'What was done in 1859 in place of the İbrahim Bey (Çarşı) Mosque, which burned down completely in 1858?', secenekler: ['The people had a new, larger mosque built', 'The site was left empty'], aciklama: 'According to the foundation records, the people had a new mosque built in its place, enlarging its size.' },
  'y-sahip-ata': { soru: 'The Sahip Ata (Larende) Mosque was damaged by fire. Which parts have survived to today?', secenekler: ['The qibla wall, the mihrab and the crown portal', 'Only the minaret'], aciklama: 'Of the mosque badly damaged by fire, only the qibla wall, the mihrab and the crown portal have survived.' },
  'y-nalbantoglu': { soru: 'Which disaster heavily damaged the Nalbantoğlu Mosque in Bursa in 1518?', secenekler: ['A fire', 'A flood'], aciklama: 'The mosque was severely damaged in the fire of 1518 and the earthquake of 1855.' },
  's-kursunlu': { soru: 'For what were the lead sheets of the Kurşunlu Inn in Antakya probably stripped off when wars grew frequent?', secenekler: ['To make ammunition', 'To sell for the foundation’s income'], aciklama: 'The inventory says the lead was probably stripped for ammunition in the 18th–19th centuries, when fierce wars increased; the inn was also used as an arsenal for a time.' },
  's-alaeddin-dunya': { soru: 'What happened to the Sultan Alâeddin (Grand) Mosque in Konya during the World Wars?', secenekler: ['It was closed to worship', 'It was turned into a front-line hospital'], aciklama: 'According to the inventory the mosque was closed to worship during the war years; it was handed to the General Directorate of Foundations in 1952 and reopened.' },
  's-alaeddin-kale': { soru: 'What happened to Konya’s inner citadel during the Crusader siege of 1190?', secenekler: ['It could not be taken', 'It fell in three days'], aciklama: 'The inventory treats the failure to take the inner citadel as proof of how strong it was.' },
  's-nasuh': { soru: 'What was the Nasuh Bey Mosque in Konya used for after serving as a library in the Ottoman period?', secenekler: ['A military supply depot', 'A caravanserai'], aciklama: 'It later became a military supply depot and the municipality’s gas depot; it reopened for worship in 1977.' },
  's-selvili': { soru: 'According to the inscriptions of the Selvili Mosque in Antakya, who was the Abdullah who built or repaired it in 1873?', secenekler: ['A man who fell as a martyr in war', 'A merchant who went on pilgrimage'], aciklama: 'The inscriptions say the builder fell in war and that martyrs cannot be called dead; the building dates from a year after the great Antakya earthquake.' },
  's-yenisehir': { soru: 'The Yenişehir Mosque (1899) in Reyhanlı arose from which development?', secenekler: ['Forced settlement and the placing of refugees fleeing the 1877/78 Russo-Ottoman war', 'The celebration of a naval victory'], aciklama: 'Settling tribes and refugees fleeing the war raised the need for mosques, schools, baths and workplaces in the region.' },
  's-dursun': { soru: 'In what role did Dursun Fakih join the wars beside Osman Gazi?', secenekler: ['As imam, encouraging the fighters at the front', 'As army commander'], aciklama: 'The inventory records that he joined the wars as imam and encouraged the fighters.' },
  's-karpuzoglu': { soru: 'How did Kadı İzzeddin, founder of the Kadı İzzettin Mosque in Konya, die?', secenekler: ['He fell as a martyr in a battle against the Mongols near Aksaray', 'He was buried under rubble in an earthquake'], aciklama: 'The Seljuk vizier Kadı İzzeddin fell in the war against the Mongols near Aksaray.' },
  'sl-bulgur': { soru: 'Where were people with the itchy illness called “bulgurcuk” brought in Konya?', secenekler: ['To the Bulgur Dede Masjid (Bulgur Lodge)', 'To the Karatay Madrasa'], aciklama: 'According to İbrahim Hakkı Konyalı the sick were brought here in the belief they would find a cure; the lodge got its name from this.' },
  'sl-sakahane': { soru: 'According to Yusuf Küçükdağ, the mosque of which building is the Sakahane (Hıdır İlyas) Masjid in Konya?', secenekler: ['The infirmary (şifahane) built by Alâeddin Keykubad', 'A caravanserai'], aciklama: 'Küçükdağ says it was the masjid of the infirmary built by Alâeddin Keykubad; Konyalı writes that a benefactor, Davut Ağa, built it.' },
  'sl-karpuzoglu': { soru: 'Which health building besides the mosque is recorded in the foundation deed of the Kadı İzzettin Mosque in Konya?', secenekler: ['A dârüşşifa (hospital)', 'An ice well'], aciklama: 'The deed also lists a tomb, a madrasa and a dârüşşifa besides the mosque.' },
  'sl-sems': { soru: 'Why did people in Konya drink water from the well in the courtyard of Shams’s tomb on Saturdays?', secenekler: ['In hope of a cure', 'For a rain prayer'], aciklama: 'Sources say the water was drunk from a yellow bowl in hope of a cure and was said to ease heart flutter.' },
  'sl-seyh-isa': { soru: 'With what wish do visitors pray at the Sheikh İsa Tomb in Hatay?', secenekler: ['To find a cure for their illnesses', 'To be saved from drought'], aciklama: 'People who want a cure for their illnesses or wish to have children visit the tomb and pray.' },
  'sl-hamam': { soru: 'By what name is the Sahip Ata (Sultan) Bath in Konya also known?', secenekler: ['Şifa Sultan Bath', 'Hospital Bath'], aciklama: 'The bath is also known as Hamam-ı Sultanî, Larende Gate Bath and Şifa Sultan Bath.' },
  'k-hocacihan': { soru: 'How was the cistern filled to ease water shortage in the Hocacihan area, where the river dried in summer?', secenekler: ['With river water taken in spring', 'With water drawn from a well in summer'], aciklama: 'To ease the shortage when the river dried up in summer, the cistern was filled in spring with water from the river.' },
  'k-hocacihan-han': { soru: 'Which nearby building did the Hocacihan Cistern supply with water?', secenekler: ['The Hocacihan (Dibidelik) Inn', 'The Mevlâna Tomb'], aciklama: 'One notable feature of the cistern is that it supplied the nearby Hocacihan Inn with water.' },
  'k-sokullu': { soru: 'What were the fountains beside the crown gates of the Sokullu Mehmed Pasha Complex in Payas built for?', secenekler: ['To meet the travellers’ need for water', 'To heat the bath’s water'], aciklama: 'The ever-flowing fountains beside the north and south gates are always ready for travellers’ water needs.' },
  'k-affan': { soru: 'Whom does the 1926 fountain on the courtyard wall of the Affan (Ertuğrul) Mosque in Antakya give water to?', secenekler: ['To the thirsty', 'Only to the congregation'], aciklama: 'The fountain built in 1926 gives water to the thirsty.' },
  'k-hoca-fakih': { soru: 'Which water structures stand together with the Hoca Fakih Fountain in Konya on the same façade?', secenekler: ['A sebil and a cistern', 'A mill and a bath'], aciklama: 'The fountain stands together with a sebil and a cistern on the same façade.' },
  'k-hedbeli': { soru: 'Which water structures in the courtyard of the Hedbeli Masjid in Antakya serve the neighbourhood at all times?', secenekler: ['A fountain, a well and a sebil', 'A pool and a mill'], aciklama: 'The courtyard’s fountain, well and sebil serve the neighbourhood at all times.' },
}

/** Sorular: İngilizcedeyken metinleri İngilizce okunur (kimlik, tür ve doğru şık aynı). */
export const AFET_SORULARI: AfetSorusu[] = HAM_SORULAR.map((q) => (EN[q.id] ? iki(q, EN[q.id]) : q))
export const AFET_CEVIRI_EKSIK = HAM_SORULAR.filter((q) => !EN[q.id]).map((q) => q.id)

/**
 * Sıradaki soru: önce hiç sorulmamışlar (oyunlar arası, `onceki`), sonra bu oyunda sorulmamışların en eskisi.
 * Aynı oyunda bir soru asla iki kez gelmez; bütün sorular bu oyunda sorulduysa null (afet sorusuz vurur).
 */
export function afetSorusuSec(tur: AfetTuru, buOyunda: string[], tohum: number, onceki: string[] = []): AfetSorusu | null {
  const aday = AFET_SORULARI.filter((q) => q.tur === tur && !buOyunda.includes(q.id))
  if (!aday.length) return null
  const yeni = aday.filter((q) => !onceki.includes(q.id))
  if (yeni.length) return yeni[Math.abs(tohum) % yeni.length]
  return [...aday].sort((a, b) => onceki.indexOf(a.id) - onceki.indexOf(b.id))[0]
}
