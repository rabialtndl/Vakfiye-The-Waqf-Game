# Kurallar: bütün ayrıntılar (ekip için)

## Amacın

Bir vakıf kur ve **600 yıl** ayakta tut. Vakfının bir hizmeti var: aşevi, medrese, cami ya da çeşme. Bu hizmet hiç aksamasın.

## 1. Vakfını kur

- Elinde **100 altın** var. Onu dört yere dağıt: **hamam**, **han**, **arazi** ve **nakit**.
- **Hamam** çok kazandırır ama depremde yıkılır.
- **Han** iyi kazandırır ama yangından ve savaştan etkilenir.
- **Arazi** az kazandırır ama hiç yıkılmaz.
- **Nakit** kazandırmaz ama zor günde onarım yapmana yarar.
- Gelirinin bir kısmını **yedek fona** ayır. Yedek fon kötü günlerin kumbarasıdır.
- Bir **mütevelli** (yönetici) seç. Dürüst olan güvenlidir. Becerikli olan biraz fazla kazandırır ama bazen kumbaradan para çalar.

## 2. Zamanı ilerlet

- **▶ OYNA** yılları kendi kendine akıtır. Zor bir an gelince durur, kararını verince kaldığı yerden devam eder. **+10 yıl** yalnızca bir tur oynatır.
- Her tur para aynı yolu izler: **mülkler kazandırır → kumbaraya pay ayrılır → binaların bakımı ödenir → kalan para hizmete gider.**
- Ekranın altındaki şerit her turda bu yolu sana gösterir.

## 3. Zor anlarda karar ver

**Deprem** ya da **yangın** olunca oyun durur ve sana sorar:

| Seçenek | Ne olur |
| --- | --- |
| **Fonla onar** | Her şey eski haline döner. Kumbara azalır. |
| **Nakitle onar** | Nakdin yettiği kadar onarılır, gerisi kaybolur. |
| **Hizmeti kıs** | Para harcamazsın. Binalar yavaş yavaş geri gelir ama bir kısmı kaybolur. Bir süre hizmet yarım verilir. |

Diğer olaylar kendiliğinden olur, karar sormaz:

| Olay | Ne olur |
| --- | --- |
| **Kuraklık** | Tarlalar o tur ürün vermez. |
| **Savaş** | Kervan yolu kapanır, han o tur kazandırmaz. |
| **Enflasyon** | Nakit ve fon erir, hizmetin gideri kalıcı olarak artar. |
| **Salgın** | Kervan gelmez, han geliri azalır; hayrata ihtiyaç artar, o turun gideri %50 fazla. |
| **Bereketli yıl** | Tarlalar iki kat ürün verir. |
| **Kervan mevsimi** | Han %50 fazla kazandırır. |
| **Hayırsever bağışı** | Yedek fona bağış girer. |

**Her olay bir kez** (her zaman): bir olay oyunda en çok bir kez yaşanır, tarihî olanlar dahil. Levelin tarihte yaşayacağı olay zarla erkenden gelmez; aynı türden birden çok tarihî olay varsa biri oyunda olay olur, diğerleri yalnız "Tarihten" notu olarak görünür (ör. Antakya'da 1853 depremi olay, 1822 ve 1872 not). **Araları 30 yıl** (Ayarlar): zarla gelen iki olay arasında en az 30 yıl sakin geçer.

## 3a. Afet anı: soruyu bil, afeti söndür

Yangın, deprem ya da salgın olunca kamera olay yerine yaklaşır, altta bir şerit çıkar ve **iki şıklı, kaynaklı kısa bir soru** sorar (ör. "Tulumbacı Ocağı hangi yıl kuruldu? 1720 / 1453").

- **Doğru:** afet hemen söner. Hasar ve onarım bedeli yarıya iner; salgında fazladan gider yedek fona döner.
- **Yanlış:** doğru cevap, kısa açıklaması ve kaynağı gösterilir; **bir can gider** ve afet tam vurur.
- **Her levelde soru var; sorulan soru tekrar gelmez.** Önce hiç sorulmamış sorular gelir (oyunlar arası hatırlanır); bir oyunda aynı soru asla iki kez çıkmaz. Şu an 34 kaynaklı soru var. Bir afet türünün bütün soruları o oyunda sorulduysa afet sorusuz vurur, can gitmez.
- **Kuraklık ve savaşta da soru:** bilirsen imaret ya da mahallenin avârız vakfı yardım eder, yedek fona 6 akçe.
- **Can:** her oyun 3 ❤️ ile başlar (Kalfa rütbesinde 4). Her yüzyıl bir can geri gelir. Can kalmadıysa soru sorulmaz, afet tam vurur.
- Sonra her zamanki karar gelir (fonla onar / nakitle onar / hizmeti kıs).

Sorular `src/veri/afetSorulari.ts` içindedir (TDV İslâm Ansiklopedisi, Wikipedia). Ayarlardan "Afet sorusu" kapatılırsa afet olunca doğrudan karar penceresi açılır.

**Rütbe (Ahilik sırası).** Doğru cevaplar oyunlar arasında birikir ve kalıcı ayrıcalık açar:

| Rütbe | Doğru cevap | Ayrıcalık |
| --- | --- | --- |
| 🔰 Çırak | 0 | Soruyu bilirsen afet söner |
| 🪣 Kalfa | 3 | Oyuna bir fazla canla başlarsın (4 ❤️) |
| 🛠️ Usta | 6 | Doğru cevapta hayırseverler vakfa +3 akçe bağışlar |
| 🏅 Ahi | 10 | İlk yanlışta can gitmez: bir soru hakkı daha |

**Bina olayı haritada yaşar:**

- **Yangın:** binada lekeli is ve kor ışığı, çatıda titreyen alevler, duman ve kıvılcım. Soru bilinince alevler söner, kararmış iz kalır.
- **Deprem:** bina kırılmış gibi kayar, çatlaklar, toz bulutu ve moloz yığınları.
- **Salgın:** han solgun, gri-yeşil bir renge döner; kuraklıkta tarlalar kavrulur.
- Onarılmayan hasar haritada kalır; onarınca düzelir. Elle çizilmiş durum görselleri `public/durumlar/` klasörüne eklenebilir (bkz. `docs/durum-gorselleri.md`).

**Şehrin insanları:** kasabada 12 köylü (su taşıyan, pazarcı, hamal, âlim, aşçı, çocuk, yüklü eşekli köylü...) yol ağında gerçek zamanlı yürür: kavşakta döner, köprüden geçer, çeşme, aşevi, cami önü, pazar ve hanın önünde durur; bina ve nehrin içinden geçmez. Kapalı aşevinin önünde durulmaz, kuru çeşmeden su alınmaz, salgında meydan boşalır. Ayrıntı: `docs/npc.md`.

## 3a. Meydan okuma (Paylaş)

Sonuç ekranındaki **MEYDAN OKU** bir paylaşım kartı (harita, yıldızlar, yıl, ders, rütbe) ve bir bağlantı hazırlar. Paylaş (telefonun paylaşma menüsü), Bağlantıyı kopyala ve Kartı indir düğmeleri vardır; istersen adını yazarsın.

Bağlantıyı açan arkadaşın ana menüsünde "X sana meydan okuyor!" daveti çıkar. **Kabul edince aynı leveli aynı afetlerle oynar, level kilitli olsa bile.** Sonunda iki sonuç yan yana gösterilir (önce yıldız, eşitse yaşanan yıl): kazandın / berabere / kaybettin. Kazanan da geri meydan okuyabilir. Bağlantı yalnızca level, yıldız, yıl ve isteğe bağlı adı taşır; sunucu gerekmez (`src/meydan.ts`).

## 3a. Kendiliğinden açılan pencere yok

- **Tarihten:** o yıl gerçekten yaşanmış olay oyunu durdurmaz; sol üstte küçük bir "📜 Tarihten · 1413 Karamanoğlu kuşatması" levhası çıkar, dokununca okunur, 40 yıl sonra kalkar.
- **Şehrin insanları (bilgi yerleri):** haritada yerinde duran, adı üstünde yazan kişiler: Lonca (çarşı başı), Dükkâncı (Şükran Mescidi dükkânları), Ahi (debbağ dükkânı), Bezzaz (bedesten), Kervancı (han kapısı; kervansaray), Avârız vakfı (mahalle meydanı), Mütevelli (vakıf sandığı; vakfiye nedir). Ayaklarının altında altın bir halka parlar. Dokununca kaynaklı bilgi; ilk okunuşta çoğu +3 akçe; okunanlar ✓.
- **Renkler düğmesi:** canlı = senin vakfının yapıları; soluk = başka vakıfların binaları ya da kurmadığın arsalar; renksiz-kurak = açılmamış bölgeler; kendi binan soluklaşırsa sandık boş kalmıştır.
- **Kümbet:** binanın kendisine dokunulur ("Kümbet nedir?", gerçek türbe örnekleri); arsa açıkken kurma panelinde de "Kümbet nedir?" açılır.
- **Karardan sonra oyun durur:** OYNA düğmesi "▶ DEVAM · istersen önce yapı kur" olur; yıllar sen basınca akar. Yıllar daha yavaş akar (tur ≈ 1 sn; köşedeki ▶/▶▶/▶▶▶ ile değişir).
- **Köşe düğmeleri:** 🔊 ses (Web Audio ile sentezlenmiş kısa sesler: afet, doğru, yanlış, para, kurma), ▶▶ hız, ⚙️ ayarlar.
- **+10 yıl** tek bir tur oynatır; envanter sorusunu soran hayırsever her 50 yılda sandığın yanında belirir.
- **Kurarken olay gelmez:** bir yapıya ya da arsaya dokununca zaman durur; afet anında paneller kapanır ve yeni panel açılmaz, ekranda tek şey olur.
- **Bilgi sorusu (envanter):** kendiliğinden açılmaz; sandığın başında bir hayırsever (📜) belirir, dokunursan sorar. Sorulan soru bir daha gelmez.

## 3a. Tarihten ve çarşıdan

- Her level gerçek bir yılda başlar (örneğin Bursa 1340). Üstteki sayaç takvim yılını gösterir.
- O şehirde o yıllarda **gerçekten yaşanmış** bir olayın yılı gelince oyun durur ve "Tarihten" kartı çıkar: ne olduğu, oyunda neye karşılık geldiği ve kaynağı. Örneğin 1413'te Karamanoğlu kuşatması (Bursa), 1873–75 Orta Anadolu kıtlığı (Konya), 1853'te Habib-i Neccar Camii'nin yıkılması (Antakya).
- Vakfın henüz ulaşmadığı (kilitli) yerler haritada neredeyse renksiz, kurak ve çatlak topraklı görünür. Uzaklaşınca kasabanın çevresi bozkırdır.
- Haritada vakfa ait olmayan yerlere dokunulabilir: köprü (kaynaklı gerçek köprü örnekleri), su değirmeni (envanterdeki Reyhanlı Yenişehir Değirmeni), başka vakfın çeşmesi, camisi, medresesi, aşevi (envanterdeki gerçek örnekleri).

## 3b. Vakfın büyüsün: köyden şehre

- Hizmetin parası ödendikten sonra **artan para yapı parasına** girer. Bu para yalnızca yeni yapı kurmaya harcanır.
- Vakıf köyle başlar. Zaman geçtikçe çevresi açılır: **Çarşı** (50. yıl), **Mahalle** (150. yıl), **Köyler** (250. yıl), **Kervan yolu** (350. yıl).
- Harita, minyatür üslubunda bir şehirdir. **Vakfına ait yapılar renkli**, henüz kurulmamış ya da başka vakıflara ait olanlar soluk görünür. Vakfın büyüdükçe şehir renklenir.
- **"Şehri gör"** bütün haritayı gösterir. Sarı **+** tabelalı soluk yapıya dokun ve kur.

| Yapı | Ne yapar | Dikkat |
| --- | --- | --- |
| **Arasta** | Esnafa kiralanan dükkânlar, her tur kira | Yangında o tur kira gelmez |
| **Bedesten** | Yüksek kira, yangına dayanıklı | Savaşta o tur kira gelmez |
| **Vakıf evleri** | Az ama düzenli kira | Depremde o tur kira gelmez |
| **Sıbyan mektebi** | Vakıf evlerinin kirası %50 artar | Bakımı var |
| **Kümbet** | Vakfın kurucusunun kümbeti; ziyaretçiler her tur bağış bırakır | Olaylardan etkilenmez |
| **Köprü** | Arazi geliri %20 artar, değirmen kurulabilir | Bakımı var |
| **Değirmen** | Köylerin buğdayını öğütür | Kuraklıkta durur |
| **Kervan yolu** | Han geliri %25, arastanın kirası artar | Savaşta etkisi yok |

**Gerçek dünyada keşfet:** Vakfiye pasaportuna pul aldıkça bölgeler beklemeden açılır (1 pul çarşı, 2 mahalle, 3 köyler, 4 kervan yolu). Her pul yeni vakfına 5 akçe bağışlar, en çok 30. "Keşif" düğmesi hangi bölgenin ne zaman açılacağını gösterir.

## Leveller

Her level envanterdeki gerçek bir vakfın şehrinde geçer. Kurallar aynıdır; değişen hizmet, hedef ve olayların sıklığıdır.

| Level | Şehir · hizmet | Hedef | Öne çıkan zorluk |
|---|---|---|---|
| 1 · İlk aşevi | Bursa · aşevi | 200 yıl | Öğrenme leveli |
| 2 · Kurak yıllar | Konya · çeşme | 300 yıl, 1 yeni yapı | Kuraklık sık |
| 3 · Yol üstünde medrese | Hatay · medrese | 400 yıl, 2 yeni yapı | Yangın ve savaş |
| 4 · Deprem şehri | Hatay · cami | 500 yıl, 3 yeni yapı | Deprem çok sık ve erken |

- Leveli geçince levelin dayandığı eserin kartı **albümüne** girer ve sonraki level açılır.
- O şehirden bir eserin **pasaport pulunu** aldıysan o şehrin levelleri beklemeden açılır.
- Hedef yıla ayakta varıp yapı hedefini tutturamazsan level geçilmez (en çok 1 yıldız).
- **Serbest oyun** her zaman açık: hizmeti sen seçersin, hedef 600 yıl.

## 4. Kaybetme

Hizmetin parası **3 tur üst üste** ödenemezse vakıf çöker.

**Kolay mod** (Ayarlar'dan seçilir): mülkler %10 fazla kazandırır, çöküş için 4 tur gerekir ve karar anlarında ipucu çıkar. İlk oyunlar için önerilir.

## 5. Kazanma ve yıldızlar

| Yıldız | Ne zaman |
| --- | --- |
| ⭐ | 300. yıla ulaştın |
| ⭐⭐ | 600. yıla ulaştın |
| ⭐⭐⭐ | 600. yıla ulaştın ve sandık hiç boş kalmadı |

Topladığın yıldızlar seviyeni yükseltir.

## Dört altın kural

1. Paranı tek bir yere yatırma, dağıt.
2. Kumbaraya mutlaka pay ayır.
3. Mütevelliyi dürüstlüğüne göre seç.
4. Hizmeti gelirinin taşıyabileceği kadar büyük tut.

## Bilmen gereken kelimeler

| Kelime | Anlamı |
| --- | --- |
| Vakıf | Bir hayrın hep sürmesi için ayrılan mal ve onu yöneten kurum |
| Vakfiye | Vakfın kuruluş belgesi; kurulum ekranı senin vakfiyendir |
| Akar | Vakfa gelir getiren mülkler: hamam, han, arazi, arasta, bedesten, vakıf evleri, değirmen |
| Hayrat | Halka ücretsiz hizmet veren yapı: aşevi, medrese, cami, çeşme |
| Şart | Vakfı kuranın koyduğu kural; burada kumbaraya ayrılan pay |
| Mütevelli | Vakfı yöneten kişi |
| Zimmet | Yöneticinin vakfın parasını kendine alması |
| Tohum | Olayların sırasını belirleyen sayı; aynı tohum aynı hikâyeyi verir |

## Binalar nereden geliyor?

Oyundaki her bina, Vakıf Katılım envanterindeki gerçek bir eser örnek alınarak çizildi. Binaya dokununca "İlham kaynağı" kartında o eseri görürsün:

| Oyundaki bina | İlham kaynağı |
|---|---|
| Hamam | Sahip Ata (Sultan) Hamamı, Konya |
| Han | Zazadin (Sadeddin Köpek) Hanı, Konya |
| Aşevi | Orhan Bey Külliyesi, Bursa |
| Medrese | İnce Minareli Medrese, Konya |
| Cami | Sultan Alâeddin Camii, Konya |
| Çeşme | Hoca Fakih Çeşmesi, Konya |
| Arasta | Şükran Mescidi zemin kat dükkânları, Konya |
| Bedesten | Cağalzade Bedesteni, Ereğli (Konya) |
| Vakıf evleri | Samandağ Vakıflı Köyü vakıf konutu, Hatay |
| Değirmen | Reyhanlı Yenişehir Değirmeni, Hatay |
| Kümbet | Emir Nurettin (Sephevan) Kümbeti, Konya |
| Kervan yolu | Kanuni Sultan Süleyman Kervansarayı, Belen (Hatay) |
| Sıbyan mektebi | Dolap Mektep Mescidi, Konya |
