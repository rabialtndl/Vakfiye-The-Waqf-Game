# Vakfiye · Vakıf Oyunu

KÖK&KOD Hackathonu · Tekinoğlu Fırın (Rabia Altundal, Eda Nur Polat, Feyza Biber)

"Vakfını kur, yüzyıllara bırak." Oyuncu bir vakıf kurar, 600 yıl boyunca felaketlere karşı ayakta tutmaya çalışır. Web'de (PWA) ve Android'de (Capacitor) aynı kodla çalışır.

## Dil / Language

Oyun Türkçe ve İngilizce oynanır. Ana menüde (oyunun ilk sayfası) ve Ayarlar'da **Türkçe / English** seçilir; seçim cihazda saklanır.
Metinler yerinde iki dilde yazılır: `L('Türkçe', 'English')` (`src/dil.ts`). Veri nesneleri (leveller, yapılar, esnaf, afet soruları) `iki(trNesne, { alan: 'English' })` ile çevrilir.
Bilgi sorularının İngilizcesi `src/veri/sorularEn.ts`, kuralların İngilizcesi `docs/RULES.md`. Envanterden gelen eser adları özgün (Türkçe) adlarıyla kalır.
Yeni metin eklerken iki dilini birlikte yaz; `src/veri/sorularEn.test.ts` her sorunun çevirisi olduğunu denetler.

## Çalıştırma

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # motor kabul testleri + denge testi
npm run build      # dist/ (web + PWA)
```

### Android APK

```bash
npm run build
npx cap add android      # yalnızca ilk sefer
npx cap sync android
npx cap open android     # Android Studio'da Build > Build APK
```

## Klasör yapısı

```
docs/                 Kurallar (v2), sayfa sayfa içerik, ekran görüntüleri. Bkz. docs/README.md
araclar/              Python denge simülasyonu (denge_sim.py)
src/motor/            Oyun motoru. Saf TypeScript, ekrana hiç dokunmaz.
  sabitler.ts         Bütün sayılar. Denge ayarı yalnızca burada yapılır.
  rng.ts              mulberry32 tohumlu rastgelelik.
  motor.ts            yeniOyun, turOyna, kararVer, sonucKarti, botlaOyna
  motor.test.ts       Kurallar bölüm 9'daki kabul testleri
  denge.test.ts       1000 tohumluk denge testi: dört ders doğru yönde mi
src/sahne/            Köy sahnesi. Yalnızca gösterir, hesap yapmaz.
  koySvg.ts           2B izometrik köy (yedek sahne)
  KoySahnesi.tsx      Motor durumunu sahneye çevirir, binalara dokunmayı yakalar
src/arayuz/           Ekranlar: Kurulum, Köy HUD'u, Karar penceresi, Sonuç
src/App.tsx           Ekranlar arası akış ve "karara kadar ilerle" zamanlayıcısı
```

Katman kuralı: **motor → arayüz → sahne**. Sahne ve arayüz sayı hesaplamaz, motorun döndürdüğü durumu gösterir. 3B sahne gelince yalnızca `src/sahne/` değişir.

## Kurallar ve denge

- Sunum tohumu **10**: varsayılan ayarlarla vakıf 600 yıla ulaşır (21 olay, 13 karar, 0 boş sandık). Aynı tohumla hamam 70 yapılırsa 160. yılda çöker.
- Katsayı değiştirirseniz `npm test` çalıştırın. Denge testi kırılırsa oyun yanlış dersi öğretiyor demektir.

## Tasarım

- Oyuncu için sade kurallar: [docs/KURALLAR.md](docs/KURALLAR.md) (oyundaki "Nasıl oynanır" sayfası bunu gösterir)
- Oyuncuya anlatılacak kurallar, kavramlar, öğretici ve 13 sayfanın içeriği: [docs/sayfa-sayfa-icerik.md](docs/sayfa-sayfa-icerik.md)
- Ekran akışı: [docs/img/ekran-akisi.png](docs/img/ekran-akisi.png)

## Durum

- [x] Motor ve testler
- [x] Kurulum, Köy, Karar, Sonuç ekranları
- [x] 2B izometrik köy sahnesi (yedek)
- [ ] 3B sahne (React Three Fiber) ve GLB assetler
- [ ] Bursa envanteri ve harita, "Gerçek eseri gör" bağlantısı
- [ ] Ses
- [x] Ana menü, öğretici, duraklat, nasıl oynanır (docs/KURALLAR.md), ayarlar, kolay mod, yıldız ve seviye
- [ ] Senaryo seçimi (gerçek Bursa vakfı) ve eser kartı bağlantısı
