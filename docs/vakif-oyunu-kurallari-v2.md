# Vakıf Oyunu — Oyun Kuralları ve Teknik Şartname · v2 (donduruldu)

> Bu dosya, Vakfiye uygulamasındaki **"Vakfını kur, yüzyıllara bırak"** simülasyonunun kesin kurallarıdır.
> Kaynak: *Vakfiye Mobil Prototipi — Adım Adım Demo Rehberi* (17 Eki 2026).
> Rehberde açık yazmayan kurallar **[NETLEŞTİRME]**, v2'de değişenler **[v2]** etiketiyle işaretlidir.
> Bölüm 9'daki kabul testi v2 değerleriyle yeniden hesaplandı. Uygulama bu testi geçmelidir.

### v2'de ne değişti (20 Eki 2026)
| Değişiklik | v1 | v2 | Neden |
|---|---|---|---|
| Onarım bedeli çarpanı | 1,1 | **0,9** | Onarmak kısmaktan daha mantıklı olsun. |
| "Hizmeti kıs" sonrası geri gelen hasar | %100 | **%85** (kalan %15 kalıcı kayıp) | "Hep kıs" stratejisi %95 ayakta kalıyordu; artık %46. |
| Varsayılan tohum | 1339 | **10** | Varsayılanla 600 yıla ulaşıyor, hamam 70'te 160. yılda çöküyor, hep kısan 560. yılda çöküyor. |
| 40. yıl satırındaki yazım hatası | "fon 39,6 bedele yetmiyor" | düzeltildi | Fon değil bedel. |
| Tur akışı | kıstan geri gelenler belirsiz | adım 1'de açıkça yazıldı | Karar ağacındaki eksik adım. |

Başka hiçbir sabit değişmedi. Simülasyon sonuçları bölüm 9'da.

---

## 1. Oyunun özü

- Oyuncu bir vakıf kurar. Gelir getiren mülkler (**akar**) vakfın sandığını besler, sandık bir hizmeti (**hayrat**) karşılar.
- Zaman **10 yıllık turlarla** ilerler. **Hedef 600. yıl**, yani 60 tur.
- Felaketlerde oyuncu karar verir. Vakıf ya 600 yıla ulaşır (**ayakta kaldı**) ya da hizmeti 3 tur üst üste ödeyemeyip **çöker**.
- Oyun **tohumlu ve deterministiktir**: aynı ayarlar ve aynı tohum her seferinde aynı sonucu verir.
- Oyun arayüzde "tarihsel esinli simülasyon" olarak sunulur, gerçek bir vakfın birebir hesabı değildir.

---

## 2. Sabitler (tek bir config dosyasında tutun)

> **v3 (23 Eki):** olay olasılıkları değişti, salgın ve iyi olaylar eklendi; güncel tablo §16'da. Aşağıdaki diğer sabitler aynıdır.

```json
{
  "TUR_YIL": 10,
  "HEDEF_YIL": 600,
  "SERMAYE_TOPLAM": 100,

  "MULKLER": {
    "hamam": { "gelir": 0.80, "bakim": 0.20 },
    "han":   { "gelir": 0.72, "bakim": 0.07 },
    "arazi": { "gelir": 0.36, "bakim": 0.00 },
    "nakit": { "katki": 0.02, "bakim": 0.00 }
  },

  "AMACLAR": {
    "asevi":   { "ad": "Aşevi",   "gider": 26 },
    "medrese": { "ad": "Medrese", "gider": 22 },
    "cesme":   { "ad": "Çeşme",   "gider": 12 }
  },

  "HAYRAT_BAKIM_ORANI": 0.05,

  "YEDEK_FON_MIN": 0,
  "YEDEK_FON_MAX": 50,
  "YEDEK_FON_ADIM": 5,

  "MUTEVELLI": {
    "durust":    { "ad": "Dürüst ama beceriksiz", "gelirCarpani": 1.00, "zimmet": false },
    "becerikli": { "ad": "Becerikli ama riskli",  "gelirCarpani": 1.05, "zimmet": true }
  },
  "ZIMMET_IHTIMAL": 0.15,
  "ZIMMET_ORAN": 0.60,
  "ZIMMET_ESIK_FON": 10,

  "OLAYLAR": [
    { "id": "deprem",    "ihtimal": 0.09 },
    { "id": "yangin",    "ihtimal": 0.09 },
    { "id": "kuraklik",  "ihtimal": 0.06 },
    { "id": "savas",     "ihtimal": 0.06 },
    { "id": "enflasyon", "ihtimal": 0.06 }
  ],

  "DEPREM_HAMAM": 0.80,
  "DEPREM_HAN": 0.40,
  "YANGIN_HAN": 0.60,
  "ENFLASYON_NAKIT": 0.40,
  "ENFLASYON_FON": 0.20,
  "ENFLASYON_GIDER_ARTIS": 0.12,

  "ONARIM_CARPANI": 0.9,
  "KIS_GERI_ORAN": 0.85,
  "KIS_GERI_GELIS_TUR": 4,
  "KIS_HIZMET_TUR": 2,
  "KIS_HIZMET_CARPANI": 0.5,

  "COKUS_ART_ARDA_BOS": 3,

  "VARSAYILAN": {
    "sermaye": { "hamam": 30, "han": 30, "arazi": 25, "nakit": 15 },
    "amac": "asevi",
    "yedekFonOrani": 20,
    "mutevelli": "durust",
    "tohum": 10
  }
}
```

---

## 3. Kurulum: dört karar

| Ayar | Seçenekler | Kural |
|---|---|---|
| **Sermaye** | Hamam · Han ve dükkân · Arazi · Nakit | Dört kaydırıcı, her biri 0–100 arası, **5'er adım** [NETLEŞTİRME]. Toplam tam olarak **100** olmalıdır. Değilse **"Vakfı kur" düğmesi pasif** kalır ve "Toplam: X/100" uyarısı görünür. |
| **Amaç** | Aşevi (26) · Medrese (22) · Çeşme (12) | Her turda sandıktan ödenmesi gereken **hizmet gideri**. |
| **Yedek fon şartı** | %0–%50, 5'er adım | Her turda gelirin bu payı **önce** fona ayrılır. |
| **Mütevelli** | Dürüst ama beceriksiz · Becerikli ama riskli | Becerikli: gelir ×1,05, ama zimmet riski taşır (bkz. 5.2). |

Kurulum ekranının altında küçük yazıyla şu satır görünür: `Tekrarlanabilir senaryo · tohum 10`.

### Mülk özellikleri

| Mülk | 1 birimin 10 yıllık geliri | 1 birimin bakımı | Neyle zarar görür |
|---|---|---|---|
| Hamam | 0,80 | 0,20 | Depremde %80'i yıkılır |
| Han, dükkân | 0,72 | 0,07 | Depremde %40'ı, yangında %60'ı yıkılır. Savaşta o turun geliri kesilir. |
| Arazi | 0,36 | yok | Kuraklıkta o turun geliri kesilir. **Hiç yıkılmaz.** |
| Nakit | Sandığa birim başına 0,02 katkı | yok | Enflasyonda %40'ı erir. Onarımda harcanabilir. |

Hamam en çok kazandıran ama en kırılgan mülktür. Arazi az kazandırır ama yıkılmaz.

---

## 4. Oyun durumu (state)

```ts
type OyunDurumu = {
  yil: number;                 // 0'dan başlar, her tur +10
  mulk: { hamam: number; han: number; arazi: number };  // TAM SAYI birim
  nakit: number;               // ondalıklı olabilir
  fon: number;                 // ondalıklı tutulur, ekranda yuvarlanır
  hizmetGideri: number;        // başta amacın gideri; enflasyonla kalıcı artar
  yedekFonOrani: number;       // 0..0.5
  mutevelli: "durust" | "becerikli";
  artArdaBos: number;          // üst üste ödenemeyen tur sayısı
  toplamBos: number;           // istatistik
  geriGelenler: GeriGelis[];   // "Hizmeti kıs" sonrası yavaşça geri gelen mülkler
  kisilmisHizmetTur: number;   // kalan yarım-hizmet tur sayısı
  kurulusSermayesi: { hamam; han; arazi; nakit };  // sonuç dersi için saklanır
  sonKotuOlay: string | null;  // "çöken olay" için
  olaySayisi: number;
  kararSayisi: number;
  kararlar: KararKaydi[];      // "en iyi karar" için
  gunluk: string[];            // ekrandaki olay günlüğü (en yeni üstte)
  bitti: boolean;
  sonuc: "ayakta" | "coktu" | null;
};

type GeriGelis = { mulk: "hamam" | "han"; birimPerTur: number; kalanTur: number; kalanToplam: number };
```

**Mülk birimleri her zaman tam sayıdır [NETLEŞTİRME].** Hasar hesabında ve kısmi onarımda sonuç **aşağı yuvarlanır** (`Math.floor`). Rehberdeki örnek oyun ancak bu kuralla tutar: 30×0,6 = 18, 22×0,6 = 13,2 → 13.

---

## 5. Bir tur (10 yıl): kesin sıra

> Rehberdeki 6 maddelik sıra kavramsal. Örnek oyunun sayıları **aşağıdaki gerçek sırayla** tutar [NETLEŞTİRME]. En önemli fark: deprem ve yangında **o turun geliri hasardan önceki mülklerle** hesaplanır, karar ise **o turun parası ödendikten sonra** sorulur.

```
1. ZAMAN        yil += 10
                [v2] KISTAN GERİ GELENLER: geriGelenler listesindeki her kayıt için
                    kalanTur == 1 ise kalanToplam'ın hepsini, değilse birimPerTur'u
                    mülke ekle; kalanToplam ve kalanTur'u azalt.
                yarimHizmet = (kisilmisHizmetTur > 0)   // bu turun adım 5'i için
                kisilmisHizmetTur > 0 ise bir azalt.

2. ZİMMET       r1 = rng()   // HER TURDA çekilir, mütevelli dürüst olsa bile (bkz. 8)
                mütevelli becerikli VE fon > 10 VE r1 < 0.15 ise:
                    kayip = fon × 0.60;  fon -= kayip
                    sonKotuOlay = "zimmet"; günlüğe yaz

3. OLAY         r2 = rng()   // HER TURDA çekilir
                kümülatif: [0,0.09) deprem · [0.09,0.18) yangın · [0.18,0.24) kuraklık
                           · [0.24,0.30) savaş · [0.30,0.36) enflasyon · [0.36,1) olay yok
                Turda en fazla bir olay çıkar.
                Enflasyon ise hemen uygula: nakit ×= 0.6; fon ×= 0.8; hizmetGideri ×= 1.12 (kalıcı)

4. GELİR        gelir = (hamam×0.80 + han×0.72 + arazi×0.36) × mütevelliÇarpanı
                savaş   → han terimi 0
                kuraklık→ arazi terimi 0
                fonPayi = gelir × yedekFonOrani
                fon += fonPayi

5. ÖDEMELER     bakim = hamam×0.20 + han×0.07 + hayratBakimi
                        hayratBakimi = hizmetGideri × 0.05        [NETLEŞTİRME, bkz. not]
                nakitKatki = nakit × 0.02
                hizmeteKalan = gelir − fonPayi − bakim + nakitKatki
                gereken = hizmetGideri × (yarimHizmet ? 0.5 : 1)

                hizmeteKalan ≥ gereken ise → ödendi, artArdaBos = 0
                                             (artan para BİRİKMEZ, o dönemde harcanmış sayılır)
                değilse açık = gereken − hizmeteKalan
                    fon ≥ açık ise → fon -= açık, ödendi, artArdaBos = 0
                    değilse        → fon = 0 (eldeki fon da harcanır),
                                     "Sandık boş: aşevi hizmet veremedi." yaz,
                                     artArdaBos += 1, toplamBos += 1

6. HASAR + KARAR  (yalnızca deprem ve yangında)
                deprem: hasarHamam = floor(hamam×0.80); hasarHan = floor(han×0.40)
                yangın: hasarHan   = floor(han×0.60)
                hasarToplam = hasarHamam + hasarHan  (0 ise karar sorulmaz)
                bedel = hasarToplam × 0.9                  [v2]
                → OYUN DURUR, karar penceresi açılır (bölüm 6)
                [v2] Bu turda vakıf zaten çöktüyse (artArdaBos ≥ 3) karar sorulmaz,
                doğrudan adım 7'ye geçilir. Çöken vakfa onarım sormak anlamsız.

7. ÇÖKÜŞ KONTROLÜ
                artArdaBos ≥ 3 ise → çöktü, bitti
                yil ≥ 600 ise      → ayakta kaldı, bitti
```

**Not: hayrat bakımı.** Rehberdeki para akışı şemasında bakım "6,0 + 2,1 + **1,3** = 9,4" yazıyor, ama mülk tablosunda bu 1,3'ün kaynağı yok. Örnek oyunun beş turu da ancak her turda bu sabit 1,3 düşülürse tutuyor. Aşevi gideri 26 × %5 = 1,3 olduğu için bunu **"hayratın binasının bakımı = hizmet giderinin %5'i"** olarak tanımladım. Feyza'ya teyit ettirin. Farklıysa yalnızca `HAYRAT_BAKIM_ORANI` değişir.

**Not: olay sayısı.** Deprem, yangın, kuraklık, savaş, enflasyon ve zimmet `olaySayisi`na eklenir ve `sonKotuOlay` alanını günceller.

---

## 6. Karar anı: deprem ya da yangın

Oyun durur ve üç seçenek görünür. Pencerenin başlığı olayı, alt satırı da `Onarım <bedel> birim · fon <fon> · nakit <nakit>` bilgisini gösterir.

| Seçenek | Ne zaman aktif | Sonucu |
|---|---|---|
| **Yedek fonu kullan** | `fon ≥ bedel` | `fon -= bedel`. Mülkler eski hâline döner, hasar yok sayılır. |
| **Nakitle onar** | `nakit > 0` | `harcanan = min(nakit, bedel)`; `nakit -= harcanan`; `oran = harcanan / bedel`. Her hasarlı mülk için: `yeni = floor(mevcut − hasar + hasar × oran)`. Onarılamayan kısım **kalıcı olarak kaybedilir.** |
| **Hizmeti kıs** | Her zaman | Hasar mülkten hemen düşülür. **[v2]** Hasarın yalnızca **%85'i** geri gelir: her hasarlı mülk için `geriToplam = floor(hasar × 0.85)`, `birimPerTur = floor(geriToplam / 4)`. **4 tur boyunca** her turun başında `birimPerTur` eklenir, son turda kalanın tamamı eklenir. Kalan %15 kalıcı kayıptır. Ayrıca **2 tur** boyunca hizmet gideri yarıya iner (`kisilmisHizmetTur = 2`). |

- Fon ve nakit **birlikte kullanılamaz**. Fon yetmiyorsa "Yedek fonu kullan" düğmesi pasif görünür.
- Pasif bir düğmenin altında nedeni yazar ("Fon yetmiyor: 17 / 32").
- Seçilen karar `kararlar` listesine kaydedilir: `{ yil, olay, secim, korunanBirim, harcanan }`. `kararSayisi` 1 artar.

---

## 7. Oyunun sonu ve sonuç kartı

### Bitiş koşulları
- **Çöküş:** Hizmet **3 tur üst üste** ödenemezse vakıf çöker. Son kötü olay, kartta **"çöken olay"** olarak yazılır.
- **Ayakta kalma:** `yil` 600'e ulaşırsa vakıf ayakta kalır.

### Sonuç kartının içeriği
1. **Başlık:** `Vakfın <yil> yıl yaşadı.` ya da `Vakfın 600 yıl ayakta kaldı.`
2. **Çöken olay:** yalnızca çöküşte (ör. "130. yıl · Deprem").
3. **İyi kararın:** `kararlar` içinde **korunanBirim** değeri en yüksek olan karar [NETLEŞTİRME, rehber "en iyi karar"ın nasıl seçileceğini söylemiyor]. Etiket: ayakta kalan vakıfta "Seni kurtaran karar", çöken vakıfta **"İyi kararın"**. Hiç karar yoksa bu satır gizlenir.
4. **Ders:** aşağıdaki tabloda **yukarıdan aşağı ilk tutan** durum seçilir.
5. **İstatistik satırı:** `<olaySayisi> olay · <kararSayisi> karar · sandık <toplamBos> kez boş kaldı`

| Sıra | Durum | Ders |
|---|---|---|
| 1 | Vakıf ayakta kaldı | Yedek fon ve dağılmış gelir kaynakları vakfı yüzyıllarca taşıdı. |
| 2 | Çöktü ve **yedek fon şartı < %15** | Yedek fon, iyi niyetten uzun yaşar. |
| 3 | Çöktü ve son kötü olay **zimmet** | Vakfı mütevellinin dürüstlüğü ayakta tutar. |
| 4 | Çöktü ve **kuruluşta** hamama, hana ya da araziye **45+ birim** verilmiş | Tek gelir kaynağına dayanan vakıf tek felakette çöker. |
| 5 | Diğer çöküşler | Hizmetin gideri, gelirin taşıyabileceğinden büyük olmamalı. |

- "Yedek fon %15'in altında" ifadesi, kurulumda seçilen **şart oranını** kasteder, o anki fon miktarını değil [NETLEŞTİRME].
- 4. satır **kuruluştaki** dağılıma bakar, o anki mülklere bakmaz. Araziyi de kapsar.

---

## 8. Rastgelelik ve tekrarlanabilirlik

- Tohumlu bir PRNG kullanın, örneğin `mulberry32(tohum)`. `Math.random()` **kullanılmaz**.
- **Her tur tam olarak 2 sayı çekilir:** önce `r1` (zimmet), sonra `r2` (olay). Mütevelli dürüst olsa ve zimmet zarı anlamsız olsa bile `r1` çekilir.
  - Bu sayede **aynı tohumla farklı ayarlar aynı olay dizisini görür.** Sunumdaki "hamamı 70 yap, aynı tohumla çöktüğünü göster" anı buna dayanıyor.
- Oyuncu kararları rastgelelik tüketmez.
- Rehberdeki örnek oyun (tohum 1339) eski prototipin PRNG'siyle üretildi; yeni kodda farklı olaylar çıkar. **[v2]** Sunum tohumu **10** seçildi. mulberry32 ile varsayılan ayarlarda:
  - Vakıf 600 yıla ulaşır: **21 olay · 13 karar · sandık 0 kez boş**. İlk karar 40. yılda deprem, fonla onarım.
  - Aynı tohumla hamam 70 (han 8, arazi 7, nakit 15) → **160. yılda çöker**.
  - Aynı tohumla her hasarda "Hizmeti kıs" → **560. yılda çöker**.
- mulberry32 referans uygulaması (JS ve Python aynı sayıları üretmeli):
  ```
  a = (a + 0x6D2B79F5) >>> 0; t = a;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  ```

---

## 9. Kabul testi [v2 değerleriyle yeniden hesaplandı]

Olayları **zorla verilen** (PRNG'siz) bir test modu yazın. Varsayılan ayarlarla (hamam 30, han 30, arazi 25, nakit 15, aşevi 26, fon %20, dürüst) şu sonuçlar çıkmalı (±0,05):

### Test A: ana senaryo (5 tur)
| Yıl | Zorla olay | Oyuncu kararı | Gelir | Hizmete kalan | Fon (tur sonu) | Mülk / nakit sonrası |
|---|---|---|---|---|---|---|
| 10 | savaş | — | 33,0 | 17,3 | **0** (açık 8,7 > fon 6,6 → sandık boş, artArdaBos=1) | değişmez |
| 20 | yok | — | 54,6 | 34,58 | 10,92 | değişmez, artArdaBos=0 |
| 30 | yangın | Yedek fonu kullan | 54,6 | 34,58 | 21,84 → **5,64** (bedel 18 × 0,9 = 16,2) | değişmez |
| 40 | deprem | Nakitle onar | 54,6 | 34,58 | **16,56** (fon 16,56, bedel 32,4'e yetmiyor) | hasar 24+12, bedel 32,4, nakit 15 → 0, oran 0,463. **Hamam 17, han 23** |
| 50 | yangın | Yedek fonu kullan | 39,16 | 25,02 | 16,56 + 7,83 − açık 0,98 = 23,41 → **11,71** (bedel floor(23×0,6)=13 × 0,9 = 11,7) | değişmez |

### Test B: "Hizmeti kıs" (6 tur)
10. yılda deprem, karar "Hizmeti kıs", sonra olay yok.
| Yıl | Gereken hizmet | Gelir | Fon (tur sonu) | Hamam / han (tur sonu) |
|---|---|---|---|---|
| 10 | 26 | 54,6 | 10,92 | hasar 24 + 12 düşer → **6 / 18**. Geri gelecek: hamam floor(24×0,85)=20 (5/tur), han floor(12×0,85)=10 (2/tur, son tur 4) |
| 20 | **13** (yarım) | 32,2 | 17,36 | 11 / 20 |
| 30 | **13** (yarım) | 37,64 | 24,89 | 16 / 22 |
| 40 | 26 | 43,08 | 33,50 | 21 / 24 |
| 50 | 26 | 49,96 | 43,50 | **26 / 28** (kalıcı kayıp 4 + 2) |
| 60 | 26 | 49,96 | 53,49 | 26 / 28 |

Ek birim testleri:
- Sermaye toplamı 95 ya da 105 iken "Vakfı kur" pasif olmalı.
- Fon 8 iken becerikli mütevellide zimmet **olmaz**, çünkü eşik fon > 10.
- Enflasyon sonrası hizmet gideri 26 → 29,12, ikinci enflasyonda → 32,61 (bileşik artış).
- Arazi hiçbir olayda birim kaybetmez.
- Aynı tohum ve aynı ayarlarla iki koşu, bayt bayt aynı günlüğü üretmeli.

### Denge kontrolü (otomatik simülasyon)
Tohum 1–1000 ile botla oynatın. Bot kuralı: hasarda önce fonla onar, fon yetmezse nakitle onar, nakit de yoksa kıs. Ağırlıklı dağılımlar: seçilen mülk 70, diğer iki mülk 8 ve 7, nakit 15. Diğer ayarlar varsayılan.

v1 ve v2 sonuçları (mulberry32, tohum 1–1000; 1001–2000 ile de aynı sıralama çıktı):

| Ders | v1 | **v2** | Doğru dersi veriyor mu |
|---|---|---|---|
| Fon %0 / %20 / %40 | %37 / %53 / %68 | **%3 / %63 / %76** | Evet, fon arttıkça hayatta kalma artıyor |
| Dengeli / hamam 70 / han 70 / arazi 70 | %53 / %47 / %47 / %30 | **%63 / %57 / %48 / %33** | Evet, dengeli en iyisi |
| Dürüst / becerikli | %53 / %36 | **%63 / %39** | Evet |
| Aşevi / medrese / çeşme | %53 / %76 / %100 | **%63 / %85 / %100** | Evet, büyük amaç daha zor |
| Hep onaran / **hep kısan** | %53 / **%95** ✗ | **%63 / %46** ✓ | v1'de ters ders veriyordu, v2'de düzeldi |

Otomatik testte şu sıralamalar korunmalı: dengeli > her ağırlıklı dağılım; fon %0 < %20 < %40; dürüst > becerikli; aşevi < medrese ≤ çeşme; hep onaran > hep kısan. Bozulursa katsayılar yeniden ayarlanmalı.

---

## 10. Arayüz

### Ekran 1: "Vakfını kur"
- Açıklama: "Sermayeyi paylaştır, amacını ve şartını seç. Zaman on yıllık adımlarla akar."
- 4 sermaye kaydırıcısı ve canlı "Toplam X/100" göstergesi.
- Amaç seçimi (açılır liste): `Aşevi (26)` vb.
- Yedek fon kaydırıcısı ve alt yazısı: "Şart: gelirin bu payı yedek fona ayrılır".
- Mütevelli seçimi.
- **"Vakfı kur"** düğmesi.
- Altta: `Tekrarlanabilir senaryo · tohum <n>`.

### Ekran 2: Oyun
- Üst şerit, üç kutu: **YIL · YEDEK FON · NAKİT** (tam sayıya yuvarlanmış).
- Düğmeler:
  - **Karara kadar ilerle:** Bir karar anına ya da oyunun sonuna kadar turları art arda oynatır. Her tur arasında ~150 ms animasyon.
  - **+10 yıl:** tek tur.
  - **Yeniden kur:** kurulum ekranına döner. Ayarlar ve tohum korunur.
- **Günlük** (en yeni üstte), her satır `<yıl>. yıl · <mesaj>` biçiminde. Kötü olaylar kırmızı yazılır. Örnek mesajlar:
  - `Vakıf kuruldu: aşevi için, gelirin %20'i yedek fona.`
  - `Savaş: kervan yolu kapandı.`
  - `Sandık boş: aşevi hizmet veremedi.`
  - `Çarşıda yangın: han ve dükkânlar yandı.`
  - `Yedek fonla onarıldı (20).`
- Karar anında oyun durur ve karar kartı günlüğün üstünde açılır (bölüm 6).
- "Sandık boş" olduğunda üst şeritte uyarı sayacı görünür: `Sandık boş: 1/3`.

### Ekran 3: Sonuç kartı
Bölüm 7'deki içerik, altında **"Yeniden kur"** ve **"Paylaş"** düğmeleri.

### Erişilebilirlik
- Bütün düğmeler klavyeyle kullanılabilir.
- Karar kartı açılınca odak ilk aktif seçeneğe gider.
- Günlük `aria-live="polite"`. Sonuç kartı açılınca başlık okunur.
- Büyük yazı ve yüksek kontrast ayarlarına uyum.

### Uygulamanın geri kalanıyla bağlantı
- Hayır ağı ekranındaki **"Bu vakfı oyunda yönet"** oyunu açar. Sermaye o vakfın gerçek mülk türlerine göre önceden doldurulmuş gelebilir.
- Pasaportta zincir ya da rota tamamlanınca Vakıf Oyunu senaryosu açılır.

---

## 11. Kapsam dışı (yapılmayacak)
- Çok oyunculu mod, skor tablosu, hesap/oturum.
- Fazla paranın birikmesi. **Yedek fon dışında para birikmez.**
- Aynı turda birden fazla olay.
- Fon ve nakitin birlikte harcandığı karma onarım.

---

## 11b. Kolay mod [v2, 21 Eki]
Ayarlar'dan seçilir, ilk oyunlar için varsayılandır. Olay zarları **değişmez** (aynı tohum aynı olayları verir); yalnızca:
- gelir × `KOLAY_GELIR_CARPANI` (1,1),
- çöküş için `COKUS_ART_ARDA_BOS + 1` = 4 tur üst üste boş sandık,
- karar penceresinde ipucu satırı.

1000 tohumla: dengeli %83 (normalde %63), hamam 70 %66, fon %0 %10, becerikli %63. Dersler aynı yönde kalır (denge testinde kontrol ediliyor).

## 12. Kararlar [v2]
Aşağıdakiler varsayılan olarak kabul edildi ve kod bunlara göre yazılacak. Ekipten itiraz gelirse yalnızca ilgili sabit değişir:
1. Hayrat bakımı = hizmet giderinin **%5'i** (`HAYRAT_BAKIM_ORANI`).
2. Sermaye ve yedek fon kaydırıcıları **5'er adım**.
3. "En iyi karar" = **en çok birim koruyan karar**.
4. Becerikli mütevellinin ×1,05'i nakit katkısına **uygulanmaz**.
5. Sunum tohumu **10**.


## 13. Şehir genişlemesi [v2, 22 Eki]

Kod: `src/motor/sehir.ts`. Testler: `src/motor/sehir.test.ts`.

- **İnşa kasası (`artan`)**: 5. adımda hizmet tam ödendiyse `hizmeteKalan − gereken` kasaya eklenir. Kasa yalnızca inşaya harcanır; onarıma, açığa ya da hizmete gitmez. Enflasyonda nakit gibi %40 erir. Başlangıç değeri `kesifBagisi` (pasaport pulu başına 5, en çok 30).
- **Bölgeler**: çarşı 50. yıl / 1 pul, mahalle 150 / 2, köyler 250 / 3, kervan yolu 350 / 4. Hangisi önce gelirse.
- **Arsalar** [22 Eki, harita]: her arsa haritada çizili tek bir yapıdır. Çarşı: arasta, bedesten, kümbet; mahalle: vakıf evleri, sıbyan mektebi; köyler: köprü, değirmen (köprü gerekir); kervan yolu: kervan yolu.
- **Gelir ve bakım** (çarpanlardan önce, 4. adımın gelirine eklenir; bakım 5. adımın bakımına eklenir):

| Yapı | Maliyet | Gelir | Bakım | Olay |
|---|---|---|---|---|
| Arasta | 25 | 6 (+2 kervansaray varsa) | 0,6 | yangında 0 |
| Bedesten | 50 | 10 | 1 | savaşta 0 |
| Vakıf evleri | 20 | 4 (×1,5 mektep varsa) | 0,4 | depremde 0 |
| Değirmen | 30 | 5 | 0,6 | kuraklıkta 0 |
| Köprü | 20 | arazi tabanının %20'si | 0,5 | kuraklıkta 0 |
| Kümbet | 20 | 3 (ziyaretçi bağışı) | 0,5 | |
| Kervan yolu | 40 | hanın o turki gelirinin %25'i; arasta +2 | 2 | savaşta 0 |
| Sıbyan mektebi | 15 | (evleri güçlendirir) | 1,5 | |

- **Denge**: hiç inşa etmeyen oyuncunun oyunu birebir aynıdır (tohum 10: 21 olay, 13 karar, ayakta). Kasası yettikçe sırayla inşa eden bot 300 tohumda %61'den %75'e çıkar; oyun hâlâ kaybedilebilir.
- **Arayüz**: binalar zemin karesi olmadan doğrudan haritanın üstünde durur (görseller `public/binalar/`; görseli olmayan yeni yapı, envanterdeki gerçek eserin fotoğrafıyla madalyon olarak görünür). Köy görünümü vakfın ilk binalarını yakından gösterir; "Şehri gör" bütün haritayı gösterir (sürükle, + / −). Kilitli bölgeler bulutla örtülü ve açılış koşulu yazılı. Yeni bölge açılınca duyuru çıkar. Arsa paneli maliyeti, etkiyi, kurulamama nedenini ve envanterdeki gerçek örneği gösterir.

### 13b. Harita [23 Eki]

Sahne, minyatür üslubunda tek bir şehir resmidir (`public/harita.webp`, 1536×1024; yapı alanları `src/sahne/harita.ts`). Zemin karesi yoktur. Vakfa ait yapılar (seçilen hizmet binası, hamam, han, tarlalar, sandık ve kurulan yeni yapılar) renkli; diğerleri SVG filtresiyle soluk. Sandık boş kalınca hizmet binası ve sandık da soluklaşır. Deprem hasarı, yangın, kuraklık ve savaş alanların üstüne efektle çizilir. Kilitli bölgede yalnızca bir tabela durur.


## 14. Sezon mini oyunu ve bilgi soruları [v2, 23 Eki]

Elle oynanan her tur ("+10 yıl") öncesinde isteğe bağlı bir sezon (`src/sezon.ts`, testler `src/sezon.test.ts`). Motora tek bir sayı geçer: `turOyna(d, sezonBonusu)`, `0 ≤ sezonBonusu ≤ SEZON_BONUS_EN_COK = 0,2`. Bonus yalnızca o turun gelir çarpanına girer: `gelir × (1 + bonus)`. Zar (rng), olay ve karar akışı aynı kalır; bonus 0 iken tur bit bit aynıdır (test).

- **Süre:** 30 sn (süresiz modda 10 kişi, sabır sınırı yok).
- **Harita düzeni [23 Eki]:** sezon haritanın üstünde oynanır (`src/sahne/SezonKatmani.tsx`). Hasat balonları mülklerin, yardım keseleri `KESE_YERLERI`'nin (8 yol noktası) üstünde çıkar. Ürün düğmesi ürünü hazırlayıp arabaya yükler (en çok 3); "Yola çık" arabayı `ARABA_YOLU[amac]` boyunca hayrata gönderir (gidiş 2,4 sn, dönüş 1,8 sn). Varınca her ürün onu bekleyen en eski kişiye verilir, isteyeni olmayan boşa gider. Kişiler %75 açık bir ürün ister.
- **Yardım kesesi:** 3,5–5,5 sn arayla boş bir yol noktasında çıkar, 3,5 sn kalır; toplanırsa hasada sayılır.
- **Hasat istasyonları:** `mulk > 0` olan hamam/han/arazi + gelir getiren yapılar. Hazır olunca 4 sn bekler. Arazi ve değirmen 2 buğday verir.
- **Kişiler:** 2,2–4 sn arayla, sırada en çok 4. Sabır 12 sn − (zorluk−2) + pul başına 0,5 sn (en çok +3).
- **Menü (hayrat başına 3 ürün):** ilki her zaman açık; diğerleri eser kartı okununca (`ilerleme.okunan`) açılır. Ekmek, buğday üreten bir istasyon varsa 1 buğday harcar.

| Hayrat | Ürünler (eser) |
|---|---|
| Aşevi | Çorba (Orhan Bey Külliyesi), Ekmek (Reyhanlı Yenişehir Değirmeni), Su (Hoca Fakih Çeşmesi) |
| Medrese | Ders (İnce Minareli Medrese), Kitap (Dolap Mektep Mescidi), Ekmek |
| Cami | Kandil (Sultan Alâeddin Camii), Su, Ekmek |
| Çeşme | Su, Testi (Samandağ Vakıflı Köyü), Sıcak su (Sahip Ata Hamamı) |

- **Pasaport pulu:** pulu olan eserin ürünü yarı sürede hazırlanır.
- **Puan:** `hasat = toplanan / kaçan+toplanan` (balon + kese), `hizmet = verilen / verilen+giden` (sezon sonunda bekleyenler sayılmaz; boşa giden ürün puanı düşürmez ama zaman kaybettirir). `bonus = 0,2 × (0,5·hasat + 0,5·hizmet)`. İstasyon yoksa hasat = hizmet.
- **Bilgi sorusu:** 3 sezonda bir (2., 5., 8. ...). Soru bankası `src/veri/sorular.json`, `araclar/soru_bankasi.py` ile envanterin "kaynakli" olgularından üretilir (kitap + sayfa). Eserin adını ele veren bilgiler alınmaz. Doğru cevap `bagisEkle(d, 5)`: inşa kasasına 5 akçe.
- Öğreticide sezon yoktur. Ayarlar: `sezonOyunu`, `sezonSuresiz`.


## 15. Leveller [v2, 23 Eki]

Levelin motora etkisi yalnızca ayarlardır (`src/leveller.ts`): `amac` sabit, `tohum` sabit (senaryo), `hedefYil` (bu yıla ayakta varınca oyun `ayakta` biter; verilmezse 600). `levelNo` ve `yapiHedefi` yalnız arayüz içindir. Sabitler ve tur sırası değişmez.

| No | Amaç | Hedef yıl | Yapı hedefi | Tohum | Eser |
|---|---|---|---|---|---|
| 1 | aşevi | 200 | 0 | 192 | orhan-gazi-kulliyesi |
| 2 | çeşme | 300 | 1 | 539 | hoca-fakih-cesmesi-konya |
| 3 | medrese | 400 | 2 | 437 | sokullu-mehmet-pasa-kulliyesi-hatay |
| 4 | cami | 500 | 3 | 237 | habib-i-neccar-camii-ve-kulliyesi-hatay |

- **Tohum seçimi:** 1–500 arası tohumlar inşa eden bot (`botlaOyna(a, 'onaran', true)`, normal zorluk, varsayılan sermaye) ile tarandı. Bot ayakta kalmalı ve yapı hedefini tutturmalı. Aralarından levelin temasına en uygun olan seçildi: L2'de 30 turda 9 kuraklık, L3'te 8 yangın ve 4 savaş, L4'te 40. yılda ilk deprem ve toplam 12 deprem (`src/leveller.test.ts`).
- **Geçme:** `sonuc === 'ayakta'` ve yeni yapı sayısı ≥ `yapiHedefi`. Geçilmezse yıldız en çok 1.
- **Açılma:** L1 her zaman; Ln, L(n−1) geçildiyse ya da pasaportta id'si `-<il>` ile biten bir pul varsa. Serbest oyun (eski oyun: 600 yıl, tohum 10, amaç seçilir) her zaman açık.
- **Ödül:** geçilen levelin eseri albüme eklenir; `ilerleme.leveller[no]` en iyi yıldızı tutar.
- **Sezon zorluğu = level no** (serbest 2): `zorluk ≥ 3` menüye 4. ürün ekler (aşevi testi, medrese su, cami kitap, çeşme ekmek); sabır `12 − max(0, z−2)` sn; geliş aralığı `× (1 − 0,08·(z−1))`.


## 16. Olay tablosu v3, tarihi olaylar ve çarşı [23 Eki]

**Neden:** oyuncular "sürekli deprem oluyor" dedi. Deprem ve yangın seyreldi, salgın ve üç iyi olay eklendi; denge 1000 tohumda yeniden ölçüldü.

| Olay | v2 | v3 | Etki |
|---|---|---|---|
| Deprem | %9 | %7 | aynı (karar) |
| Yangın | %9 | %8 | aynı (karar) |
| Kuraklık | %6 | %6 | aynı |
| Savaş | %6 | %6 | aynı |
| Enflasyon | %6 | %5 | aynı |
| Salgın | – | %7 | han geliri ×0,4; o turun hizmet gideri ×1,5; karar yok |
| Bereketli yıl | – | %5 | arazi geliri ×2 |
| Kervan mevsimi | – | %4 | han geliri ×1,5 |
| Hayırsever bağışı | – | %3 | yedek fona +6 |

İyi olaylar `olaySayisi`'na girmez, günlükte yeşil yazılır. **Denge (1000 tohum, onaran bot):** dengeli %68 (v2 %63), hamam ağırlıklı %66, han %46, arazi %41, fon %0 %10, fon %40 %82, becerikli %47, kolay %89, hep kısan %59. Dersler aynı yönde (`denge.test.ts`). Sunum tohumu 10: 24 olay, 9 karar, ilk karar 40. yılda yangın. Ders tohumu 116: dengeli ayakta, hamam 70 ile 150. yılda çöker, hep kısan çöker.

**Tarihi olaylar:** levelin `takvim` yılı ve kaynaklı `tarih` listesi (`src/leveller.ts`). Takvim yılı, onu içine alan tura düşer: `tur = ⌈(yıl − takvim) / 10⌉ × 10`. Motor `Ayarlar.tarihiOlaylar` ile o turda zarı yine çeker ama olayı listeden alır; diğer turlar zarla. Kart (`TarihKarti`) oyunu durdurur; kapanınca karar varsa karar penceresi, yoksa akış sürer. Rastgele ilk salgında bir kez TDV "Tâun" maddesine dayanan bilgi kartı çıkar.

| Level | Takvim | Yıl → olay | Kaynak |
|---|---|---|---|
| 1 Bursa | 1340 | 1402 savaş (Timur ordusu Bursa'da), 1413 yangın (Karamanoğlu kuşatması, Orhan Gazi Camii yandı) | Belleten 214; TDV Orhan Gazi Külliyesi |
| 2 Konya | 1600 | 1606 savaş (Celâlî isyanları), 1832 savaş (Konya Muharebesi), 1873 kuraklık (1873–75 kıtlığı) | Küre; Wikipedia; Marmara Üniv. |
| 3 Hatay | 1580 | 1822 deprem (Halep depremi), 1872 deprem (Amik depremi) | Wikipedia |
| 4 Hatay | 1500 | 1822 deprem, 1853 deprem (Habib-i Neccar yıkıldı), 1872 deprem | Wikipedia |

Level tohumları v3 tablosu ve tarihi olaylarla yeniden tarandı (inşa eden bot ayakta + yapı hedefi): L1 192 (ilk karar 40. yıl), L2 539 (7 kuraklık), L3 437 (8 yangın, 4 savaş), L4 237 (8 deprem; inşa etmeyen çöker).

**Çarşı (esnaf):** `src/esnaf.ts`. Her 30 yılda bir haritada sıradaki esnaf belirir, 20 yıl bekler; dokununca kaynaklı hikâye (Ahilik, Şükran Mescidi dükkânları, Avârız vakfı, Lonca) ve `bagisEkle(3)`. Her hikâye oyunda bir kez. Yollarda süs olarak dolaşan yolcular hareketi azalt açıkken gizlenir.


## 17. Afet müdahalesi [23 Eki]

Yangın ve deprem kararında "Yangına koş / Enkaza koş" düğmesi, salgın turunda (tarih kartından sonra) teklif kartı. Mini oyun `src/mudahale.ts` (saf, testli), harita katmanı `src/sahne/MudahaleKatmani.tsx`, roller ve kaynaklar `src/roller.ts`. Kamera olay yerine yakın çekim yapar (`odakKadraj`, haritanın içinde kalır).

- **Süre 20 sn.** Başarı oranı `kurtarılan / (kurtarılan + kaybedilen)`; süre bitince elde kalanlar sayılmaz.
- **Yangın:** alev 1,5 sn arayla (en çok 6), her 2,2 sn büyür (1→3); en büyük hâlde 2,5 sn kalırsa yayılır. Dokunuş 1 kova (6 kova), çeşmeden dolar. 1720 öncesi takvimde rolün adı "Kova zinciri".
- **Deprem:** enkaz 1,9 sn arayla (en çok 5), 3 dokunuşta kalkar, 7 sn'de çöker; yarısının altında insan.
- **Salgın:** hasta 1,8 sn arayla (en çok 5), ateşi saniyede 0,09 artar, 1'e varınca ağırlaşır; 3 yatak, yatakta 3 sn'de iyileşir.
- **Motor:** `mudahaleEt(d, oran)` bekleyen kararın hasarını `×(1 − 0,5·oran)` yapar, bedeli yeniden hesaplar, karar başına bir kez. `salginHafiflet(d, oran)` salgının fazladan giderinin (`gereken − gereken/1,5`) `oran` kadarını yedek fona koyar, tur başına bir kez. Zar ve olay sırası değişmez.
- Ayar: `mudahale` (varsayılan açık). Öğreticide yok.
